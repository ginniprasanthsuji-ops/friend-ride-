# Phase 7 — External JS & Learning Module Audit

Static source audit of QA branch. No SQL or runtime tests executed.

## JS references from index.html
- assets/ride-contact.js — normalization/helper only; prior review found no writes.
- assets/driver-kyc-upload.js — KYC upload module, direct writes reviewed earlier.
- learn-teach.js — separate Learning/Teaching module, newly audited below.
- Leaflet library external CDN reference (mapping library).

## learn-teach.js direct write inventory
- learn_teach_accounts: INSERT 1, UPDATE 1
- learn_teach_requests: INSERT 2, UPDATE 1
- learn_teach_courses: INSERT 1, UPDATE 1
- learn_teach_notifications: INSERT 2, UPDATE 1
- learn_teach_notification_settings: UPSERT 1

These tables/modules were not present in the earlier 21-table QA inventory, so environment/schema lineage must be reconciled before permissions work. Do not apply grants/migrations until table definitions, policies, exact fields, and user/admin role flows are confirmed.

## Module-specific risks to validate
- Accounts: user UID ownership; prevent role/status spoofing.
- Requests: request ownership; allowed status transitions; teacher/student authorization.
- Courses: course owner/teacher UID; moderation/approval state.
- Notifications: sender/recipient ownership, prevent cross-user notification spoofing.
- Notification settings: own user row only; validate preference fields.

## Audit coverage limitation
This static write scan covers the imported `learn-teach.js` and references observed in `index.html`. It does not guarantee complete coverage of dynamically loaded scripts, inline code using variable table names, or other HTML entrypoints. Search all repository HTML/JS and inspect exact callsites next.

## Safety status
No SQL executed, no data mutations. Production untouched. No merge/deploy.
