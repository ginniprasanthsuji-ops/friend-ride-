# Phase 7 — Storage, Profile Photos & KYC Documents Audit (R6)

**Scope:** Static review of storage upload/read paths in `index.html`. This audit documents current client paths and required authorization checks. No live Supabase Storage policy inspection, authenticated runtime tests, or database/storage changes were performed.

## Reviewed storage buckets and paths

- **Driver KYC:** `driver-kyc-documents`; admin list is obtained through `admin_list_driver_documents`; document preview uses signed URL with 300-second expiry.
- **Profile photos:** `driver-profile-photos`, `partner-profile-photos`, `customer-profile-photos`; upload paths are UID-prefixed, profile column update filters by profile ID/current UID, reads use signed URLs (commonly 900 seconds; other role-specific views use 300 seconds).
- **Driver payment QR:** `provider-payment-qr`; UID-prefixed upload, save path via `fr_driver_save_payment_qr`; consumer reads use short-lived signed URLs (300–600 seconds).
- **Partner QR:** `partner-qr`; UID-prefixed upload; customer payment option RPC returns path and frontend signs it for 300 seconds. Partner settings preview currently uses `getPublicUrl` for the QR image.
- **Partner catalogue images:** `fr-partner-catalogue`; partner uploads use UID-prefixed path; current frontend uses `getPublicUrl` and passes public URL to catalogue save RPC. One upload path uses `upsert:true`.
- **TASKO provider application KYC:** `fr-service-provider-kyc`; UID-prefixed profile and identity document paths, upload followed by application insert. Photo and ID upload uses non-upsert. If second upload fails, first photo is removed; if application insert fails, current visible path does not clearly clean both uploaded objects.
- **Partner QR dual upload:** `partner-qr` and `provider-payment-qr`; both UID-prefixed, non-upsert. If RPC fails, frontend attempts cleanup of uploaded objects.

## Security risks / required backend policy validation

1. **UID path ownership:** For private buckets, Storage policies must enforce authenticated UID ownership of the first path segment, not trust client path construction. Verify every bucket separately.
2. **Bucket visibility:** KYC, profile photos, payment QR, and identity documents should be private; public catalogue images may be public only if that is an intentional business rule. Confirm bucket configuration rather than infer from frontend.
3. **Partner QR public access:** `partner-qr` preview uses `getPublicUrl`; determine whether the bucket is public. Public bucket URLs bypass signed-URL access checks, so private payment QR exposure should be avoided.
4. **Catalogue public images:** `fr-partner-catalogue` uses public URLs. Confirm no sensitive image types/content can be uploaded and that public read is intentionally limited to catalogue imagery. Validate RPC image URL/path so partners cannot point records to arbitrary URLs or another user's content.
5. **Overwrite controls:** Profile and KYC uploads use `upsert:false`; catalogue upload paths include generated UID/SKU or UUID but some use `upsert:true`. Policies should prevent overwrite of another user's object even if the path is manipulated.
6. **Profile row ownership:** Profile photo update must allow only the authenticated UID and only the role-appropriate photo column. Validate column-level privileges/RLS; client filter `eq('id', currentUser.id)` is not a security boundary.
7. **Admin document access:** Admin RPC and signed URLs require server-side admin authorization. Confirm only approved admin identities can call the RPC and that signed URLs are issued only for authorized document records.
8. **Provider application:** `fr_service_provider_applications` insert must enforce `provider_id=auth.uid()`, restrict status/approval fields, validate required fields and document paths, and prevent cross-user path references.
9. **Cleanup/orphan files:** registration and application flows must clean up files when subsequent database writes fail. Test every partial-upload failure; orphan objects should not be left indefinitely.
10. **File validation:** Frontend MIME and size checks are bypassable. Enforce server/storage constraints as feasible; reject dangerous content, mismatched MIME/extension, oversized objects, and non-image content in photo buckets. Identity documents should not be accepted in public catalogue buckets.
11. **Signed URL lifecycle:** Confirm signed URLs are short-lived, not logged, and not stored as permanent profile fields. Verify logout/account switching clears cached previews and does not reuse old signed links.
12. **Data minimization:** Avoid exposing ID document paths, private bucket URLs, full identity details, or sensitive metadata in public profile/partner/driver queries.

## Staging QA matrix (isolated fake accounts)

- Customer A cannot read/write Customer B profile photo objects or path columns.
- Driver A cannot upload/read/delete Driver B KYC or profile photo objects; profile path cannot be changed to another UID's object.
- Partner A cannot overwrite Partner B QR/catalogue objects or save references to B's private object paths.
- Customer can access intended public catalogue images only; cannot retrieve private profile, payment QR or KYC objects without authorized signed URL.
- Admin KYC list RPC is denied to non-admin accounts; signed URL only for documents returned under authorized admin access.
- Signed URL expiry is tested at 300/600/900 seconds and expired URL is rejected.
- Partial registration upload failures and application insert failures trigger cleanup; verify no orphan files remain.
- MIME spoofing, oversized files, path traversal, UID mismatch, duplicate upload, upsert overwrite, and bucket-crossing attempts.
- Account logout/switching clears old photo/document UI and old signed URL previews.
- Validate public partner catalogue images are only intended product images and not KYC/private documents.

## Result

**Static audit complete; Storage bucket settings, policies, server authorization, and staging runtime tests remain unverified.** This R6 audit only adds documentation to the Phase 7 branch. No production/main, Supabase schema, RLS, Storage policies, authentication, or application code was modified.
