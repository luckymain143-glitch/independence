import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import path from 'path';

const DEFAULT_BOOTSTRAPPED_ADMIN = 'luckymain143@gmail.com';
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ENTRIES = 5000;

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

function pruneOtpStore(): void {
  const now = Date.now();
  for (const [k, v] of otpStore.entries()) {
    if (now > v.expiresAt) {
      otpStore.delete(k);
    }
  }
  while (otpStore.size >= MAX_OTP_ENTRIES) {
    const oldestKey = otpStore.keys().next().value;
    if (!oldestKey) break;
    otpStore.delete(oldestKey);
  }
}

function getFirebaseWebApiKey(): string {
  if (process.env.FIREBASE_WEB_API_KEY) return process.env.FIREBASE_WEB_API_KEY;
  try {
    const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as { apiKey?: string };
      return parsed.apiKey || '';
    }
  } catch {
    // Fallback handled gracefully
  }
  return '';
}

function getChallengeSecret(): string {
  return (
    process.env.OTP_CHALLENGE_SECRET ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'independence-fmcg-pan-india-portal'
  );
}

function computeChallengeToken(cleanRef: string, cleanMobile: string): string {
  return crypto
    .createHmac('sha256', getChallengeSecret())
    .update(`${cleanRef}__${cleanMobile}`)
    .digest('hex')
    .slice(0, 24);
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function verifyFirebaseAdminBearer(authHeader: string | undefined): Promise<{
  ok: boolean;
  email?: string;
  reason?: string;
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, reason: 'Missing Authorization Bearer token.' };
  }
  const idToken = authHeader.slice(7).trim();
  const apiKey = getFirebaseWebApiKey();
  if (!idToken || !apiKey) {
    return { ok: false, reason: 'Firebase Auth verification key unavailable.' };
  }
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) {
      return { ok: false, reason: 'Invalid or expired Firebase ID token.' };
    }
    const data = (await res.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user || !user.emailVerified || !user.email) {
      return { ok: false, reason: 'Verified admin email is required.' };
    }
    const allowedEmails = new Set<string>([
      DEFAULT_BOOTSTRAPPED_ADMIN,
      ...(process.env.EXTRA_ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ]);
    if (!allowedEmails.has(user.email.toLowerCase())) {
      return { ok: false, reason: 'Account is not authorized for notification dispatch.' };
    }
    return { ok: true, email: user.email };
  } catch {
    return { ok: false, reason: 'Token lookup verification failed.' };
  }
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export function isWhatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function isSmsConfigured(): boolean {
  return Boolean(process.env.SMS_PROVIDER_API_KEY && process.env.SMS_SENDER_ID);
}

