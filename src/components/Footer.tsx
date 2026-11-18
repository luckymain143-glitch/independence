import React from 'react';
import type { WebsiteSettings } from '../types';
import type { AppRoute } from './Header';

interface FooterProps {
  settings: WebsiteSettings;
  onNavigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-[#0F2447] text-slate-200 border-t border-slate-800">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-lg font-bold text-white tracking-tight mb-2">
            {settings.companyName}
          </h3>
          <p className="text-xs font-semibold tracking-wider text-amber-300 mb-3">
            {settings.tagline}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Food &amp; Beverage Services across 28 States and 8 Union Territories of India.
            Structured channel partner onboarding for Dealership, C&amp;F Agency, Super Stockist,
            and Distributorship.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Business Opportunities
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/dealership')}
                className="hover:text-white transition-colors"
              >
                FMCG Dealership
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/cf-agency')}
                className="hover:text-white transition-colors"
              >
                C&amp;F Agency (Carrying &amp; Forwarding)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/super-stockist')}
                className="hover:text-white transition-colors"
              >
                Super Stockist
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/opportunities/distributorship')}
                className="hover:text-white transition-colors"
              >
                FMCG Distributorship
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Corporate &amp; Tracking
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="hover:text-white transition-colors"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="hover:text-white transition-colors"
              >
                Our Products
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/investment')}
                className="hover:text-white transition-colors"
              >
                Investment Details
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/process')}
                className="hover:text-white transition-colors"
              >
                Application Process
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/track')}
                className="hover:text-white transition-colors"
              >
                Track Application
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="hover:text-white transition-colors"
              >
                Admin Portal
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Corporate Office &amp; Support
          </h4>
          <div className="space-y-2.5 text-sm text-slate-300">
            <p>{settings.officeAddress || 'Configure Corporate Office Address in Admin Dashboard'}</p>
            <p>Email: {settings.contactEmail || 'Configure in Admin Dashboard'}</p>
            <p>Phone: {settings.contactPhone || 'Configure in Admin Dashboard'}</p>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="mt-2 inline-block px-4 py-2 bg-white text-[#0F2447] text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Submit Business Enquiry
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {settings.companyName}. Private commercial entity. All
            commercial terms are governed by formal agreement.
          </p>
          <p>Pan-India Coverage: 28 States · 8 Union Territories</p>
        </div>
      </div>
    </footer>
  );
};
