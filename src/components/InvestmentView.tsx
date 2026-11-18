import React, { useState } from 'react';
import type { InvestmentSetting, OpportunityCategory } from '../types';
import type { AppRoute } from './Header';

interface InvestmentViewProps {
  investments: Record<OpportunityCategory, InvestmentSetting>;
  onNavigate: (route: AppRoute) => void;
}

const ROUTE_MAP: Record<OpportunityCategory, AppRoute> = {
  dealership: '/opportunities/dealership',
  cf_agency: '/opportunities/cf-agency',
  super_stockist: '/opportunities/super-stockist',
  distributorship: '/opportunities/distributorship',
};

export const InvestmentView: React.FC<InvestmentViewProps> = ({ investments, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<OpportunityCategory>('dealership');
  const active = investments[activeTab];

  return (
    <div className="bg-slate-50 min-h-[75vh]">
      <div className="bg-[#0F2447] text-white py-12 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wider text-amber-300 mb-2">
            COMMERCIAL &amp; INFRASTRUCTURE NORMS
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Investment &amp; Business Information
          </h1>
          <p className="text-sm text-slate-200 max-w-2xl">
            Transparent breakdown across Dealership, C&amp;F Agency, Super Stockist, and
            Distributorship. All parameters are centrally configurable by INDEPENDENCE FMCG
            administration.
          </p>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Opportunity Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(investments) as OpportunityCategory[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === key
                  ? 'bg-[#0F2447] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {investments[key].title}
            </button>
          ))}
        </div>

        {/* Active Investment Sheet */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-semibold text-[#EA580C] mb-1">{active.termsLabel}</p>
              <h2 className="font-display text-2xl font-bold text-[#0F2447]">{active.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{active.summary}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(ROUTE_MAP[activeTab])}
              className="px-5 py-2.5 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566] shrink-0"
            >
              Apply for {active.title}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Initial Investment', val: active.initialInvestment },
              { label: 'Security Deposit', val: active.securityDeposit },
              { label: 'Initial Stock Norm', val: active.initialStock },
              { label: 'Infrastructure', val: active.infrastructure },
              { label: 'Warehouse / Godown', val: active.warehouse },
              { label: 'Transportation', val: active.transportation },
              { label: 'Other Applicable Charges', val: active.otherCharges },
            ].map((row) => (
              <div key={row.label} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 mb-1">{row.label}</p>
                <p className="text-sm font-medium text-slate-900">{row.val || 'Configurable'}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
            {active.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