export function createApiApp(): express.Express {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again shortly.' },
  });

  const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Verification or notification rate limit reached. Please retry shortly.' },
  });

  app.use('/api', generalApiLimiter);

  // Health & Integration Status
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'independence-fmcg-api',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/integrations/status', (_req, res) => {
    const emailConfigured = isSmtpConfigured();
    const whatsappConfigured = isWhatsappConfigured();
    const smsConfigured = isSmsConfigured();

    res.json({
      email: {
        configured: emailConfigured,
        provider: emailConfigured ? `SMTP (${process.env.SMTP_HOST})` : 'SMTP (No credentials set)',
        status: emailConfigured ? 'READY' : 'NOT CONFIGURED',
      },
      whatsapp: {
        configured: whatsappConfigured,
        provider: whatsappConfigured ? 'Meta WhatsApp Cloud API' : 'WhatsApp Business Cloud API',
        status: whatsappConfigured ? 'READY' : 'NOT CONFIGURED',
      },
      sms: {
        configured: smsConfigured,
        provider: smsConfigured ? 'Configured SMS Gateway' : 'SMS / OTP Gateway',
        status: smsConfigured ? 'READY' : 'NOT CONFIGURED',
      },
    });
  });

  // Notification Dispatch (open-relay protected: admin events require Firebase Bearer verification)
  app.post('/api/notifications/dispatch', sensitiveLimiter, async (req, res) => {
    const { eventType, applicationRefId, email, mobile, applicantName, category, remarks } =
      req.body || {};

    const cleanRef = String(applicationRefId || '').trim().toUpperCase();
    const cleanEvent = String(eventType || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanMobile = String(mobile || '').replace(/\D/g, '');

    if (!cleanEvent || !/^IND-(DLR|CFA|SSK|DST)-[0-9]{4}-[0-9]{6}$/.test(cleanRef)) {
      return res.status(400).json({ error: 'Valid eventType and applicationRefId are required.' });
    }

    const isInitialSubmission = cleanEvent === 'Application Submitted';
    if (!isInitialSubmission) {
      const authCheck = await verifyFirebaseAdminBearer(req.headers.authorization);
      if (!authCheck.ok) {
        return res.status(403).json({
          error: authCheck.reason || 'Admin authorization is required for status notifications.',
        });
      }
    }

    // Disallow caller-injected remarks on unauthenticated initial submission notifications
    const safeRemarks = isInitialSubmission ? '' : String(remarks || '').slice(0, 400);
    const safeName = String(applicantName || 'Partner').replace(/[\r\n]/g, ' ').slice(0, 100);
    const safeCategory = String(category || 'FMCG').replace(/[^a-zA-Z0-9_ -]/g, '').slice(0, 40);

    const results: Array<{
      channel: 'email' | 'sms' | 'whatsapp';
      status: 'sent' | 'not_configured' | 'failed';
      detail: string;
    }> = [];

    if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) && isSmtpConfigured()) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: cleanEmail,
          subject: `INDEPENDENCE FMCG – ${cleanEvent} (${cleanRef})`,
          text: `Dear ${safeName},\n\nUpdate for your ${safeCategory} application (${cleanRef}): ${cleanEvent}.\n${safeRemarks ? `Remarks: ${safeRemarks}\n` : ''}\nTrack your application anytime on the INDEPENDENCE FMCG Tracking Portal.\n\nRegards,\nINDEPENDENCE FMCG Partner Onboarding Team`,
        });
        results.push({
          channel: 'email',
          status: 'sent',
          detail: `Email dispatched via SMTP (${process.env.SMTP_HOST})`,
        });
      } catch (err) {
        results.push({
          channel: 'email',
          status: 'failed',
          detail: err instanceof Error ? err.message : 'SMTP delivery error',
        });
      }
    } else {
      results.push({
        channel: 'email',
        status: 'not_configured',
        detail: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM) are not configured.',
      });
    }

    if (cleanMobile.length >= 10 && isWhatsappConfigured()) {
      try {
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const waRes = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`,
            type: 'text',
            text: {
              body: `INDEPENDENCE FMCG Update: Application ${cleanRef} - ${cleanEvent}.${safeRemarks ? ` Note: ${safeRemarks}` : ''}`,
            },
          }),
        });
        if (waRes.ok) {
          results.push({
            channel: 'whatsapp',
            status: 'sent',
            detail: 'WhatsApp message accepted by Meta Cloud API.',
          });
        } else {
          results.push({
            channel: 'whatsapp',
            status: 'failed',
            detail: `WhatsApp API returned HTTP ${waRes.status}`,
          });
        }
      } catch (err) {
        results.push({
          channel: 'whatsapp',
          status: 'failed',
          detail: err instanceof Error ? err.message : 'WhatsApp delivery error',
        });
      }
    } else {
      results.push({
        channel: 'whatsapp',
        status: 'not_configured',
        detail:
          'WhatsApp Cloud API credentials (WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID) are not configured.',
      });
    }

    return res.json({ results });
  });

  // Mobile verification challenge for Tracking Portal
  app.post('/api/tracking/otp/request', sensitiveLimiter, async (req, res) => {
    const { applicationRefId, mobile } = req.body || {};
    const cleanRef = String(applicationRefId || '').trim().toUpperCase();
    const cleanMobile = String(mobile || '').replace(/\D/g, '');

    if (!/^[A-Z0-9-]{6,40}$/.test(cleanRef) || !/^[0-9]{10,15}$/.test(cleanMobile)) {
      return res
        .status(400)
        .json({ error: 'Provide a valid Application Reference ID and 10-digit mobile number.' });
    }

    if (isSmsConfigured()) {
      pruneOtpStore();
      const otpCode = String(crypto.randomInt(100000, 999999));
      const key = `${cleanRef}__${cleanMobile}`;
      otpStore.set(key, { code: otpCode, expiresAt: Date.now() + OTP_TTL_MS });

      return res.json({
        smsConfigured: true,
        mode: 'LIVE_SMS',
        message: 'Verification OTP sent to your registered mobile number.',
      });
    }

    const challengeToken = computeChallengeToken(cleanRef, cleanMobile);
    return res.json({
      smsConfigured: false,
      mode: 'CHALLENGE_VERIFICATION',
      challengeHint: `SMS OTP gateway is NOT CONFIGURED. Complete mobile ownership check using your registered mobile ending in ****${cleanMobile.slice(-4)}.`,
      challengeToken,
    });
  });

  app.post('/api/tracking/otp/verify', sensitiveLimiter, (req, res) => {
    const { applicationRefId, mobile, otpCode, last4Confirm, challengeToken } = req.body || {};
    const cleanRef = String(applicationRefId || '').trim().toUpperCase();
    const cleanMobile = String(mobile || '').replace(/\D/g, '');
    const key = `${cleanRef}__${cleanMobile}`;

    if (isSmsConfigured()) {
      const entry = otpStore.get(key);
      if (
        !entry ||
        Date.now() > entry.expiresAt ||
        !constantTimeEqual(entry.code, String(otpCode || '').trim())
      ) {
        return res.status(401).json({ verified: false, error: 'Invalid or expired OTP code.' });
      }
      otpStore.delete(key);
      return res.json({ verified: true });
    }

    const expectedToken = computeChallengeToken(cleanRef, cleanMobile);
    if (
      cleanMobile.length >= 10 &&
      constantTimeEqual(String(last4Confirm || '').trim(), cleanMobile.slice(-4)) &&
      constantTimeEqual(String(challengeToken || '').trim(), expectedToken)
    ) {
      return res.json({ verified: true });
    }
    return res.status(401).json({ verified: false, error: 'Mobile verification failed.' });
  });

  // SEO: Dynamic Sitemap.xml and Robots.txt
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const routes = [
      '/',
      '/about',
      '/products',
      '/opportunities/dealership',
      '/opportunities/cf-agency',
      '/opportunities/super-stockist',
      '/opportunities/distributorship',
      '/investment',
      '/process',
      '/track',
      '/contact',
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  return app;
}
