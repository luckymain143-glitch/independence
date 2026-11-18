export type OpportunityCategory =
  | 'dealership'
  | 'cf_agency'
  | 'super_stockist'
  | 'distributorship';

export type ApplicationStatus =
  | 'Application Submitted'
  | 'Initial Screening'
  | 'Under Verification'
  | 'Documents Pending'
  | 'Business Evaluation'
  | 'Territory Availability Check'
  | 'Management Review'
  | 'Approved'
  | 'Rejected';

export const APPLICATION_WORKFLOW_STEPS: ApplicationStatus[] = [
  'Application Submitted',
  'Initial Screening',
  'Under Verification',
  'Documents Pending',
  'Business Evaluation',
  'Territory Availability Check',
  'Management Review',
  'Approved',
  'Rejected',
];

export const OPPORTUNITY_LABELS: Record<OpportunityCategory, string> = {
  dealership: 'FMCG Dealership',
  cf_agency: 'C&F Agency (Carrying & Forwarding)',
  super_stockist: 'Super Stockist',
  distributorship: 'FMCG Distributorship',
};

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface WebsiteSettings {
  id: string;
  companyName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  heroBannerUrl?: string;
  aboutIntro?: string;
  vision?: string;
  mission?: string;
  objectives?: string;
  qualityCommitment?: string;
  distributionStrategy?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  officeAddress?: string;
  faqs?: FaqItem[];
  updatedAt?: unknown;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  productInfo?: string;
  packSizes?: string;
  imageUrl?: string;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  isSample?: boolean;
}

export interface InvestmentSetting {
  id: string;
  opportunityType: OpportunityCategory;
  title: string;
  summary: string;
  initialInvestment?: string;
  securityDeposit?: string;
  initialStock?: string;
  infrastructure?: string;
  warehouse?: string;
  transportation?: string;
  otherCharges?: string;
  termsLabel:
    | 'Estimated Indicative Range'
    | 'Approved Commercial Terms'
    | 'Subject to Territory Assessment';
  disclaimer: string;
  eligibilityPoints?: string[];
  requiredDocuments?: string[];
}

export interface Territory {
  id: string;
  state: string;
  stateType: 'State' | 'Union Territory';
  district: string;
  city: string;
  pinCode: string;
  status: 'open' | 'closed' | 'allocated';
  availableCategories: OpportunityCategory[];
  allocatedPartner?: string;
}

export interface UploadedDocumentInput {
  docType: string;
  fileName: string;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize: number;
  dataUrl: string;
  file?: File;
}

export interface ApplicationDocumentRecord {
  id: string;
  applicationId: string;
  docType: string;
  fileName: string;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize: number;
  storageProvider: 'firebase_storage' | 'firestore_private_vault';
  storagePath?: string;
  dataUrl?: string;
  verified: boolean;
  uploadedAt?: unknown;
}

export interface StatusTimelineItem {
  status: ApplicationStatus;
  remark: string;
  changedBy: string;
  changedAtIso: string;
}

export interface ApplicationRecord {
  id: string;
  applicationRefId: string;
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
  status: ApplicationStatus;
  internalRemarks?: string;
  publicRemarks?: string;
  pendingDocuments?: string[];
  documentCount: number;
  trackingKey: string;
  submittedAt?: unknown;
  updatedAt?: unknown;
}

export interface TrackingRecord {
  applicationId: string;
  applicationRefId: string;
  category: OpportunityCategory;
  state: string;
  district: string;
  status: ApplicationStatus;
  publicRemarks?: string;
  pendingDocuments?: string[];
  timeline: StatusTimelineItem[];
  submittedAt?: unknown;
  updatedAt?: unknown;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  mobile: string;
  email: string;
  enquiryType:
    | 'Business Enquiry'
    | 'Franchise Enquiry'
    | 'Dealership Support'
    | 'C&F Support'
    | 'Distributor Support'
    | 'General Support';
  state?: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt?: unknown;
}

export interface AdminUserRecord {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'operations_admin' | 'territory_manager' | 'reviewer';
  active: boolean;
}

export interface NotificationLogRecord {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  recipientMasked: string;
  eventType: string;
  applicationRefId?: string;
  status: 'sent' | 'not_configured' | 'failed';
  detail?: string;
  createdAt?: unknown;
}

export interface AuditLogRecord {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt?: unknown;
}

export interface IntegrationStatusResponse {
  email: { configured: boolean; provider: string; status: 'READY' | 'NOT CONFIGURED' };
  whatsapp: { configured: boolean; provider: string; status: 'READY' | 'NOT CONFIGURED' };
  sms: { configured: boolean; provider: string; status: 'READY' | 'NOT CONFIGURED' };
}
