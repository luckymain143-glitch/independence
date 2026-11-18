import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { submitEnquiry } from '../services/firestoreService';
import type { EnquiryRecord, WebsiteSettings } from '../types';

interface ContactViewProps {
  settings: WebsiteSettings;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [enquiryType, setEnquiryType] =
    useState<EnquiryRecord['enquiryType']>('Business Enquiry');
  const [state, setState] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanMob = mobile.replace(/\D/g, '');
    if (cleanMob.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitEnquiry({
        name,
        mobile: cleanMob,
        email,
        enquiryType,
        state,
        message,
      });
      setSubmittedId(id);
      setName('');
      setMobile('');
      setEmail('');
      setState('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');

  return (
    <div className="bg-slate-50 min-h-[75vh]">
      <div className="bg-[#0F2447] text-white py-12 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wider text-amber-300 mb-2">
            CORPORATE DESK &amp; CHANNEL SUPPORT
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Contact Us &amp; Business Enquiries
          </h1>
          <p className="text-sm text-slate-200 max-w-2xl">
            Reach our Dealership, C&amp;F Agency, Super Stockist, and Distributor support desks
            across India.
          </p>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configured Contact Info */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="font-display text-xl font-bold text-[#0F2447]">
              Corporate Contact Details
            </h2>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Registered Office Address</p>
                <p className="text-sm text-slate-800 mt-0.5">{settings.officeAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#0F2447] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Business Email</p>
                <p className="text-sm text-slate-800 mt-0.5">{settings.contactEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Corporate Helpline</p>
                <p className="text-sm text-slate-800 mt-0.5">{settings.contactPhone}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">WhatsApp Business Support</p>
              {cleanWa.length >= 10 ? (
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#15803D] text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                </a>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  WhatsApp Support Number: NOT CONFIGURED. Administrators can set the official
                  WhatsApp number in Website Management.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Enquiry Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <h2 className="font-display text-xl font-bold text-[#0F2447]">
              Submit Business or Support Enquiry
            </h2>

            {submittedId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Enquiry Submitted Successfully</p>
                  <p className="mt-0.5">
                    Reference: <span className="font-mono-tabular">{submittedId}</span>. Our
                    regional desk will review your message.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number *
                </label>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  maxLength={160}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enquiry Desk *
                </label>
                <select
                  value={enquiryType}
                  onChange={(e) =>
                    setEnquiryType(e.target.value as EnquiryRecord['enquiryType'])
                  }
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Business Enquiry">Business Enquiry</option>
                  <option value="Franchise Enquiry">Franchise Enquiry</option>
                  <option value="Dealership Support">Dealership Support</option>
                  <option value="C&F Support">C&amp;F Support</option>
                  <option value="Distributor Support">Distributor Support</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                State / Union Territory (Optional)
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="">Select State / UT</option>
                {INDIA_LOCATIONS.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message / Enquiry Details *
              </label>
              <textarea
                required
                rows={4}
                minLength={5}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your territory, business background, or support request..."
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566] disabled:opacity-60"
            >
              {submitting ? 'Sending Enquiry...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
