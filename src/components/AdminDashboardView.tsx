import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  CheckCircle2,
  Download,
  FileText,
  LogOut,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { STAPLES_OILS_IMAGE } from '../data/seedData';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  checkUserAdminAccess,
  deleteProduct,
  deleteTerritory,
  fetchAdminUsers,
  fetchAllApplications,
  fetchApplicationDocuments,
  fetchAuditLogs,
  fetchEnquiries,
  fetchIntegrationStatus,
  fetchNotificationLogs,
  fetchPrivateDocumentBlobUrl,
  fetchProducts,
  initializeDefaultCatalogIfEmpty,
  saveAdminUser,
  saveInvestmentSetting,
  saveProduct,
  saveTerritory,
  saveWebsiteSettings,
  updateApplicationWorkflow,
  updateEnquiryStatus,
  verifyApplicationDocument,
} from '../services/firestoreService';
import {
  APPLICATION_WORKFLOW_STEPS,
  OPPORTUNITY_LABELS,
  type AdminUserRecord,
  type ApplicationDocumentRecord,
  type ApplicationRecord,
  type ApplicationStatus,
  type AuditLogRecord,
  type EnquiryRecord,
  type IntegrationStatusResponse,
  type InvestmentSetting,
  type NotificationLogRecord,
  type OpportunityCategory,
  type Product,
  type ProductCategory,
  type Territory,
  type WebsiteSettings,
} from '../types';

type AdminTab =
  | 'overview'
  | 'applications'
  | 'products'
  | 'territories'
  | 'investments'
  | 'cms'
  | 'enquiries'
  | 'system';

