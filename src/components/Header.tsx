import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock, Menu, Send, X } from 'lucide-react';

export type AppRoute =
  | '/'
  | '/about'
  | '/products'
  | '/opportunities/dealership'
  | '/opportunities/cf-agency'
  | '/opportunities/super-stockist'
  | '/opportunities/distributorship'
  | '/investment'
  | '/process'
  | '/track'
  | '/contact'
  | '/admin';

interface HeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  companyName: string;
}

type DropdownKey = 'about' | 'products' | 'opportunities' | 'support' | null;

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<DropdownKey>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const go = (route: AppRoute) => {
    setMobileOpen(false);
    setOpenMenu(null);
    onNavigate(route);
  };

  const toggleMenu = (key: DropdownKey) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top Utility Navy Bar matching reference */}
      <div className="bg-[#0F2D6B] text-white text-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            {/* Subtle Indian Tricolour Accent Icon */}
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" className="shrink-0 rounded-[2px]">
              <rect width="18" height="4" fill="#FF9933" />
              <rect y="4" width="18" height="4" fill="#FFFFFF" />
              <rect y="8" width="18" height="4" fill="#138808" />
              <circle cx="9" cy="6" r="1.4" fill="#000080" />
            </svg>
            <span className="font-medium truncate">
              India&apos;s Growing FMCG Business Partner Network
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => go('/track')}
              className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap"
            >
              <Lock className="w-3 h-3" />
              <span>Track Application</span>
            </button>
            <span className="text-slate-400" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => go('/admin')}
              className="hover:text-amber-300 transition-colors whitespace-nowrap font-medium"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Main White Header Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div
          ref={navRef}
          className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
        >
          {/* Logo Mark: Independence FMCG with tricolor wave */}
          <button
            type="button"
            onClick={() => go('/')}
            className="flex flex-col items-start leading-none text-left shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2D6B] rounded"
          >
            <div className="relative flex flex-col items-center">
              <svg width="44" height="10" viewBox="0 0 60 12" aria-hidden="true" className="-mb-0.5">
                <path d="M4 9 C 20 1, 40 1, 56 5" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M8 11 C 22 4, 40 4, 54 8" stroke="#15803D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
              <span className="font-display font-extrabold text-xl tracking-tight text-[#0F2D6B] whitespace-nowrap">
                Independence
              </span>
              <span className="font-display font-extrabold text-xs tracking-[0.18em] text-[#DC2626] -mt-0.5">
                FMCG
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-800"
          >
            <button
              type="button"
              onClick={() => go('/')}
              className={`px-4 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentRoute === '/'
                  ? 'bg-[#DC2626] text-white'
                  : 'text-slate-800 hover:text-[#0F2D6B]'
              }`}
            >
              Home
            </button>

            {/* About Us Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('about')}
                className={`flex items-center gap-1 py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#0F2D6B] ${
                  currentRoute === '/about' ? 'text-[#DC2626]' : ''
                }`}
              >
                <span>About Us</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'about' && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => go('/about')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Company Profile &amp; Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/about')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Vision, Mission &amp; Quality
                  </button>
                </div>
              )}
            </div>

            {/* Products Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('products')}
                className={`flex items-center gap-1 py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#0F2D6B] ${
                  currentRoute === '/products' ? 'text-[#DC2626]' : ''
                }`}
              >
                <span>Products</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'products' && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => go('/products')}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-[#0F2D6B] hover:bg-slate-50"
                  >
                    All 9 FMCG Categories
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/products')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Grocery, Staples &amp; Edible Oils
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/products')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Spices, Tea &amp; Dairy Products
                  </button>
                </div>
              )}
            </div>

            {/* Business Opportunities Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('opportunities')}
                className={`flex items-center gap-1 py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#0F2D6B] ${
                  currentRoute.startsWith('/opportunities/') ? 'text-[#DC2626]' : ''
                }`}
              >
                <span>Business Opportunities</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'opportunities' && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => go('/opportunities/dealership')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    FMCG Dealership
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/opportunities/cf-agency')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    C&amp;F Agency (Carrying &amp; Forwarding)
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/opportunities/super-stockist')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Super Stockist
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/opportunities/distributorship')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    FMCG Distributorship
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => go('/investment')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#0F2D6B] ${
                currentRoute === '/investment' ? 'text-[#DC2626]' : ''
              }`}
            >
              Investment
            </button>

            {/* Partner Support Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('support')}
                className={`flex items-center gap-1 py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#0F2D6B] ${
                  currentRoute === '/process' || currentRoute === '/track' ? 'text-[#DC2626]' : ''
                }`}
              >
                <span>Partner Support</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'support' && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => go('/process')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Application Process (9 Stages)
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/track')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Track Application Status
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => go('/contact')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-[#0F2D6B] ${
                currentRoute === '/contact' ? 'text-[#DC2626]' : ''
              }`}
            >
              Contact Us
            </button>
          </nav>

          {/* Right Apply Now CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => go('/opportunities/dealership')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply Now</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="xl:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
          {[
            { label: 'Home', route: '/' as AppRoute },
            { label: 'About Us', route: '/about' as AppRoute },
            { label: 'Our Products', route: '/products' as AppRoute },
            { label: 'FMCG Dealership', route: '/opportunities/dealership' as AppRoute },
            { label: 'C&F Agency', route: '/opportunities/cf-agency' as AppRoute },
            { label: 'Super Stockist', route: '/opportunities/super-stockist' as AppRoute },
            { label: 'FMCG Distributorship', route: '/opportunities/distributorship' as AppRoute },
            { label: 'Investment Details', route: '/investment' as AppRoute },
            { label: 'Application Process', route: '/process' as AppRoute },
            { label: 'Track Application', route: '/track' as AppRoute },
            { label: 'Contact Us', route: '/contact' as AppRoute },
            { label: 'Admin Login', route: '/admin' as AppRoute },
          ].map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => go(item.route)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === item.route
                  ? 'bg-[#0F2D6B] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
