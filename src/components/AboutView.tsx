import React from 'react';
import { LOGISTICS_IMAGE } from '../data/seedData';
import type { ProductCategory, WebsiteSettings } from '../types';
import type { AppRoute } from './Header';

interface AboutViewProps {
  settings: WebsiteSettings;
  categories: ProductCategory[];
  onNavigate: (route: AppRoute) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, categories, onNavigate }) => {
  return (
    <div className="bg-white">
      <div className="bg-[#0F2447] text-white py-14 border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wider text-amber-300 mb-2">
            CORPORATE PROFILE
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            About {settings.companyName}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
            {settings.tagline} — Food &amp; Beverage Services built for Pan-India distribution
            excellence.
          </p>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-14 space-y-14">
        {/* Company Introduction & Brand Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#0F2447]">
              01. Company Introduction &amp; Brand Overview
            </h2>
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {settings.aboutIntro}
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              Editorial Governance: Corporate overview, product specifications, and commercial terms
              displayed on this platform are centrally managed by authorized INDEPENDENCE FMCG
              administrators.
            </div>
          </div>
          <div className="lg:col-span-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[260px]">
            <img
              src={LOGISTICS_IMAGE}
              alt="INDEPENDENCE FMCG Corporate Supply Chain"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="font-display text-xl font-bold text-[#0F2447] mb-3">02. Our Vision</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {settings.vision}
            </p>
          </div>
          <div className="p-7 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="font-display text-xl font-bold text-[#0F2447] mb-3">03. Our Mission</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {settings.mission}
            </p>
          </div>
        </div>

        {/* Objectives, Quality, Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-slate-200 rounded-xl">
            <h3 className="font-display text-lg font-bold text-[#0F2447] mb-3">
              04. Business Objectives
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {settings.objectives}
            </p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <h3 className="font-display text-lg font-bold text-[#0F2447] mb-3">
              05. Quality Commitment
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {settings.qualityCommitment}
            </p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <h3 className="font-display text-lg font-bold text-[#0F2447] mb-3">
              06. Distribution Strategy
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {settings.distributionStrategy}
            </p>
          </div>
        </div>

        {/* Product Portfolio & Business Partner Network */}
        <div className="border-t border-slate-200 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold text-[#0F2447] mb-3">
              07. Product Portfolio Categories
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Our food and beverage portfolio spans {categories.length} core consumer categories:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-800">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-[#0F2447] mb-3">
              08. Business Partner Network
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              INDEPENDENCE FMCG invites qualified entrepreneurs, warehousing operators, and retail
              distributors across all 28 States and 8 Union Territories to partner across four
              transparent levels:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/dealership')}
                className="px-4 py-3 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566] transition-colors text-left"
              >
                FMCG Dealership →
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/cf-agency')}
                className="px-4 py-3 bg-[#EA580C] text-white text-sm font-semibold rounded-lg hover:bg-[#C2410C] transition-colors text-left"
              >
                C&amp;F Agency →
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/super-stockist')}
                className="px-4 py-3 bg-white border border-slate-300 text-[#0F2447] text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                Super Stockist →
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/distributorship')}
                className="px-4 py-3 bg-white border border-slate-300 text-[#0F2447] text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                FMCG Distributorship →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
