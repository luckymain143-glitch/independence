import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AboutView } from './components/AboutView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ContactView } from './components/ContactView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header, type AppRoute } from './components/Header';
import { HomeView } from './components/HomeView';
import { InvestmentView } from './components/InvestmentView';
import { OpportunityApplicationView } from './components/OpportunityApplicationView';
import { ProcessView } from './components/ProcessView';
import { ProductsView } from './components/ProductsView';
import { TrackView } from './components/TrackView';
import {
  DEFAULT_INVESTMENT_SETTINGS,
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_SAMPLE_PRODUCTS,
  DEFAULT_WEBSITE_SETTINGS,
} from './data/seedData';
import { auth } from './lib/firebase';
import {
  fetchInvestmentSettings,
  fetchProductCategories,
  fetchProducts,
  fetchTerritories,
  fetchWebsiteSettings,
} from './services/firestoreService';
import type {
  InvestmentSetting,
  OpportunityCategory,
  Product,
  ProductCategory,
  Territory,
  WebsiteSettings,
} from './types';

const VALID_ROUTES: AppRoute[] = [
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
  '/admin',
];

function resolvePathToRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return (VALID_ROUTES.includes(clean as AppRoute) ? clean : '/') as AppRoute;
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    resolvePathToRoute(window.location.pathname)
  );
  const [user, setUser] = useState<User | null>(null);
  const [initialTrackRefId, setInitialTrackRefId] = useState('');

  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  const [categories, setCategories] = useState<ProductCategory[]>(DEFAULT_PRODUCT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEFAULT_SAMPLE_PRODUCTS);
  const [investments, setInvestments] =
    useState<Record<OpportunityCategory, InvestmentSetting>>(DEFAULT_INVESTMENT_SETTINGS);
  const [territories, setTerritories] = useState<Territory[]>([]);

  const loadPublicData = useCallback(async () => {
    const [ws, cats, prods, inv, terr] = await Promise.all([
      fetchWebsiteSettings(),
      fetchProductCategories(),
      fetchProducts(false),
      fetchInvestmentSettings(),
      fetchTerritories(),
    ]);
    setSettings(ws);
    setCategories(cats);
    setProducts(prods);
    setInvestments(inv);
    setTerritories(terr);
  }, []);

  useEffect(() => {
    void loadPublicData();
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });
    const onPopState = () => {
      setRoute(resolvePathToRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', onPopState);
    };
  }, [loadPublicData]);

  const navigate = useCallback((nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderView = () => {
    switch (route) {
      case '/about':
        return <AboutView settings={settings} categories={categories} onNavigate={navigate} />;
      case '/products':
        return <ProductsView categories={categories} products={products} onNavigate={navigate} />;
      case '/opportunities/dealership':
        return (
          <OpportunityApplicationView
            category="dealership"
            investment={investments.dealership}
            settings={settings}
            territories={territories}
            onNavigate={navigate}
          />
        );
      case '/opportunities/cf-agency':
        return (
          <OpportunityApplicationView
            category="cf_agency"
            investment={investments.cf_agency}
            settings={settings}
            territories={territories}
            onNavigate={navigate}
          />
        );
      case '/opportunities/super-stockist':
        return (
          <OpportunityApplicationView
            category="super_stockist"
            investment={investments.super_stockist}
            settings={settings}
            territories={territories}
            onNavigate={navigate}
          />
        );
      case '/opportunities/distributorship':
        return (
          <OpportunityApplicationView
            category="distributorship"
            investment={investments.distributorship}
            settings={settings}
            territories={territories}
            onNavigate={navigate}
          />
        );
      case '/investment':
        return <InvestmentView investments={investments} onNavigate={navigate} />;
      case '/process':
        return <ProcessView onNavigate={navigate} />;
      case '/track':
        return <TrackView initialRefId={initialTrackRefId} />;
      case '/contact':
        return <ContactView settings={settings} />;
      case '/admin':
        return (
          <AdminDashboardView
            user={user}
            settings={settings}
            categories={categories}
            products={products}
            investments={investments}
            territories={territories}
            onRefreshPublicData={loadPublicData}
          />
        );
      case '/':
      default:
        return (
          <HomeView
            settings={settings}
            categories={categories}
            products={products}
            territories={territories}
            onNavigate={navigate}
            onQuickTrack={(ref) => {
              setInitialTrackRefId(ref);
              navigate('/track');
            }}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <Header
          currentRoute={route}
          onNavigate={navigate}
          companyName={settings.companyName}
        />
        <div className="flex-1">{renderView()}</div>
        <Footer settings={settings} onNavigate={navigate} />
      </div>
    </ErrorBoundary>
  );
}
