# Learn & Teach QA Backend Reconciliation Plan

Date: 2026-11-21
Branch: qa/navigation-isolation-fix-2026-11-21

## Findings (read-only)
- QA Supabase project currently exposes the `fr_learn_*` education schema.
- Production Supabase project exposes the `learn_teach_*` schema consumed by `learn-teach.js`.
- Frontend source queries `learn_teach_accounts`, `learn_teach_courses`, `learn_teach_requests`, `learn_teach_notification_settings`, and `learn_teach_notifications`.
- QA homework source table is `fr_learn_homework`: `id`, `session_id`, `teacher_id`, `student_id`, `homework_date`, `checklist` (jsonb), student confirmation and teacher approval fields, feedback and timestamps.
- QA does not currently have frontend-required `learn_teach_*` tables. Production was not changed.

## Options
1. Preferred for safe QA: create/use a dedicated QA Supabase project and mirror production `learn_teach_*` schema + migrations, with test accounts and no production data.
2. Alternative: refactor frontend to the QA `fr_learn_*` schema. This is a larger contract change and requires UI/CRUD mapping review before coding.

## Homework reminder data contract (draft only)
- Source: `fr_learn_homework`.
- Recipient: `student_id`; teacher owner: `teacher_id`.
- Due date/time is not present as a timestamp in this table; `homework_date` is date-only. Reminders need an explicit reminder schedule/assignment due time or a product-approved default. Do not infer a due time silently.
- `checklist` is jsonb; content extraction needs schema validation before use in notification text.
- Reminder idempotency should key by homework row + recipient + reminder schedule slot.
- Preferences, consent, quiet hours, caps, timezone, delivery retries, and sender secret must be enforced server-side.

## Release safety
- This is a plan, not applied SQL.
- No migration has been applied; no Edge Function or cron deployed; no production changes.
- Must test RLS using student, teacher/provider, and admin test accounts in isolated QA.
- Browser CI success does not prove backend notification delivery or device push.
