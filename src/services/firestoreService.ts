import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getBlob, ref, uploadBytes } from 'firebase/storage';
import { auth, db, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import {
  DEFAULT_INVESTMENT_SETTINGS,
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_SAMPLE_PRODUCTS,
  DEFAULT_WEBSITE_SETTINGS,
} from '../data/seedData';
import type {
  AdminUserRecord,
  ApplicationDocumentRecord,
  ApplicationRecord,
  ApplicationStatus,
  AuditLogRecord,
  EnquiryRecord,
  IntegrationStatusResponse,
  InvestmentSetting,
  NotificationLogRecord,
  OpportunityCategory,
  Product,
  ProductCategory,
  StatusTimelineItem,
  Territory,
  TrackingRecord,
  UploadedDocumentInput,
  WebsiteSettings,
} from '../types';

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function validateFileMagicBytes(file: File): Promise<{ valid: boolean; reason?: string }> {
  try {
    const slice = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(slice);
    if (bytes.length < 4) {
      return { valid: false, reason: 'File is empty or corrupted.' };
    }
    if (file.type === 'application/pdf') {
      const isPdf =
        bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
      return isPdf ? { valid: true } : { valid: false, reason: 'File signature does not match a valid PDF (%PDF-).' };
    }
    if (file.type === 'image/jpeg') {
      const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      return isJpg ? { valid: true } : { valid: false, reason: 'File signature does not match a valid JPEG image.' };
    }
    if (file.type === 'image/png') {
      const isPng =
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      return isPng ? { valid: true } : { valid: false, reason: 'File signature does not match a valid PNG image.' };
    }
    if (file.type === 'image/webp') {
      const isWebp =
        bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
      return isWebp ? { valid: true } : { valid: false, reason: 'File signature does not match a valid WEBP image.' };
    }
    return { valid: false, reason: 'Unsupported MIME type.' };
  } catch {
    return { valid: false, reason: 'Unable to read binary file header.' };
  }
}

export function generateApplicationRefId(category: OpportunityCategory): string {
  const codeMap: Record<OpportunityCategory, string> = {
    dealership: 'DLR',
    cf_agency: 'CFA',
    super_stockist: 'SSK',
    distributorship: 'DST',
  };
  const year = new Date().getFullYear();
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `IND-${codeMap[category]}-${year}-${suffix}`;
}

export async function fetchWebsiteSettings(): Promise<WebsiteSettings> {
  const path = 'website_settings/corporate';
  try {
    const snap = await getDoc(doc(db, 'website_settings', 'corporate'));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<WebsiteSettings, 'id'>) };
    }
    return DEFAULT_WEBSITE_SETTINGS;
  } catch (error) {
    console.warn('Using default website settings fallback:', error);
    return DEFAULT_WEBSITE_SETTINGS;
  }
}

export async function saveWebsiteSettings(
  settings: WebsiteSettings,
  actorEmail: string
): Promise<void> {
  const path = 'website_settings/corporate';
  try {
    const { id: _id, updatedAt: _u, ...rest } = settings;
    await setDoc(doc(db, 'website_settings', 'corporate'), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
    await createAuditLog(actorEmail, 'UPDATE_WEBSITE_SETTINGS', 'website_settings', 'corporate', 'Updated corporate website content and contact details.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  const path = 'product_categories';
  try {
    const snap = await getDocs(query(collection(db, path), orderBy('sortOrder', 'asc')));
    if (snap.empty) return DEFAULT_PRODUCT_CATEGORIES;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductCategory, 'id'>) }));
  } catch (error) {
    console.warn('Using default product categories fallback:', error);
    return DEFAULT_PRODUCT_CATEGORIES;
  }
}

