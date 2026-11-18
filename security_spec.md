# Security Specification — INDEPENDENCE FMCG Corporate Portal

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path in Firestore defaults to `allow read, write: if false;`.
2. **Admin Identity Verification**: Admin privileges require `request.auth != null && request.auth.token.email_verified == true` AND either the bootstrapped super-admin email (`luckymain143@gmail.com`) or an active document in `/admins/{request.auth.uid}`.
3. **Strict PII Isolation**:
   - `/applications/{applicationId}` contains applicant name, mobile, email, address, PAN/GST metadata. Only verified admins may `get`, `list`, `update`, or `delete`. Public users may ONLY `create` with initial status `'Application Submitted'` and zero internal remarks.
   - `/applications/{applicationId}/documents/{docId}` contains KYC/property files. Only verified admins may `get`, `list`, `update`, or `delete`. Public users may ONLY `create` alongside an application creation using `existsAfter`.
   - `/enquiries/{enquiryId}` contains contact PII. Only verified admins may `read`, `update`, or `delete`. Public users may ONLY `create` with status `'new'`.
4. **Zero-Leak Public Tracking**:
   - `/tracking_records/{trackingKey}` has `allow list: if false;` to prevent collection enumeration or scraping.
   - `allow get` requires knowing the exact deterministic key `ReferenceID__Mobile` (`^[A-Z0-9\\-]+__[0-9]{10,15}$`), and the document contains zero PII (no name, mobile, email, address, PAN, GST, or documents).
5. **Temporal Integrity**: `createdAt`, `submittedAt`, `updatedAt`, `uploadedAt`, and `changedAt` must equal `request.time`.
6. **Size & Type Bounds**: Every string field enforces `.size()` limits; document uploads enforce allowed MIME types (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) and max payload size (`<= 800000` chars).

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. **Unverified Email Admin Spoof**: Authenticated user with `email: 'luckymain143@gmail.com'` and `email_verified: false` attempting `get` on `/applications/app_1`.
2. **Self-Promoted Admin**: Non-admin authenticated user writing `/admins/{uid}` with `{ role: 'super_admin', active: true }`.
3. **Application List Scraping**: Unauthenticated or non-admin user running `list` on `/applications`.
4. **Document Download Bypass**: Non-admin user running `get` on `/applications/app_1/documents/doc_1`.
5. **Status Skipping on Submission**: Public applicant creating `/applications/app_1` with `status: 'Approved'` instead of `'Application Submitted'`.
6. **Shadow Field Injection on Application**: Public applicant creating `/applications/app_1` with extra ghost field `isVerified: true` or `internalRemarks: 'auto-approved'`.
7. **Tracking Collection Enumeration**: Unauthenticated user running `list` on `/tracking_records` to harvest reference IDs.
8. **Invalid Tracking Key Format**: User attempting `get` on `/tracking_records/short` without `REF__MOBILE` format.
9. **Client Timestamp Forgery**: Creating `/enquiries/enq_1` with backdated `createdAt` not equal to `request.time`.
10. **Oversized Document Poisoning**: Creating `/applications/app_1/documents/doc_1` with `dataUrl.size() > 800000` or invalid `mimeType: 'application/x-msdownload'`.
11. **Public Product Tampering**: Non-admin user attempting `update` on `/products/prod_1` to alter descriptions or publish draft items.
12. **Path Variable Poisoning**: Attacker attempting `create` at `/applications/` + 200-char non-alphanumeric document ID.
