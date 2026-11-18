import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileText, Trash2, Upload } from 'lucide-react';
import { submitPartnerApplication, validateFileMagicBytes } from '../services/firestoreService';
import type {
  InvestmentSetting,
  OpportunityCategory,
  Territory,
  UploadedDocumentInput,
  WebsiteSettings,
} from '../types';
import { OPPORTUNITY_LABELS } from '../types';
import type { AppRoute } from './Header';
import { LocationSelector } from './LocationSelector';

interface OpportunityApplicationViewProps {
  category: OpportunityCategory;
  investment: InvestmentSetting;
  settings: WebsiteSettings;
  territories: Territory[];
  onNavigate: (route: AppRoute) => void;
}

const DOC_SLOTS_BY_CATEGORY: Record<OpportunityCategory, string[]> = {
  dealership: [
    'Identity Proof',
    'Address Proof',
    'PAN Card',
    'GST Details (if applicable)',
    'Business Documents (if applicable)',
    'Property Documents (if applicable)',
  ],
  cf_agency: [
    'Authorized Signatory Identity Proof',
    'Address Proof',
    'Company / Applicant PAN Card',
    'GST Registration Certificate',
    'Company Registration / Incorporation Proof',
    'Warehouse Ownership / Lease Document',
  ],
  super_stockist: [
    'Identity Proof',
    'Address Proof',
    'PAN Card',
    'GST Details',
    'Godown Ownership / Lease Document',
    'Business Documents',
  ],
  distributorship: [
    'Identity Proof',
    'Address Proof',
    'PAN Card',
    'GST Details (if applicable)',
    'Shop / Godown Documents',
    'Business Documents (if applicable)',
  ],
};