interface AdminDashboardViewProps {
  user: User | null;
  settings: WebsiteSettings;
  categories: ProductCategory[];
  products: Product[];
  investments: Record<OpportunityCategory, InvestmentSetting>;
  territories: Territory[];
  onRefreshPublicData: () => Promise<void>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  settings,
  categories,
  products,
  investments,
  territories,
  onRefreshPublicData,
}) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  // Admin datasets
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatusResponse | null>(null);

  // Application filters & inspection
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('');
  const [searchApp, setSearchApp] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [selectedAppDocs, setSelectedAppDocs] = useState<ApplicationDocumentRecord[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{
    doc: ApplicationDocumentRecord;
    objectUrl: string;
    revoke: () => void;
  } | null>(null);
  const [wfStatus, setWfStatus] = useState<ApplicationStatus>('Initial Screening');
  const [wfPublicRemark, setWfPublicRemark] = useState('');
  const [wfInternalRemark, setWfInternalRemark] = useState('');
  const [wfPendingDocs, setWfPendingDocs] = useState('');

  // Product editor state
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    name: '',
    categoryId: categories[0]?.id || 'packaged-food',
    description: '',
    productInfo: '',
    packSizes: '',
    imageUrl: STAPLES_OILS_IMAGE,
    status: 'published',
    featured: false,
    isSample: false,
  });

  // Territory editor state
  const [terrForm, setTerrForm] = useState({
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Pune',
    pinCode: '411001',
    status: 'open' as Territory['status'],
    allocatedPartner: '',
    availableCategories: ['dealership', 'cf_agency', 'super_stockist', 'distributorship'] as OpportunityCategory[],
  });

  // Investment editor
  const [editInvType, setEditInvType] = useState<OpportunityCategory>('dealership');
  const [invDraft, setInvDraft] = useState<InvestmentSetting>(investments.dealership);

  // Website CMS editor
  const [cmsDraft, setCmsDraft] = useState<WebsiteSettings>(settings);

  // Admin user form
  const [newAdmin, setNewAdmin] = useState<AdminUserRecord>({
    id: '',
    uid: '',
    email: '',
    displayName: '',
    role: 'operations_admin',
    active: true,
  });

  useEffect(() => {
    setInvDraft(investments[editInvType]);
  }, [editInvType, investments]);

  useEffect(() => {
    setCmsDraft(settings);
  }, [settings]);

  const loadAdminDatasets = useCallback(async () => {
    setLoadingData(true);
    try {
      const [apps, enq, admins, notifs, audits, intStatus] = await Promise.all([
        fetchAllApplications(),
        fetchEnquiries(),
        fetchAdminUsers().catch(() => []),
        fetchNotificationLogs().catch(() => []),
        fetchAuditLogs().catch(() => []),
        fetchIntegrationStatus().catch(() => null),
      ]);
      setApplications(apps);
      setEnquiries(enq);
      setAdminUsers(admins);
      setNotificationLogs(notifs);
      setAuditLogs(audits);
      setIntegrations(intStatus);
      const prods = await fetchProducts(true);
      setAllProducts(prods.length > 0 ? prods : products);
    } catch (err) {
      setStatusBanner(err instanceof Error ? err.message : 'Error loading admin data.');
    } finally {
      setLoadingData(false);
    }
  }, [products]);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!user) {
        if (active) setIsAuthorized(false);
        return;
      }
      const ok = await checkUserAdminAccess(user.uid, user.email);
      if (active) {
        setIsAuthorized(ok);
        if (ok) {
          void loadAdminDatasets();
        }
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [user, loadAdminDatasets]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  };

  const handleOpenApplication = async (app: ApplicationRecord) => {
    if (previewDoc) {
      previewDoc.revoke();
      setPreviewDoc(null);
    }
    setSelectedApp(app);
    setWfStatus(app.status);
    setWfPublicRemark(app.publicRemarks || '');
    setWfInternalRemark(app.internalRemarks || '');
    setWfPendingDocs((app.pendingDocuments || []).join(', '));
    try {
      const docs = await fetchApplicationDocuments(app.id);
      setSelectedAppDocs(docs);
    } catch {
      setSelectedAppDocs([]);
    }
  };

  const handleOpenPrivateDocPreview = async (docRecord: ApplicationDocumentRecord) => {
    try {
      if (previewDoc) {
        previewDoc.revoke();
      }
      const { objectUrl, revoke } = await fetchPrivateDocumentBlobUrl(docRecord);
      setPreviewDoc({ doc: docRecord, objectUrl, revoke });
    } catch (err) {
      setStatusBanner(err instanceof Error ? err.message : 'Unable to load private document.');
    }
  };

  const handleDownloadPrivateDoc = async (docRecord: ApplicationDocumentRecord) => {
    try {
      const { objectUrl, revoke } = await fetchPrivateDocumentBlobUrl(docRecord);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = docRecord.fileName;
      a.click();
      setTimeout(() => revoke(), 1500);
    } catch (err) {
      setStatusBanner(err instanceof Error ? err.message : 'Unable to download private document.');
    }
  };

  const handleSaveWorkflow = async (overrideStatus?: ApplicationStatus) => {
    if (!selectedApp || !user?.email) return;
    const nextStatus = overrideStatus || wfStatus;
    const pendingList = wfPendingDocs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    await updateApplicationWorkflow({
      application: selectedApp,
      newStatus: nextStatus,
      publicRemarks: wfPublicRemark,
      internalRemarks: wfInternalRemark,
      pendingDocuments: pendingList,
      actorEmail: user.email,
    });
    setStatusBanner(`Updated ${selectedApp.applicationRefId} to ${nextStatus}.`);
    await loadAdminDatasets();
    setSelectedApp((prev) => (prev ? { ...prev, status: nextStatus } : null));
  };

  const handleExportCsv = () => {
    const headers = [
      'ReferenceID',
      'Category',
      'ApplicantName',
      'Mobile',
      'Email',
      'State',
      'District',
      'City',
      'PINCode',
      'Territory',
      'Status',
    ];
    const rows = filteredApps.map((a) => [
      a.applicationRefId,
      OPPORTUNITY_LABELS[a.category],
      a.applicantName,
      a.mobile,
      a.email,
      a.state,
      a.district,
      a.city,
      a.pinCode,
      a.preferredTerritory,
      a.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `independence_fmcg_applications_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredApps = useMemo(() => {
    const q = searchApp.trim().toLowerCase();
    return applications.filter((a) => {
      if (filterCat !== 'all' && a.category !== filterCat) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterState && a.state !== filterState) return false;
      if (
        q &&
        !a.applicationRefId.toLowerCase().includes(q) &&
        !a.applicantName.toLowerCase().includes(q) &&
        !a.mobile.includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [applications, filterCat, filterStatus, filterState, searchApp]);

  const kpis = useMemo(() => {
    const total = applications.length;
    const submitted = applications.filter((a) => a.status === 'Application Submitted').length;
    const pendingDocs = applications.filter((a) => a.status === 'Documents Pending').length;
    const underReview = applications.filter((a) =>
      [
        'Initial Screening',
        'Under Verification',
        'Business Evaluation',
        'Territory Availability Check',
        'Management Review',
      ].includes(a.status)
    ).length;
    const approved = applications.filter((a) => a.status === 'Approved').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    return { total, submitted, pendingDocs, underReview, approved, rejected };
  }, [applications]);

  // 1. Login Gate
  if (!user) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#EA580C] mb-1">
              RESTRICTED CORPORATE ACCESS
            </p>
            <h1 className="font-display text-2xl font-bold text-[#0F2447]">
              INDEPENDENCE FMCG Admin Portal
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Sign in with an authorized corporate Google account to manage Pan-India partner
              applications, territories, products, and CMS settings.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-[#0F2447] text-white text-sm font-semibold rounded-lg hover:bg-[#173566] transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>Sign In with Google (Admin)</span>
          </button>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6 text-sm text-slate-600">
        Verifying administrator role permissions...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <h1 className="font-display text-xl font-bold text-red-700">
            Unauthorized Account
          </h1>
          <p className="text-sm text-slate-600">
            Signed in as <strong>{user.email}</strong>, which is not listed as an active
            INDEPENDENCE FMCG administrator.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            User UID: {user.uid}
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[82vh] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 bg-[#0F2447] text-slate-200 shrink-0 p-4 space-y-1">
        <div className="px-3 py-3 border-b border-slate-800 mb-3">
          <p className="text-xs font-semibold text-amber-300">ADMIN CONSOLE</p>
          <p className="text-xs text-slate-300 truncate mt-0.5">{user.email}</p>
        </div>

        {(
          [
            { id: 'overview', label: 'Dashboard Overview' },
            { id: 'applications', label: `Applications (${applications.length})` },
            { id: 'products', label: 'Products & Categories' },
            { id: 'territories', label: 'Pan-India Territories' },
            { id: 'investments', label: 'Investment Terms' },
            { id: 'cms', label: 'Website Content & FAQs' },
            { id: 'enquiries', label: `Enquiries (${enquiries.length})` },
            { id: 'system', label: 'System, Roles & Logs' },
          ] as Array<{ id: AdminTab; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#0F2447] font-semibold'
                : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
          <button
            type="button"
            onClick={async () => {
              if (!user.email) return;
              await initializeDefaultCatalogIfEmpty(user.email);
              await onRefreshPublicData();
              await loadAdminDatasets();
              setStatusBanner('Verified and synced default corporate catalog & settings to Firestore.');
            }}
            className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 rounded-lg text-left"
          >
            Sync Default Seed to Firestore
          </button>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-5 sm:p-8 space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs text-slate-500">INDEPENDENCE FMCG / Operations Console</p>
            <h1 className="font-display text-2xl font-bold text-[#0F2447] capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => loadAdminDatasets()}
            disabled={loadingData}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {statusBanner && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
            <span>{statusBanner}</span>
            <button
              type="button"
              onClick={() => setStatusBanner('')}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Applications', value: kpis.total, color: 'text-[#0F2447]' },
                { label: 'New Submitted', value: kpis.submitted, color: 'text-[#EA580C]' },
                { label: 'Docs Pending', value: kpis.pendingDocs, color: 'text-amber-700' },
                { label: 'Under Review', value: kpis.underReview, color: 'text-blue-700' },
                { label: 'Approved', value: kpis.approved, color: 'text-[#15803D]' },
                { label: 'Rejected', value: kpis.rejected, color: 'text-red-700' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">{kpi.label}</p>
                  <p className={`font-mono-tabular text-2xl font-bold mt-1 ${kpi.color}`}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['dealership', 'cf_agency', 'super_stockist', 'distributorship'] as OpportunityCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setFilterCat(cat);
                      setActiveTab('applications');
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-[#0F2447] transition-colors"
                  >
                    <p className="text-xs text-slate-500">{OPPORTUNITY_LABELS[cat]}</p>
                    <p className="font-mono-tabular text-xl font-bold text-[#0F2447] mt-1">
                      {applications.filter((a) => a.category === cat).length} Applications
                    </p>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={searchApp}
                onChange={(e) => setSearchApp(e.target.value)}
                placeholder="Search Ref ID, Name, Mobile..."
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg w-60"
              />
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="dealership">Dealership</option>
                <option value="cf_agency">C&amp;F Agency</option>
                <option value="super_stockist">Super Stockist</option>
                <option value="distributorship">Distributorship</option>
              </select>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="">All States / UTs</option>
                {INDIA_LOCATIONS.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                {APPLICATION_WORKFLOW_STEPS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleExportCsv}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Reference ID</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Applicant</th>
                    <th className="px-4 py-3 font-semibold">State / District</th>
                    <th className="px-4 py-3 font-semibold">Docs</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No applications match the active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono-tabular font-semibold text-[#0F2447]">
                          {app.applicationRefId}
                        </td>
                        <td className="px-4 py-3">{OPPORTUNITY_LABELS[app.category]}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{app.applicantName}</div>
                          <div className="font-mono-tabular text-slate-500">{app.mobile}</div>
                        </td>
                        <td className="px-4 py-3">
                          {app.district}, {app.state}
                        </td>
                        <td className="px-4 py-3 font-mono-tabular">{app.documentCount}</td>
                        <td className="px-4 py-3 font-semibold">{app.status}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenApplication(app)}
                            className="px-3 py-1.5 bg-[#0F2447] text-white rounded text-xs font-semibold"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Application Detail Inspector */}
            {selectedApp && (
              <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs text-slate-500">{OPPORTUNITY_LABELS[selectedApp.category]}</p>
                    <h2 className="font-mono-tabular text-xl font-bold text-[#0F2447]">
                      {selectedApp.applicationRefId} — {selectedApp.applicantName}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Mobile: {selectedApp.mobile} · Email: {selectedApp.email} · PIN:{' '}
                      {selectedApp.pinCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-xs"
                  >
                    Close Inspector
                  </button>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Location</span>
                    <strong>
                      {selectedApp.city}, {selectedApp.district}, {selectedApp.state}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Preferred Territory</span>
                    <strong>{selectedApp.preferredTerritory}</strong>
                  </div>
                  {Object.entries(selectedApp.businessDetails || {}).map(([k, v]) => (
                    <div key={k} className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block capitalize">{k}</span>
                      <strong>{v || '-'}</strong>
                    </div>
                  ))}
                </div>

                {/* Private Documents */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#0F2447]">
                    Uploaded Private Documents ({selectedAppDocs.length})
                  </h3>
                  {selectedAppDocs.length === 0 ? (
                    <p className="text-xs text-slate-500">No documents attached to this record.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedAppDocs.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{d.docType}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {d.fileName} ·{' '}
                              <span className="font-mono">
                                {d.storageProvider === 'firebase_storage'
                                  ? 'Private Storage'
                                  : 'Private Vault'}
                              </span>
                            </p>
                            <p
                              className={`text-xs font-semibold mt-0.5 ${
                                d.verified ? 'text-[#15803D]' : 'text-amber-700'
                              }`}
                            >
                              {d.verified ? 'Verified' : 'Pending Verification'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPrivateDocPreview(d)}
                              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-50"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPrivateDoc(d)}
                              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-50"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!user?.email) return;
                                await verifyApplicationDocument(
                                  selectedApp.id,
                                  d.id,
                                  !d.verified,
                                  user.email
                                );
                                setSelectedAppDocs((prev) =>
                                  prev.map((item) =>
                                    item.id === d.id ? { ...item, verified: !d.verified } : item
                                  )
                                );
                              }}
                              className="px-2.5 py-1.5 bg-[#0F2447] text-white rounded text-xs font-semibold"
                            >
                              {d.verified ? 'Unverify' : 'Verify'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {previewDoc && (
                    <div className="mt-4 border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                      <div className="px-4 py-2.5 bg-[#0F2447] text-white flex items-center justify-between text-xs">
                        <span className="font-semibold truncate">
                          Private Document Preview: {previewDoc.doc.docType} ({previewDoc.doc.fileName})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            previewDoc.revoke();
                            setPreviewDoc(null);
                          }}
                          className="px-2.5 py-1 bg-white text-[#0F2447] font-semibold rounded"
                        >
                          Close Preview
                        </button>
                      </div>
                      <div className="p-4 flex justify-center bg-white">
                        {previewDoc.doc.mimeType === 'application/pdf' ? (
                          <iframe
                            src={previewDoc.objectUrl}
                            title={previewDoc.doc.fileName}
                            className="w-full h-[460px] border border-slate-200 rounded"
                          />
                        ) : (
                          <img
                            src={previewDoc.objectUrl}
                            alt={previewDoc.doc.fileName}
                            className="max-h-[460px] object-contain rounded border border-slate-200"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Workflow Transition Controls */}
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-[#0F2447]">Update Workflow &amp; Remarks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Application Status
                      </label>
                      <select
                        value={wfStatus}
                        onChange={(e) => setWfStatus(e.target.value as ApplicationStatus)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                      >
                        {APPLICATION_WORKFLOW_STEPS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pending Documents (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={wfPendingDocs}
                        onChange={(e) => setWfPendingDocs(e.target.value)}
                        placeholder="e.g. GST Certificate, Lease Deed"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Applicant-Visible Communication
                      </label>
                      <textarea
                        rows={2}
                        value={wfPublicRemark}
                        onChange={(e) => setWfPublicRemark(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Internal Admin Remarks (Private)
                      </label>
                      <textarea
                        rows={2}
                        value={wfInternalRemark}
                        onChange={(e) => setWfInternalRemark(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveWorkflow()}
                      className="px-4 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
                    >
                      Save Status Update
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveWorkflow('Approved')}
                      className="px-4 py-2 bg-[#15803D] text-white text-xs font-semibold rounded-lg"
                    >
                      Approve Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveWorkflow('Rejected')}
                      className="px-4 py-2 bg-red-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Reject Application
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user?.email) return;
                const cat = categories.find((c) => c.id === prodForm.categoryId);
                await saveProduct(
                  {
                    id: prodForm.id || '',
                    name: prodForm.name || '',
                    categoryId: prodForm.categoryId || 'packaged-food',
                    categoryName: cat?.name || 'Packaged Food',
                    description: prodForm.description || '',
                    productInfo: prodForm.productInfo || '',
                    packSizes: prodForm.packSizes || '',
                    imageUrl: prodForm.imageUrl || STAPLES_OILS_IMAGE,
                    status: (prodForm.status as Product['status']) || 'published',
                    featured: Boolean(prodForm.featured),
                    isSample: Boolean(prodForm.isSample),
                  },
                  user.email
                );
                setProdForm({
                  name: '',
                  categoryId: categories[0]?.id || 'packaged-food',
                  description: '',
                  productInfo: '',
                  packSizes: '',
                  imageUrl: STAPLES_OILS_IMAGE,
                  status: 'published',
                  featured: false,
                  isSample: false,
                });
                await onRefreshPublicData();
                await loadAdminDatasets();
                setStatusBanner('Product saved to Firestore catalogue.');
              }}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-bold text-[#0F2447]">
                {prodForm.id ? 'Edit Product' : 'Add New FMCG Product'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  required
                  type="text"
                  value={prodForm.name || ''}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="Product Name"
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
                <select
                  value={prodForm.categoryId}
                  onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                  className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={prodForm.packSizes || ''}
                  onChange={(e) => setProdForm({ ...prodForm, packSizes: e.target.value })}
                  placeholder="Pack Sizes (e.g. 500 g · 1 kg)"
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
                <input
                  required
                  type="text"
                  value={prodForm.description || ''}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="Short Description"
                  className="md:col-span-2 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
                <select
                  value={prodForm.status}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, status: e.target.value as Product['status'] })
                  }
                  className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(prodForm.featured)}
                    onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                  />
                  Featured on Homepage
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Product</span>
                </button>
              </div>
            </form>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3">{p.categoryName}</td>
                      <td className="px-4 py-3 uppercase font-mono">{p.status}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setProdForm(p)}
                          className="text-[#0F2447] font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user?.email) return;
                            await deleteProduct(p.id, user.email);
                            await onRefreshPublicData();
                            await loadAdminDatasets();
                          }}
                          className="text-red-700 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TERRITORIES */}
        {activeTab === 'territories' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user?.email) return;
                const stObj = INDIA_LOCATIONS.find((s) => s.name === terrForm.state);
                await saveTerritory(
                  {
                    id: '',
                    state: terrForm.state,
                    stateType: stObj?.type || 'State',
                    district: terrForm.district,
                    city: terrForm.city,
                    pinCode: terrForm.pinCode,
                    status: terrForm.status,
                    availableCategories: terrForm.availableCategories,
                    allocatedPartner: terrForm.allocatedPartner,
                  },
                  user.email
                );
                await onRefreshPublicData();
                setStatusBanner('Territory rule saved.');
              }}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-bold text-[#0F2447]">
                Configure Territory Status (28 States &amp; 8 UTs)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <select
                  value={terrForm.state}
                  onChange={(e) => {
                    const found = INDIA_LOCATIONS.find((s) => s.name === e.target.value);
                    const firstDist = found?.districts[0];
                    setTerrForm({
                      ...terrForm,
                      state: e.target.value,
                      district: firstDist?.district || '',
                      city: firstDist?.cities[0]?.city || '',
                      pinCode: firstDist?.cities[0]?.pinCode || '110001',
                    });
                  }}
                  className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  {INDIA_LOCATIONS.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="text"
                  value={terrForm.district}
                  onChange={(e) => setTerrForm({ ...terrForm, district: e.target.value })}
                  placeholder="District"
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  required
                  type="text"
                  value={terrForm.city}
                  onChange={(e) => setTerrForm({ ...terrForm, city: e.target.value })}
                  placeholder="City"
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={terrForm.pinCode}
                  onChange={(e) =>
                    setTerrForm({ ...terrForm, pinCode: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="PIN Code"
                  className="px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
                <select
                  value={terrForm.status}
                  onChange={(e) =>
                    setTerrForm({ ...terrForm, status: e.target.value as Territory['status'] })
                  }
                  className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="open">Open Territory</option>
                  <option value="closed">Closed Territory</option>
                  <option value="allocated">Allocated</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
              >
                Save Territory Rule
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">State / UT</th>
                    <th className="px-4 py-3">District &amp; City</th>
                    <th className="px-4 py-3">PIN</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {territories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                        All 36 States/UTs default to Open unless restricted above.
                      </td>
                    </tr>
                  ) : (
                    territories.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-3 font-semibold">{t.state}</td>
                        <td className="px-4 py-3">
                          {t.district} · {t.city}
                        </td>
                        <td className="px-4 py-3 font-mono-tabular">{t.pinCode}</td>
                        <td className="px-4 py-3 uppercase font-semibold">{t.status}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user?.email) return;
                              await deleteTerritory(t.id, user.email);
                              await onRefreshPublicData();
                            }}
                            className="text-red-700"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: INVESTMENTS */}
        {activeTab === 'investments' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              {(['dealership', 'cf_agency', 'super_stockist', 'distributorship'] as OpportunityCategory[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditInvType(t)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg ${
                      editInvType === t
                        ? 'bg-[#0F2447] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {OPPORTUNITY_LABELS[t]}
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Terms Label</label>
                <select
                  value={invDraft.termsLabel}
                  onChange={(e) =>
                    setInvDraft({
                      ...invDraft,
                      termsLabel: e.target.value as InvestmentSetting['termsLabel'],
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Estimated Indicative Range">Estimated Indicative Range</option>
                  <option value="Approved Commercial Terms">Approved Commercial Terms</option>
                  <option value="Subject to Territory Assessment">
                    Subject to Territory Assessment
                  </option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Initial Investment</label>
                <input
                  type="text"
                  value={invDraft.initialInvestment || ''}
                  onChange={(e) =>
                    setInvDraft({ ...invDraft, initialInvestment: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Security Deposit</label>
                <input
                  type="text"
                  value={invDraft.securityDeposit || ''}
                  onChange={(e) => setInvDraft({ ...invDraft, securityDeposit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Initial Stock</label>
                <input
                  type="text"
                  value={invDraft.initialStock || ''}
                  onChange={(e) => setInvDraft({ ...invDraft, initialStock: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Infrastructure</label>
                <input
                  type="text"
                  value={invDraft.infrastructure || ''}
                  onChange={(e) => setInvDraft({ ...invDraft, infrastructure: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Warehouse / Godown</label>
                <input
                  type="text"
                  value={invDraft.warehouse || ''}
                  onChange={(e) => setInvDraft({ ...invDraft, warehouse: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Transportation</label>
                <input
                  type="text"
                  value={invDraft.transportation || ''}
                  onChange={(e) => setInvDraft({ ...invDraft, transportation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Other Applicable Charges</label>
                <input
                  type="text"
                  value={invDraft.otherCharges || ''}
                  onChange={(e) => setInvDraft({ ...invDraft, otherCharges: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Disclaimer Text</label>
                <textarea
                  rows={2}
                  value={invDraft.disclaimer}
                  onChange={(e) => setInvDraft({ ...invDraft, disclaimer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!user?.email) return;
                await saveInvestmentSetting(invDraft, user.email);
                await onRefreshPublicData();
                setStatusBanner(`Updated investment terms for ${invDraft.title}.`);
              }}
              className="px-5 py-2.5 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
            >
              Save Commercial Terms
            </button>
          </div>
        )}

        {/* TAB 6: CMS */}
        {activeTab === 'cms' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
            <h2 className="font-display text-lg font-bold text-[#0F2447]">
              Website Content &amp; Contact Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  value={cmsDraft.companyName}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={cmsDraft.tagline}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Email</label>
                <input
                  type="text"
                  value={cmsDraft.contactEmail || ''}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={cmsDraft.contactPhone || ''}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">WhatsApp Business Number</label>
                <input
                  type="text"
                  value={cmsDraft.whatsappNumber || ''}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, whatsappNumber: e.target.value })}
                  placeholder="91XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Corporate Office Address</label>
                <input
                  type="text"
                  value={cmsDraft.officeAddress || ''}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, officeAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">About Us Introduction</label>
                <textarea
                  rows={3}
                  value={cmsDraft.aboutIntro || ''}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, aboutIntro: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!user?.email) return;
                await saveWebsiteSettings(cmsDraft, user.email);
                await onRefreshPublicData();
                setStatusBanner('Website content and contact details published.');
              }}
              className="px-5 py-2.5 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
            >
              Publish Website Settings
            </button>
          </div>
        )}

        {/* TAB 7: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Desk</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No enquiries submitted yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{enq.name}</div>
                        <div className="text-slate-500">
                          {enq.mobile} · {enq.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">{enq.enquiryType}</td>
                      <td className="px-4 py-3 max-w-md">{enq.message}</td>
                      <td className="px-4 py-3">
                        <select
                          value={enq.status}
                          onChange={async (e) => {
                            if (!user?.email) return;
                            const next = e.target.value as EnquiryRecord['status'];
                            await updateEnquiryStatus(enq.id, next, user.email);
                            setEnquiries((prev) =>
                              prev.map((item) =>
                                item.id === enq.id ? { ...item, status: next } : item
                              )
                            );
                          }}
                          className="px-2 py-1 border border-slate-300 rounded bg-white"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 8: SYSTEM, ROLES & LOGS */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* Notification Integration Health */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2447]">
                Email, WhatsApp &amp; SMS Gateway Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {integrations &&
                  (['email', 'whatsapp', 'sms'] as const).map((k) => {
                    const item = integrations[k];
                    return (
                      <div key={k} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="font-bold text-[#0F2447] uppercase">{k}</p>
                        <p className="text-slate-600 mt-1">{item.provider}</p>
                        <p
                          className={`mt-2 font-mono font-bold ${
                            item.configured ? 'text-[#15803D]' : 'text-amber-700'
                          }`}
                        >
                          {item.status}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Admin Role Management */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2447]">
                Admin Role-Based Access Management
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user?.email) return;
                  await saveAdminUser(newAdmin, user.email);
                  setNewAdmin({
                    id: '',
                    uid: '',
                    email: '',
                    displayName: '',
                    role: 'operations_admin',
                    active: true,
                  });
                  await loadAdminDatasets();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs"
              >
                <input
                  required
                  type="text"
                  value={newAdmin.uid}
                  onChange={(e) => setNewAdmin({ ...newAdmin, uid: e.target.value })}
                  placeholder="Firebase Auth UID"
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  required
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="Admin Email"
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  required
                  type="text"
                  value={newAdmin.displayName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
                  placeholder="Display Name"
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                />
                <select
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      role: e.target.value as AdminUserRecord['role'],
                    })
                  }
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="operations_admin">Operations Admin</option>
                  <option value="territory_manager">Territory Manager</option>
                  <option value="reviewer">Reviewer</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2447] text-white font-semibold rounded-lg"
                >
                  Grant Admin Access
                </button>
              </form>

              <div className="text-xs text-slate-600">
                Active Configured Admins: {adminUsers.length} (plus primary bootstrapped super-admin)
              </div>
            </div>

            {/* Notification & Audit Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F2447]">
                  <FileText className="w-4 h-4" />
                  <span>Notification Logs ({notificationLogs.length})</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                  {notificationLogs.slice(0, 15).map((n) => (
                    <div key={n.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-bold uppercase">{n.channel}</span> ·{' '}
                      <span>{n.eventType}</span> ·{' '}
                      <span className="font-mono">{n.status}</span>
                      <p className="text-slate-500 mt-0.5">{n.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F2447]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Admin Audit Logs ({auditLogs.length})</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                  {auditLogs.slice(0, 15).map((l) => (
                    <div key={l.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-bold">{l.action}</span> ·{' '}
                      <span className="text-slate-500">{l.actorEmail}</span>
                      <p className="text-slate-700 mt-0.5">{l.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