export async function saveProductCategory(
  cat: ProductCategory,
  actorEmail: string
): Promise<void> {
  const docId = (cat.id || cat.slug).replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `product_categories/${docId}`;
  try {
    const existing = await getDoc(doc(db, 'product_categories', docId));
    await setDoc(doc(db, 'product_categories', docId), {
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      sortOrder: Number(cat.sortOrder) || 1,
      active: Boolean(cat.active),
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await createAuditLog(actorEmail, 'UPSERT_CATEGORY', 'product_categories', docId, `Saved product category ${cat.name}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductCategory(id: string, actorEmail: string): Promise<void> {
  const path = `product_categories/${id}`;
  try {
    await deleteDoc(doc(db, 'product_categories', id));
    await createAuditLog(actorEmail, 'DELETE_CATEGORY', 'product_categories', id, `Deleted product category ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchProducts(includeAll = false): Promise<Product[]> {
  const path = 'products';
  try {
    const q = includeAll
      ? query(collection(db, path))
      : query(collection(db, path), where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (snap.empty && !includeAll) return DEFAULT_SAMPLE_PRODUCTS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
  } catch (error) {
    if (includeAll) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Using default sample products fallback:', error);
    return DEFAULT_SAMPLE_PRODUCTS;
  }
}

export async function saveProduct(product: Product, actorEmail: string): Promise<void> {
  const docId = (product.id || makeId('prod')).replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `products/${docId}`;
  try {
    const existing = await getDoc(doc(db, 'products', docId));
    await setDoc(doc(db, 'products', docId), {
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      description: product.description,
      productInfo: product.productInfo || '',
      packSizes: product.packSizes || '',
      imageUrl: product.imageUrl || '',
      status: product.status,
      featured: Boolean(product.featured),
      isSample: Boolean(product.isSample),
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await createAuditLog(actorEmail, 'UPSERT_PRODUCT', 'products', docId, `Saved product ${product.name} (${product.status})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(id: string, actorEmail: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
    await createAuditLog(actorEmail, 'DELETE_PRODUCT', 'products', id, `Removed product ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchInvestmentSettings(): Promise<Record<OpportunityCategory, InvestmentSetting>> {
  const path = 'investment_settings';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return DEFAULT_INVESTMENT_SETTINGS;
    const merged = { ...DEFAULT_INVESTMENT_SETTINGS };
    snap.docs.forEach((d) => {
      const key = d.id as OpportunityCategory;
      if (key in merged) {
        merged[key] = { id: d.id, ...(d.data() as Omit<InvestmentSetting, 'id'>) };
      }
    });
    return merged;
  } catch (error) {
    console.warn('Using default investment settings fallback:', error);
    return DEFAULT_INVESTMENT_SETTINGS;
  }
}

export async function saveInvestmentSetting(
  setting: InvestmentSetting,
  actorEmail: string
): Promise<void> {
  const path = `investment_settings/${setting.opportunityType}`;
  try {
    const { id: _id, ...rest } = setting;
    await setDoc(doc(db, 'investment_settings', setting.opportunityType), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
    await createAuditLog(
      actorEmail,
      'UPDATE_INVESTMENT_TERMS',
      'investment_settings',
      setting.opportunityType,
      `Updated investment configuration for ${setting.title}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchTerritories(): Promise<Territory[]> {
  const path = 'territories';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Territory, 'id'>) }));
  } catch (error) {
    console.warn('Could not load territories:', error);
    return [];
  }
}

export async function saveTerritory(territory: Territory, actorEmail: string): Promise<void> {
  const docId = (territory.id || `${territory.state}_${territory.district}_${territory.pinCode}`)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const path = `territories/${docId}`;
  try {
    await setDoc(doc(db, 'territories', docId), {
      state: territory.state,
      stateType: territory.stateType,
      district: territory.district,
      city: territory.city,
      pinCode: territory.pinCode,
      status: territory.status,
      availableCategories: territory.availableCategories,
      allocatedPartner: territory.allocatedPartner || '',
      updatedAt: serverTimestamp(),
    });
    await createAuditLog(
      actorEmail,
      'UPSERT_TERRITORY',
      'territories',
      docId,
      `Configured territory ${territory.city}, ${territory.district}, ${territory.state} (${territory.status})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTerritory(id: string, actorEmail: string): Promise<void> {
  const path = `territories/${id}`;
  try {
    await deleteDoc(doc(db, 'territories', id));
    await createAuditLog(actorEmail, 'DELETE_TERRITORY', 'territories', id, `Removed territory ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitPartnerApplication(params: {
  category: OpportunityCategory;
  applicantName: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  preferredTerritory: string;
  businessDetails: Record<string, string>;
  documents: UploadedDocumentInput[];
}): Promise<{ applicationRefId: string; applicationId: string; trackingKey: string }> {
  const applicationId = makeId('app');
  const applicationRefId = generateApplicationRefId(params.category);
  const cleanMobile = params.mobile.replace(/\D/g, '');
  const trackingKey = `${applicationRefId}__${cleanMobile}`;
  const nowIso = new Date().toISOString();

  const initialTimelineItem: StatusTimelineItem = {
    status: 'Application Submitted',
    remark: 'Application received and queued for initial screening.',
    changedBy: 'Applicant Portal',
    changedAtIso: nowIso,
  };

  try {
    const batch = writeBatch(db);

    const appRef = doc(db, 'applications', applicationId);
    batch.set(appRef, {
      applicationRefId,
      category: params.category,
      applicantName: params.applicantName.trim(),
      mobile: cleanMobile,
      email: params.email.trim(),
      state: params.state,
      district: params.district,
      city: params.city,
      pinCode: params.pinCode.trim(),
      preferredTerritory: params.preferredTerritory.trim(),
      businessDetails: params.businessDetails,
      status: 'Application Submitted',
      publicRemarks: 'Application received and queued for initial screening.',
      pendingDocuments: [],
      documentCount: params.documents.length,
      trackingKey,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const trackRef = doc(db, 'tracking_records', trackingKey);
    batch.set(trackRef, {
      applicationId,
      applicationRefId,
      category: params.category,
      state: params.state,
      district: params.district,
      status: 'Application Submitted',
      publicRemarks: 'Application received and queued for initial screening.',
      pendingDocuments: [],
      timeline: [initialTimelineItem],
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const histId = makeId('hist');
    batch.set(doc(db, 'applications', applicationId, 'history', histId), {
      applicationId,
      status: 'Application Submitted',
      remark: 'Application submitted online by applicant.',
      changedBy: 'Applicant Portal',
      changedAt: serverTimestamp(),
    });

    for (const d of params.documents) {
      const docId = makeId('doc');
      const safeExt = d.fileName.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
      const storagePath = `applications/${applicationId}/documents/${docId}.${safeExt}`;
      let storedInFirebaseStorage = false;

      if (d.file) {
        try {
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, d.file, { contentType: d.mimeType });
          storedInFirebaseStorage = true;
        } catch {
          // Firebase Storage bucket is not activated or unavailable; fall back to private Firestore vault if within size limits
          storedInFirebaseStorage = false;
        }
      }

      if (storedInFirebaseStorage) {
        batch.set(doc(db, 'applications', applicationId, 'documents', docId), {
          applicationId,
          docType: d.docType,
          fileName: d.fileName,
          mimeType: d.mimeType,
          fileSize: d.fileSize,
          storageProvider: 'firebase_storage',
          storagePath,
          verified: false,
          uploadedAt: serverTimestamp(),
        });
      } else {
        if (d.fileSize > 550 * 1024 || !d.dataUrl) {
          throw new Error(
            `Document "${d.fileName}" exceeds 550 KB fallback vault size and Firebase Storage bucket is not activated.`
          );
        }
        batch.set(doc(db, 'applications', applicationId, 'documents', docId), {
          applicationId,
          docType: d.docType,
          fileName: d.fileName,
          mimeType: d.mimeType,
          fileSize: d.fileSize,
          storageProvider: 'firestore_private_vault',
          dataUrl: d.dataUrl,
          verified: false,
          uploadedAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();

    // Attempt configured notification dispatch (returns honest configured/not_configured status)
    try {
      const dispatchRes = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'Application Submitted',
          applicationRefId,
          email: params.email.trim(),
          mobile: cleanMobile,
          applicantName: params.applicantName.trim(),
          category: params.category,
        }),
      });
      if (dispatchRes.ok) {
        const logs = (await dispatchRes.json()) as {
          results: Array<{ channel: 'email' | 'sms' | 'whatsapp'; status: 'sent' | 'not_configured' | 'failed'; detail: string }>;
        };
        for (const r of logs.results) {
          await setDoc(doc(db, 'notifications', makeId('notif')), {
            channel: r.channel,
            recipientMasked: r.channel === 'email' ? maskEmail(params.email) : maskMobile(cleanMobile),
            eventType: 'Application Submitted',
            applicationRefId,
            status: r.status,
            detail: r.detail.slice(0, 380),
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch {
      // Notification dispatch failure must not fail application submission
    }

    return { applicationRefId, applicationId, trackingKey };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `applications/${applicationId}`);
  }
}

function maskEmail(email: string): string {
  const [u, d] = email.split('@');
  if (!d) return '***';
  return `${u.slice(0, 2)}***@${d}`;
}

function maskMobile(mobile: string): string {
  return `******${mobile.slice(-4)}`;
}

export async function lookupTrackingRecord(
  applicationRefId: string,
  mobile: string
): Promise<TrackingRecord | null> {
  const cleanRef = applicationRefId.trim().toUpperCase();
  const cleanMobile = mobile.replace(/\D/g, '');
  const trackingKey = `${cleanRef}__${cleanMobile}`;
  const path = `tracking_records/${trackingKey}`;
  try {
    const snap = await getDoc(doc(db, 'tracking_records', trackingKey));
    if (!snap.exists()) return null;
    return snap.data() as TrackingRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchAllApplications(): Promise<ApplicationRecord[]> {
  const path = 'applications';
  try {
    const snap = await getDocs(query(collection(db, path), orderBy('submittedAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ApplicationRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchApplicationDocuments(
  applicationId: string
): Promise<ApplicationDocumentRecord[]> {
  const path = `applications/${applicationId}/documents`;
  try {
    const snap = await getDocs(collection(db, 'applications', applicationId, 'documents'));
    return snap.docs.map((d) => {
      const data = d.data() as Omit<ApplicationDocumentRecord, 'id'>;
      return {
        id: d.id,
        ...data,
        storageProvider: data.storageProvider || 'firestore_private_vault',
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchPrivateDocumentBlobUrl(
  docRecord: ApplicationDocumentRecord
): Promise<{ objectUrl: string; revoke: () => void }> {
  if (docRecord.storageProvider === 'firebase_storage' && docRecord.storagePath) {
    const blob = await getBlob(ref(storage, docRecord.storagePath));
    const objectUrl = URL.createObjectURL(blob);
    return {
      objectUrl,
      revoke: () => URL.revokeObjectURL(objectUrl),
    };
  }
  if (docRecord.dataUrl) {
    const res = await fetch(docRecord.dataUrl);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return {
      objectUrl,
      revoke: () => URL.revokeObjectURL(objectUrl),
    };
  }
  throw new Error('Private document payload is unavailable.');
}

export async function verifyApplicationDocument(
  applicationId: string,
  docId: string,
  verified: boolean,
  actorEmail: string
): Promise<void> {
  const path = `applications/${applicationId}/documents/${docId}`;
  try {
    await updateDoc(doc(db, 'applications', applicationId, 'documents', docId), {
      verified,
    });
    await createAuditLog(
      actorEmail,
      verified ? 'VERIFY_DOCUMENT' : 'UNVERIFY_DOCUMENT',
      'application_document',
      docId,
      `${verified ? 'Verified' : 'Marked unverified'} document ${docId} on application ${applicationId}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateApplicationWorkflow(params: {
  application: ApplicationRecord;
  newStatus: ApplicationStatus;
  publicRemarks: string;
  internalRemarks: string;
  pendingDocuments: string[];
  actorEmail: string;
}): Promise<void> {
  const { application, newStatus, publicRemarks, internalRemarks, pendingDocuments, actorEmail } =
    params;
  const appPath = `applications/${application.id}`;
  try {
    const trackingRef = doc(db, 'tracking_records', application.trackingKey);
    const trackingSnap = await getDoc(trackingRef);
    const existingTimeline: StatusTimelineItem[] = trackingSnap.exists()
      ? (trackingSnap.data().timeline as StatusTimelineItem[]) || []
      : [];

    const nextTimeline: StatusTimelineItem[] = [
      ...existingTimeline,
      {
        status: newStatus,
        remark: publicRemarks.trim() || `Status updated to ${newStatus}`,
        changedBy: actorEmail,
        changedAtIso: new Date().toISOString(),
      },
    ].slice(-30);

    const batch = writeBatch(db);
    batch.update(doc(db, 'applications', application.id), {
      status: newStatus,
      publicRemarks: publicRemarks.trim(),
      internalRemarks: internalRemarks.trim(),
      pendingDocuments,
      updatedAt: serverTimestamp(),
    });

    if (trackingSnap.exists()) {
      batch.update(trackingRef, {
        status: newStatus,
        publicRemarks: publicRemarks.trim(),
        pendingDocuments,
        timeline: nextTimeline,
        updatedAt: serverTimestamp(),
      });
    }

    batch.set(doc(db, 'applications', application.id, 'history', makeId('hist')), {
      applicationId: application.id,
      status: newStatus,
      remark: publicRemarks.trim() || internalRemarks.trim() || `Updated status to ${newStatus}`,
      changedBy: actorEmail,
      changedAt: serverTimestamp(),
    });

    await batch.commit();

    await createAuditLog(
      actorEmail,
      'UPDATE_APPLICATION_STATUS',
      'applications',
      application.id,
      `${application.applicationRefId} moved to ${newStatus}`
    );

    // Attempt notification dispatch if configured (attach Admin ID token)
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          eventType: `Status Updated: ${newStatus}`,
          applicationRefId: application.applicationRefId,
          email: application.email,
          mobile: application.mobile,
          applicantName: application.applicantName,
          category: application.category,
          remarks: publicRemarks.trim(),
        }),
      });
      if (res.ok) {
        const logs = (await res.json()) as {
          results: Array<{ channel: 'email' | 'sms' | 'whatsapp'; status: 'sent' | 'not_configured' | 'failed'; detail: string }>;
        };
        for (const r of logs.results) {
          await setDoc(doc(db, 'notifications', makeId('notif')), {
            channel: r.channel,
            recipientMasked:
              r.channel === 'email' ? maskEmail(application.email) : maskMobile(application.mobile),
            eventType: `Status: ${newStatus}`,
            applicationRefId: application.applicationRefId,
            status: r.status,
            detail: r.detail.slice(0, 380),
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch {
      // Graceful fallback
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, appPath);
  }
}

export async function submitEnquiry(params: {
  name: string;
  mobile: string;
  email: string;
  enquiryType: EnquiryRecord['enquiryType'];
  state?: string;
  message: string;
}): Promise<string> {
  const id = makeId('enq');
  const path = `enquiries/${id}`;
  try {
    await setDoc(doc(db, 'enquiries', id), {
      name: params.name.trim(),
      mobile: params.mobile.replace(/\D/g, ''),
      email: params.email.trim(),
      enquiryType: params.enquiryType,
      state: params.state || '',
      message: params.message.trim(),
      status: 'new',
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchEnquiries(): Promise<EnquiryRecord[]> {
  const path = 'enquiries';
  try {
    const snap = await getDocs(query(collection(db, path), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EnquiryRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryRecord['status'],
  actorEmail: string
): Promise<void> {
  const path = `enquiries/${id}`;
  try {
    await updateDoc(doc(db, 'enquiries', id), { status });
    await createAuditLog(actorEmail, 'UPDATE_ENQUIRY_STATUS', 'enquiries', id, `Marked enquiry ${id} as ${status}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const path = 'admins';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUserRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function checkUserAdminAccess(uid: string, email: string | null): Promise<boolean> {
  if (email === 'luckymain143@gmail.com') return true;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists() && snap.data().active === true;
  } catch {
    return false;
  }
}

export async function saveAdminUser(admin: AdminUserRecord, actorEmail: string): Promise<void> {
  const uid = admin.uid.trim();
  const path = `admins/${uid}`;
  try {
    const existing = await getDoc(doc(db, 'admins', uid));
    await setDoc(doc(db, 'admins', uid), {
      uid,
      email: admin.email.trim(),
      displayName: admin.displayName.trim(),
      role: admin.role,
      active: admin.active,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await createAuditLog(actorEmail, 'UPSERT_ADMIN_USER', 'admins', uid, `Configured admin ${admin.email} (${admin.role})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchNotificationLogs(): Promise<NotificationLogRecord[]> {
  const path = 'notifications';
  try {
    const snap = await getDocs(query(collection(db, path), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationLogRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  const path = 'audit_logs';
  try {
    const snap = await getDocs(query(collection(db, path), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLogRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createAuditLog(
  actorEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  summary: string
): Promise<void> {
  const id = makeId('audit');
  try {
    await setDoc(doc(db, 'audit_logs', id), {
      actorEmail,
      action,
      targetType,
      targetId,
      summary: summary.slice(0, 580),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Audit log write warning:', error);
  }
}

export async function initializeDefaultCatalogIfEmpty(actorEmail: string): Promise<void> {
  try {
    const catSnap = await getDocs(collection(db, 'product_categories'));
    if (catSnap.empty) {
      for (const cat of DEFAULT_PRODUCT_CATEGORIES) {
        await saveProductCategory(cat, actorEmail);
      }
    }
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      for (const prod of DEFAULT_SAMPLE_PRODUCTS) {
        await saveProduct(prod, actorEmail);
      }
    }
    const invSnap = await getDocs(collection(db, 'investment_settings'));
    if (invSnap.empty) {
      for (const item of Object.values(DEFAULT_INVESTMENT_SETTINGS)) {
        await saveInvestmentSetting(item, actorEmail);
      }
    }
    const wsSnap = await getDoc(doc(db, 'website_settings', 'corporate'));
    if (!wsSnap.exists()) {
      await saveWebsiteSettings(DEFAULT_WEBSITE_SETTINGS, actorEmail);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed_initialization');
  }
}

export async function fetchIntegrationStatus(): Promise<IntegrationStatusResponse> {
  const res = await fetch('/api/integrations/status');
  if (!res.ok) {
    throw new Error('Failed to check notification integration status');
  }
  return res.json() as Promise<IntegrationStatusResponse>;
}