export const OpportunityApplicationView: React.FC<OpportunityApplicationViewProps> = ({
  category,
  investment,
  settings,
  territories,
  onNavigate,
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState({
    state: '',
    district: '',
    city: '',
    pinCode: '',
  });
  const [preferredTerritory, setPreferredTerritory] = useState('');

  // Category-specific dynamic business fields
  const [fields, setFields] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<UploadedDocumentInput[]>([]);
  const [docUploadError, setDocUploadError] = useState('');

  // Anti-spam check
  const [spamSeed] = useState(() => ({
    a: Math.floor(2 + Math.random() * 7),
    b: Math.floor(1 + Math.random() * 8),
  }));
  const [spamAnswer, setSpamAnswer] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [receipt, setReceipt] = useState<{
    applicationRefId: string;
    category: OpportunityCategory;
  } | null>(null);

  const setField = (key: string, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const docSlots = useMemo(() => DOC_SLOTS_BY_CATEGORY[category], [category]);

  const handleFileSelect = async (docType: string, file: File | null) => {
    setDocUploadError('');
    if (!file) return;

    const allowed: UploadedDocumentInput['mimeType'][] = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (!allowed.includes(file.type as UploadedDocumentInput['mimeType'])) {
      setDocUploadError('Invalid file type. Only PDF, JPG, PNG, or WEBP files are accepted.');
      return;
    }

    const magicCheck = await validateFileMagicBytes(file);
    if (!magicCheck.valid) {
      setDocUploadError(magicCheck.reason || 'File header failed verification.');
      return;
    }

    if (file.size > 550 * 1024) {
      setDocUploadError(
        `File "${file.name}" exceeds the 550 KB per-document limit. Please compress and retry.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setDocuments((prev) => [
        ...prev.filter((d) => d.docType !== docType),
        {
          docType,
          fileName: file.name,
          mimeType: file.type as UploadedDocumentInput['mimeType'],
          fileSize: file.size,
          dataUrl,
          file,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (docType: string) => {
    setDocuments((prev) => prev.filter((d) => d.docType !== docType));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10 || cleanMobile.length > 15) {
      setSubmitError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[0-9]{6}$/.test(location.pinCode)) {
      setSubmitError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (Number(spamAnswer) !== spamSeed.a + spamSeed.b) {
      setSubmitError('Anti-spam verification answer is incorrect. Please check the sum.');
      return;
    }
    if (!consentChecked) {
      setSubmitError('Please confirm accuracy of information and privacy policy consent.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitPartnerApplication({
        category,
        applicantName,
        mobile: cleanMobile,
        email,
        state: location.state,
        district: location.district,
        city: location.city,
        pinCode: location.pinCode,
        preferredTerritory:
          preferredTerritory || `${location.city}, ${location.district}, ${location.state}`,
        businessDetails: fields,
        documents,
      });
      setReceipt({ applicationRefId: res.applicationRefId, category });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to submit application. Please review all fields and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="bg-slate-50 min-h-[75vh] py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
            <div className="flex items-center gap-3 text-[#15803D]">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <div>
                <p className="text-xs font-semibold tracking-wider">APPLICATION RECEIVED</p>
                <h1 className="font-display text-2xl font-bold text-[#0F2447]">
                  {OPPORTUNITY_LABELS[receipt.category]} Submitted
                </h1>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="text-xs text-slate-500">Your Unique Application Reference ID</p>
              <p className="font-mono-tabular text-2xl font-bold text-[#0F2447]">
                {receipt.applicationRefId}
              </p>
              <p className="text-xs text-slate-600">
                Save this Reference ID together with your registered mobile number (
                <span className="font-mono-tabular">{mobile}</span>) to track verification stages
                online.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/track')}
                className="px-5 py-2.5 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566]"
              >
                Track Application Status
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceipt(null);
                  setApplicantName('');
                  setMobile('');
                  setEmail('');
                  setFields({});
                  setDocuments([]);
                  setSpamAnswer('');
                }}
                className="px-5 py-2.5 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[75vh]">
      {/* Page Header */}
      <div className="bg-[#0F2447] text-white py-12 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-amber-300 mb-2">
              PAN INDIA BUSINESS OPPORTUNITY PORTAL
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              {investment.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-200 max-w-3xl">{investment.summary}</p>
          </div>
          <a
            href="#application-form"
            className="px-5 py-3 bg-[#EA580C] text-white text-sm font-semibold rounded-lg hover:bg-[#C2410C] transition-colors self-start shrink-0"
          >
            Jump to Application Form ↓
          </a>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Information Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#0F2447]">
              Eligibility Requirements
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              {(investment.eligibilityPoints || []).map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#0F2447]">
              Infrastructure &amp; Logistics
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Infrastructure / Shop</dt>
                <dd className="text-slate-800">{investment.infrastructure}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Warehouse / Godown</dt>
                <dd className="text-slate-800">{investment.warehouse}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Transportation</dt>
                <dd className="text-slate-800">{investment.transportation}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0F2447]">
                Investment Breakdown
              </h2>
              <span className="text-xs font-semibold text-[#EA580C]">{investment.termsLabel}</span>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Initial Investment</dt>
                <dd className="text-slate-800">{investment.initialInvestment}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Security Deposit</dt>
                <dd className="text-slate-800">{investment.securityDeposit}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Initial Stock &amp; Charges</dt>
                <dd className="text-slate-800">
                  {investment.initialStock} · {investment.otherCharges}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              {investment.disclaimer}
            </p>
          </div>
        </div>

        {/* Required Documents & FAQs Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-display text-base font-bold text-[#0F2447] mb-3">
              Required Documents Checklist
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
              {(investment.requiredDocuments || docSlots).map((d, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#0F2447] shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h3 className="font-display text-base font-bold text-[#0F2447]">
              Key Application Guidance
            </h3>
            {(settings.faqs || []).slice(0, 2).map((f, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold text-slate-900">{f.question}</p>
                <p className="text-slate-600 text-xs mt-0.5">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <form
          id="application-form"
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8"
        >
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold tracking-wider text-[#EA580C] mb-1">
              ONLINE REGISTRATION PORTAL
            </p>
            <h2 className="font-display text-2xl font-bold text-[#0F2447]">
              {OPPORTUNITY_LABELS[category]} Application Form
            </h2>
          </div>

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {submitError}
            </div>
          )}

          {/* Section 1: Applicant & Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F2447] border-b border-slate-100 pb-2">
              1. Applicant &amp; Primary Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {category === 'cf_agency' ? 'Applicant Name *' : 'Full Name *'}
                </label>
                <input
                  required
                  type="text"
                  minLength={2}
                  maxLength={140}
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Enter applicant full name"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>

              {category === 'dealership' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Father&apos;s / Husband&apos;s Name (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={140}
                    value={fields.guardianName || ''}
                    onChange={(e) => setField('guardianName', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                  />
                </div>
              )}

              {(category === 'cf_agency' ||
                category === 'super_stockist' ||
                category === 'distributorship') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {category === 'distributorship' ? 'Business Name *' : 'Company / Firm Name *'}
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={140}
                    value={fields.companyName || ''}
                    onChange={(e) => setField('companyName', e.target.value)}
                    placeholder="Registered enterprise or firm name"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                  />
                </div>
              )}

              {category === 'cf_agency' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Authorized Contact Person *
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={120}
                    value={fields.contactPerson || ''}
                    onChange={(e) => setField('contactPerson', e.target.value)}
                    placeholder="Primary operations contact"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit Indian mobile"
                  className="w-full px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
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
                  placeholder="applicant@business.in"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pan-India Territory & Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F2447] border-b border-slate-100 pb-2">
              2. Pan-India Location &amp; Territory Selection
            </h3>
            <LocationSelector
              value={location}
              onChange={setLocation}
              territories={territories}
              category={category}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {category === 'cf_agency'
                    ? 'Business Address *'
                    : category === 'dealership'
                      ? 'Complete Address *'
                      : 'Full Business / Residential Address *'}
                </label>
                <input
                  required
                  type="text"
                  maxLength={300}
                  value={fields.address || ''}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="Door/Plot No., Street, Landmark"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {category === 'cf_agency'
                    ? 'Proposed Territory (State / Zone) *'
                    : category === 'distributorship'
                      ? 'Preferred Distribution Territory *'
                      : 'Preferred Business Territory *'}
                </label>
                <input
                  required
                  type="text"
                  maxLength={200}
                  value={preferredTerritory}
                  onChange={(e) => setPreferredTerritory(e.target.value)}
                  placeholder="Specify target district(s), city zone, or beat area"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Business, Tax, Warehouse & Infrastructure Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F2447] border-b border-slate-100 pb-2">
              3. Business Infrastructure, Tax &amp; Experience Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* PAN & GST */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PAN Number {category === 'cf_agency' || category === 'super_stockist' ? '*' : '(Recommended)'}
                </label>
                <input
                  required={category === 'cf_agency' || category === 'super_stockist'}
                  type="text"
                  maxLength={10}
                  value={fields.panNumber || ''}
                  onChange={(e) => setField('panNumber', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  GST Number {category === 'cf_agency' ? '*' : '(if applicable)'}
                </label>
                <input
                  required={category === 'cf_agency'}
                  type="text"
                  maxLength={15}
                  value={fields.gstNumber || ''}
                  onChange={(e) => setField('gstNumber', e.target.value.toUpperCase())}
                  placeholder="15-character GSTIN"
                  className="w-full px-3 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {category === 'dealership' ? 'Available Investment *' : 'Investment Capacity *'}
                </label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  value={fields.investmentCapacity || ''}
                  onChange={(e) => setField('investmentCapacity', e.target.value)}
                  placeholder="e.g. INR 5–10 Lakhs (indicative)"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {category === 'cf_agency'
                    ? 'Logistics / Warehousing Experience *'
                    : category === 'super_stockist'
                      ? 'FMCG Experience *'
                      : 'Business Experience *'}
                </label>
                <input
                  required
                  type="text"
                  maxLength={120}
                  value={fields.experience || ''}
                  onChange={(e) => setField('experience', e.target.value)}
                  placeholder="Years & sector background"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                />
              </div>

              {/* Category-specific fields */}
              {category === 'dealership' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Existing Business *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.existingBusiness || ''}
                      onChange={(e) => setField('existingBusiness', e.target.value)}
                      placeholder="Current trade or 'New Venture'"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Shop Availability *
                    </label>
                    <select
                      required
                      value={fields.shopAvailability || ''}
                      onChange={(e) => setField('shopAvailability', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="Ready Commercial Shop">Ready Commercial Shop</option>
                      <option value="Under Identification">Under Identification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Property Ownership Status *
                    </label>
                    <select
                      required
                      value={fields.propertyOwnership || ''}
                      onChange={(e) => setField('propertyOwnership', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="Self-Owned">Self-Owned</option>
                      <option value="Rented / Leased">Rented / Leased</option>
                    </select>
                  </div>
                </>
              )}

              {category === 'cf_agency' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company Registration Details *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={160}
                      value={fields.companyRegistration || ''}
                      onChange={(e) => setField('companyRegistration', e.target.value)}
                      placeholder="CIN / LLPIN / Partnership / Proprietorship"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Warehouse Ownership *
                    </label>
                    <select
                      required
                      value={fields.warehouseOwnership || ''}
                      onChange={(e) => setField('warehouseOwnership', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="Owned Warehouse">Owned Warehouse</option>
                      <option value="Long-Term Lease">Long-Term Lease</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Warehouse Area (Sq. Ft.) *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={60}
                      value={fields.warehouseArea || ''}
                      onChange={(e) => setField('warehouseArea', e.target.value)}
                      placeholder="e.g. 5,000 sq. ft."
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Storage Capacity *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={100}
                      value={fields.storageCapacity || ''}
                      onChange={(e) => setField('storageCapacity', e.target.value)}
                      placeholder="Pallet / Metric Ton capacity"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Loading / Unloading Facilities *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.loadingFacilities || ''}
                      onChange={(e) => setField('loadingFacilities', e.target.value)}
                      placeholder="Dock bays, forklifts, manpower"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Transportation Facilities *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.transportationFacilities || ''}
                      onChange={(e) => setField('transportationFacilities', e.target.value)}
                      placeholder="Owned / contracted commercial fleet"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {category === 'super_stockist' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Godown Availability *
                    </label>
                    <select
                      required
                      value={fields.godownAvailability || ''}
                      onChange={(e) => setField('godownAvailability', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="Owned Godown">Owned Godown</option>
                      <option value="Leased Godown">Leased Godown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Godown Area (Sq. Ft.) *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={60}
                      value={fields.godownArea || ''}
                      onChange={(e) => setField('godownArea', e.target.value)}
                      placeholder="e.g. 2,500 sq. ft."
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Storage Capacity *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={100}
                      value={fields.storageCapacity || ''}
                      onChange={(e) => setField('storageCapacity', e.target.value)}
                      placeholder="e.g. 80 MT"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Transportation Facilities *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.transportationFacilities || ''}
                      onChange={(e) => setField('transportationFacilities', e.target.value)}
                      placeholder="Delivery vehicles & inter-district dispatch"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Existing Retailer / Distributor Network *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.retailerNetwork || ''}
                      onChange={(e) => setField('retailerNetwork', e.target.value)}
                      placeholder="Number of active outlets / sub-dealers"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {category === 'distributorship' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Shop Availability *
                    </label>
                    <select
                      required
                      value={fields.shopAvailability || ''}
                      onChange={(e) => setField('shopAvailability', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="Available (Owned)">Available (Owned)</option>
                      <option value="Available (Rented)">Available (Rented)</option>
                      <option value="To Be Finalized">To Be Finalized</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Godown Availability *
                    </label>
                    <select
                      required
                      value={fields.godownAvailability || ''}
                      onChange={(e) => setField('godownAvailability', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="Yes - Ready">Yes - Ready</option>
                      <option value="Planned">Planned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Existing Retailer Network *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.retailerNetwork || ''}
                      onChange={(e) => setField('retailerNetwork', e.target.value)}
                      placeholder="e.g. 150 kirana outlets covered"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Transportation Availability *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={140}
                      value={fields.transportationAvailability || ''}
                      onChange={(e) => setField('transportationAvailability', e.target.value)}
                      placeholder="Tempo / Mini Truck / Two-wheelers"
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 4: Secure Document Upload */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-[#0F2447]">
                4. Private Document Upload (PDF, JPG, PNG, WEBP · Max 550 KB each)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Uploaded documents are stored privately and accessible exclusively to authorized
                INDEPENDENCE FMCG administrators during KYC verification.
              </p>
            </div>

            {docUploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {docUploadError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docSlots.map((slot) => {
                const uploaded = documents.find((d) => d.docType === slot);
                return (
                  <div
                    key={slot}
                    className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{slot}</p>
                      {uploaded ? (
                        <p className="text-xs text-[#15803D] mt-1 truncate">
                          Attached: {uploaded.fileName} ({Math.round(uploaded.fileSize / 1024)} KB)
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">No file selected</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-[#0F2447] cursor-pointer hover:bg-slate-100">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploaded ? 'Replace' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={(e) =>
                            handleFileSelect(slot, e.target.files ? e.target.files[0] : null)
                          }
                        />
                      </label>
                      {uploaded && (
                        <button
                          type="button"
                          onClick={() => removeDocument(slot)}
                          aria-label={`Remove ${slot}`}
                          className="p-1.5 text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Verification & Submission */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Human Verification: What is {spamSeed.a} + {spamSeed.b}? *
                </label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  value={spamAnswer}
                  onChange={(e) => setSpamAnswer(e.target.value)}
                  placeholder="Enter sum"
                  className="w-40 px-3 py-2 text-sm font-mono-tabular border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I declare that the business and personal details submitted are accurate, and I
                consent to verification by INDEPENDENCE FMCG in accordance with applicable Indian
                data protection norms.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566] disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
