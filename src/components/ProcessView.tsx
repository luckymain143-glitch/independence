import React from 'react';
import { APPLICATION_WORKFLOW_STEPS } from '../types';
import type { AppRoute } from './Header';

interface ProcessViewProps {
  onNavigate: (route: AppRoute) => void;
}

const STEP_DESCRIPTIONS: Record<string, string> = {
  'Application Submitted':
    'Applicant submits online form with territory selection and KYC/property documents. A unique Reference ID is generated immediately.',
  'Initial Screening':
    'Onboarding desk verifies application completeness, category alignment, and basic eligibility.',
  'Under Verification':
    'Identity, PAN, GST (if applicable), and business registration records undergo verification.',
  'Documents Pending':
    'If any mandatory KYC, property, or warehouse document is missing or unclear, applicants are notified with specific pending items.',
  'Business Evaluation':
    'Commercial team assesses FMCG experience, existing retail coverage, logistics readiness, and financial preparedness.',
  'Territory Availability Check':
    'Territory administration confirms open status for the selected State, District, City, and PIN Code without partner overlap.',
  'Management Review':
    'Senior leadership conducts final commercial and compliance sign-off.',
  Approved:
    'Formal approval issued. Authorized team initiates agreement execution and initial stock onboarding.',
  Rejected:
    'Application could not be approved at this cycle due to territory saturation, eligibility gaps, or verification outcomes.',
};

export const ProcessView: React.FC<ProcessViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white min-h-[75vh]">
      <div className="bg-[#0F2447] text-white py-12 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wider text-amber-300 mb-2">
            TRANSPARENT ONBOARDING WORKFLOW
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            9-Stage Partner Application Process
          </h1>
          <p className="text-sm text-slate-200 max-w-2xl">
            Every Dealership, C&amp;F Agency, Super Stockist, and Distributorship application follows
            a verifiable 9-stage workflow trackable online with your Reference ID.
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="space-y-4">
          {APPLICATION_WORKFLOW_STEPS.map((step, index) => (
            <div
              key={step}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="font-mono-tabular text-sm font-bold text-white bg-[#0F2447] w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#0F2447]">{step}</h3>
                <p className="text-sm text-slate-600 mt-0.5">{STEP_DESCRIPTIONS[step]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#0F2447]">
              Ready to submit or check an existing application?
            </h3>
            <p className="text-sm text-slate-600">
              Start a new channel partner application or verify live workflow status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/track')}
              className="px-4 py-2.5 bg-white border border-slate-300 text-sm font-semibold text-[#0F2447] rounded-lg hover:bg-slate-100"
            >
              Track Application
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/opportunities/dealership')}
              className="px-4 py-2.5 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566]"
            >
              Start Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
