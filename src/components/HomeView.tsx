import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  Handshake,
  Headset,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  DAIRY_MEALS_IMAGE,
  HERO_BANNER_IMAGE,
  LOGISTICS_IMAGE,
  SPICES_TEA_IMAGE,
  STAPLES_OILS_IMAGE,
} from '../data/seedData';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import type { Product, ProductCategory, Territory, WebsiteSettings } from '../types';
import type { AppRoute } from './Header';

interface HomeViewProps {
  settings: WebsiteSettings;
  categories: ProductCategory[];
  products: Product[];
  territories: Territory[];
  onNavigate: (route: AppRoute) => void;
  onQuickTrack?: (refId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  territories,
  onNavigate,
  onQuickTrack,
}) => {
  const [quickRefId, setQuickRefId] = useState('');
  const [quickState, setQuickState] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const quickStateData = INDIA_LOCATIONS.find((s) => s.name === quickState);
  const stateTerritoryOverrides = territories.filter((t) => t.state === quickState);

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onQuickTrack && quickRefId.trim()) {
      onQuickTrack(quickRefId.trim().toUpperCase());
    } else {
      onNavigate('/track');
    }
  };

  return (
    <div className="bg-[#F4F7FB]">
      {/* 1. Hero Banner matching reference aesthetic */}
      <section className="relative bg-gradient-to-b from-[#EAF3FC] via-white to-[#FFF7ED] overflow-hidden border-b border-slate-200">
        {/* Subtle decorative tricolour top wave */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 pt-8 pb-16 lg:pt-10 lg:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Visual Showcase */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white aspect-[4/3]">
              <img
                src={SPICES_TEA_IMAGE}
                alt="INDEPENDENCE FMCG authentic Indian spices, tea, and snacks"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Center Hero Statement & 4 Opportunity CTAs */}
          <div className="lg:col-span-6 text-center space-y-4">
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F2D6B] text-balance">
              {settings.heroHeading === 'INDEPENDENCE FMCG'
                ? 'Independence FMCG'
                : settings.heroHeading}
            </h1>

            <div className="space-y-1">
              <p className="font-display text-2xl sm:text-3xl font-extrabold italic text-[#F97316] tracking-tight">
                Kan Kan Mein Swaad!
              </p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold italic text-[#15803D] tracking-tight">
                Kan Kan Mein Bharat!
              </p>
              <div className="mx-auto w-56 h-1 rounded-full bg-gradient-to-r from-[#F97316] via-[#F59E0B] to-[#15803D]" />
            </div>

            <p className="text-base sm:text-lg font-bold text-[#0F2D6B] pt-1">
              Build Your FMCG Business with Independence
            </p>

            {/* Prominent Color-Coded Opportunity Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/dealership')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-colors whitespace-nowrap"
              >
                <span>Apply for Dealership</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/cf-agency')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0B5ED7] hover:bg-[#094BB0] text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-colors whitespace-nowrap"
              >
                <span>Apply for C&amp;F Agency</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/super-stockist')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-colors whitespace-nowrap"
              >
                <span>Apply for Super Stockist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/distributorship')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-colors whitespace-nowrap"
              >
                <span>Apply for Distributorship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Product Assortment Showcase */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white aspect-[4/3]">
              <img
                src={settings.heroBannerUrl || HERO_BANNER_IMAGE}
                alt="INDEPENDENCE FMCG food, grocery staples, and beverage showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating 5-Column Trust & Value Bar */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 -mt-9 relative z-10">
        <div className="bg-white border border-slate-200 rounded-xl shadow-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {[
            {
              icon: Award,
              color: 'text-[#0B5ED7]',
              label: 'Premium Quality Products',
            },
            {
              icon: Handshake,
              color: 'text-[#0F2D6B]',
              label: 'Growth Partnership Opportunity',
            },
            {
              icon: MapPin,
              color: 'text-[#15803D]',
              label: 'Pan India Presence (36 States/UTs)',
            },
            {
              icon: Headset,
              color: 'text-[#0F2D6B]',
              label: 'Dedicated Partner Support',
            },
            {
              icon: ShieldCheck,
              color: 'text-[#0B5ED7]',
              label: 'Trusted Business Network',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="px-4 py-4 flex items-center justify-center gap-3 text-left"
              >
                <Icon className={`w-7 h-7 shrink-0 ${item.color}`} />
                <span className="text-xs sm:text-sm font-bold text-[#0F2D6B] leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Our Business Opportunities (4 Color-Bordered Cards) */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="hidden sm:block h-1 flex-1 max-w-[220px] rounded-full bg-gradient-to-r from-transparent via-[#F97316] to-[#15803D]" />
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F2D6B] text-center">
            Our Business Opportunities
          </h2>
          <div className="hidden sm:block h-1 flex-1 max-w-[220px] rounded-full bg-gradient-to-r from-[#15803D] via-[#F97316] to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'FMCG Dealership',
              desc: 'Grow with our Retail Dealership Program',
              img: HERO_BANNER_IMAGE,
              border: 'border-[#EF4444]',
              titleColor: 'text-[#DC2626]',
              btnColor: 'bg-[#DC2626] hover:bg-[#B91C1C]',
              route: '/opportunities/dealership' as AppRoute,
            },
            {
              title: 'C&F Agency',
              desc: 'Manage Logistics & Carrying Forwarding',
              img: LOGISTICS_IMAGE,
              border: 'border-[#2563EB]',
              titleColor: 'text-[#0B5ED7]',
              btnColor: 'bg-[#0B5ED7] hover:bg-[#094BB0]',
              route: '/opportunities/cf-agency' as AppRoute,
            },
            {
              title: 'Super Stockist',
              desc: 'Expand Your Reach with Super Stockist Opportunity',
              img: STAPLES_OILS_IMAGE,
              border: 'border-[#22C55E]',
              titleColor: 'text-[#15803D]',
              btnColor: 'bg-[#15803D] hover:bg-[#166534]',
              route: '/opportunities/super-stockist' as AppRoute,
            },
            {
              title: 'Distributorship',
              desc: 'Build a Strong Distribution Network',
              img: DAIRY_MEALS_IMAGE,
              border: 'border-[#F97316]',
              titleColor: 'text-[#EA580C]',
              btnColor: 'bg-[#F97316] hover:bg-[#EA580C]',
              route: '/opportunities/distributorship' as AppRoute,
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`bg-white border-2 ${card.border} rounded-xl p-4 shadow-sm flex items-center gap-3.5`}
            >
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={card.img}
                  alt={card.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3 className={`font-display text-base font-extrabold ${card.titleColor}`}>
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug mt-0.5">{card.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(card.route)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 ${card.btnColor} text-white text-xs font-bold rounded-lg transition-colors self-start whitespace-nowrap`}
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Bottom 3-Column Navy-Header Showcase (Products | Track Application | Why Partner) */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Our Products */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#0F2D6B] text-white px-5 py-3">
                <h3 className="font-display text-lg font-bold">Our Products</h3>
                <p className="text-xs text-blue-100">Explore Our Wide Range of FMCG Products</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: 'Food Products', img: HERO_BANNER_IMAGE },
                    { label: 'Beverages', img: SPICES_TEA_IMAGE },
                    { label: 'Snacks', img: SPICES_TEA_IMAGE },
                    { label: 'Grocery', img: STAPLES_OILS_IMAGE },
                    { label: 'Dairy', img: DAIRY_MEALS_IMAGE },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onNavigate('/products')}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={item.img}
                          alt={item.label}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 text-center">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#0F2D6B] hover:bg-[#173E8F] text-white text-xs font-bold rounded-lg transition-colors"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Track Your Application */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="bg-[#0F2D6B] text-white px-5 py-3">
              <h3 className="font-display text-lg font-bold">Track Your Application</h3>
              <p className="text-xs text-blue-100">Enter your Application ID to check status</p>
            </div>
            <div className="p-5 space-y-6 flex-1 flex flex-col justify-center">
              <form onSubmit={handleQuickTrackSubmit} className="flex items-stretch">
                <input
                  type="text"
                  value={quickRefId}
                  onChange={(e) => setQuickRefId(e.target.value.toUpperCase())}
                  placeholder="Enter Application ID (e.g. IND-DLR-2026-...)"
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#0B5ED7]"
                />
                <button
                  type="submit"
                  aria-label="Search Application ID"
                  className="px-4 bg-[#0B5ED7] hover:bg-[#094BB0] text-white rounded-r-lg transition-colors flex items-center justify-center"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* 3-Step Visual Tracker Bar */}
              <div className="relative pt-1">
                <div className="absolute top-4 left-8 right-8 h-0.5 bg-[#22C55E]" />
                <div className="relative flex items-center justify-between text-center px-2">
                  {['Applied', 'Under Review', 'Approved'].map((step) => (
                    <div key={step} className="flex flex-col items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#15803D] text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Why Partner with Independence? */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="bg-[#0F2D6B] text-white px-5 py-3">
              <h3 className="font-display text-lg font-bold">Why Partner with Independence?</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-12 gap-3 items-center">
                <ul className="col-span-7 space-y-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  {[
                    'Trusted Brand',
                    'Wide Distribution Network',
                    'Business Growth Opportunity',
                    'Dedicated Support',
                  ].map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="col-span-5 rounded-lg overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                  <img
                    src={LOGISTICS_IMAGE}
                    alt="INDEPENDENCE FMCG Pan-India logistics hub"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('/opportunities/dealership')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-full shadow-sm transition-colors"
                >
                  <span>Become Our Partner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pan-India Territory Coverage & FAQs Strip */}
      <section className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F2D6B]">
              <MapPin className="w-4 h-4 text-[#F97316]" />
              <span>Pan-India Territory Coverage Check (28 States &amp; 8 UTs)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {settings.distributionStrategy}
            </p>
            <select
              value={quickState}
              onChange={(e) => setQuickState(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
            >
              <option value="">Select any Indian State or Union Territory...</option>
              {INDIA_LOCATIONS.map((st) => (
                <option key={st.code} value={st.name}>
                  {st.name} ({st.type})
                </option>
              ))}
            </select>
            {quickStateData && (
              <div className="text-xs text-slate-700 space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                <p>
                  <strong>{quickStateData.name}:</strong>{' '}
                  <span className="font-mono-tabular">{quickStateData.districts.length}</span>{' '}
                  districts covered ·{' '}
                  <span className="font-mono-tabular">{stateTerritoryOverrides.length}</span>{' '}
                  custom territory rules active.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/opportunities/dealership')}
                  className="text-[#0B5ED7] font-bold hover:underline"
                >
                  Apply for {quickStateData.name} →
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display text-xl font-bold text-[#0F2D6B]">
              Frequently Asked Questions
            </h3>
            {(settings.faqs || []).map((faq, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#0F2D6B]">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      openFaqIdx === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIdx === idx && (
                  <div className="px-4 pb-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-2.5 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
