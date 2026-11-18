import React, { useState } from 'react';
import { CheckCircle2, Clock, FileWarning, Search, ShieldCheck } from 'lucide-react';
import { lookupTrackingRecord } from '../services/firestoreService';
import {
  APPLICATION_WORKFLOW_STEPS,
  OPPORTUNITY_LABELS,
  type TrackingRecord,
} from '../types';

interface TrackViewProps {
  initialRefId?: string;
}

export const TrackView: React.FC<TrackViewProps> = ({ initialRefId = '' }) => {
  const [refId, setRefId] = useState(initialRefId);
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'result'>('input');
  const [challengeHint, setChallengeHint] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [smsConfigured, setSmsConfigured] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [last4Input, setLast4Input] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<TrackingRecord | null>(null);

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanRef = refId.trim().toUpperCase();
    const cleanMob = mobile.replace(/\D/g, '');

    if (!/^[A-Z0-9-]{6,40}$/.test(cleanRef)) {
      setError('Enter a valid Application Reference ID (e.g. IND-DLR-2026-123456).');
      return;
    }
    if (cleanMob.length < 10) {
      setError('Enter your registered 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tracking/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationRefId: cleanRef, mobile: cleanMob }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not initiate mobile verification.');
        return;
      }
      setSmsConfigured(Boolean(data.smsConfigured));
      setChallengeHint(data.challengeHint || data.message || '');
      setChallengeToken(data.challengeToken || '');
      setStep('verify');
    } catch {
      setError('Network error while initiating verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanRef = refId.trim().toUpperCase();
    const cleanMob = mobile.replace(/\D/g, '');

    setLoading(true);
    try {
      const verifyRes = await fetch('/api/tracking/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationRefId: cleanRef,
          mobile: cleanMob,
          otpCode: otpInput,
          last4Confirm: last4Input,
          challengeToken,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        setError(verifyData.error || 'Mobile verification failed.');
        return;
      }

      const found = await lookupTrackingRecord(cleanRef, cleanMob);
      if (!found) {
        setError(
          'No application matched this Reference ID and Mobile Number combination. Please double-check your receipt.'
        );
        return;
      }
      setRecord(found);
      setStep('result');
    } catch {
      setError('Unable to verify and retrieve tracking record.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setStep('input');
    setRecord(null);
    setOtpInput('');
    setLast4Input('');
    setChallengeToken('');
    setError('');
  };

  const formatTimestamp = (ts: unknown): string => {
    if (!ts) return 'Recorded';
    if (typeof ts === 'string') return new Date(ts).toLocaleString('en-IN');
    if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
      return new Date((ts as { seconds: number }).seconds * 1000).toLocaleString('en-IN');
    }
    return 'Recorded';
  };

  return (
    <div className="bg-slate-50 min-h-[75vh]">
      <div className="bg-[#0F2447] text-white py-12 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wider text-amber-300 mb-2">
            PRIVACY-PROTECTED STATUS PORTAL
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Track Your Application
          </h1>
          <p className="text-sm text-slate-200 max-w-2xl">
            Verify your Application Reference ID and registered mobile number to inspect current
            processing stage, pending documents, and official remarks.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {step === 'input' && (
          <form
            onSubmit={handleRequestVerification}
            className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-2 text-[#0F2447]">
              <Search className="w-5 h-5" />
              <h2 className="font-display text-xl font-bold">Locate Application</h2>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Application Reference ID *
                </label>
                <input
                  required
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value.toUpperCase())}
                  placeholder="IND-DLR-2026-123456"
                  className="w-full px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered Mobile Number *
                </label>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566] disabled:opacity-60"
            >
              {loading ? 'Preparing Verification...' : 'Proceed to Mobile Verification'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form
            onSubmit={handleVerifyAndFetch}
            className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-2 text-[#0F2447]">
              <ShieldCheck className="w-5 h-5 text-[#15803D]" />
              <h2 className="font-display text-xl font-bold">Mobile Verification</h2>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              {challengeHint}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {error}
              </div>
            )}

            {smsConfigured ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit SMS OTP *
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-48 px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Last 4 Digits of Your Registered Mobile *
                </label>
                <input
                  required
                  type="text"
                  maxLength={4}
                  value={last4Input}
                  onChange={(e) => setLast4Input(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Last 4 digits"
                  className="w-48 px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566]"
              >
                {loading ? 'Verifying...' : 'Verify & View Status'}
              </button>
              <button
                type="button"
                onClick={resetSearch}
                className="px-4 py-2.5 border border-slate-300 text-sm font-medium rounded-lg"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {step === 'result' && record && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs text-slate-500">Application Reference Number</p>
                <h2 className="font-mono-tabular text-2xl font-bold text-[#0F2447]">
                  {record.applicationRefId}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {OPPORTUNITY_LABELS[record.category]} · {record.district}, {record.state} ·
                  Submitted {formatTimestamp(record.submittedAt)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">Current Stage</p>
                <p
                  className={`text-sm font-bold ${
                    record.status === 'Approved'
                      ? 'text-[#15803D]'
                      : record.status === 'Rejected'
                        ? 'text-red-700'
                        : 'text-[#EA580C]'
                  }`}
                >
                  {record.status}
                </p>
              </div>
            </div>

            {/* Approved Admin Communication */}
            {record.publicRemarks && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Official Onboarding Communication
                </p>
                <p className="text-sm text-slate-800">{record.publicRemarks}</p>
              </div>
            )}

            {/* Pending Documents */}
            {record.pendingDocuments && record.pendingDocuments.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <FileWarning className="w-4 h-4" />
                  <span>Pending Documents Requested</span>
                </div>
                <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
                  {record.pendingDocuments.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Workflow Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F2447]">Status Timeline</h3>
              <div className="space-y-2.5">
                {record.timeline.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {item.status === 'Approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#0F2447] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{item.status}</span>
                        <span className="text-xs font-mono-tabular text-slate-500">
                          {new Date(item.changedAtIso).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.remark}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9-Stage Overview Indicator */}
            <div className="border-t border-slate-200 pt-5">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Standard 9-Stage Evaluation Sequence
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {APPLICATION_WORKFLOW_STEPS.map((st, idx) => (
                  <span
                    key={st}
                    className={`px-2.5 py-1 rounded border ${
                      st === record.status
                        ? 'bg-[#0F2447] text-white border-[#0F2447] font-semibold'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {idx + 1}. {st}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={resetSearch}
              className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Track Another Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
