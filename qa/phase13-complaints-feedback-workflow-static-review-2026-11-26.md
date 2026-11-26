# FRIEND RIDE Phase 13 — Complaints & Feedback Workflow Static Review (2026-11-26)

## Scope
Static source inspection of QA branch `index.html`, blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`. No database/runtime execution.

## Customer submission source
- Requires signed-in user and profile.
- Complaint/feedback type selected; message length validation is 5–2000 characters.
- Feedback requires a 1–5 rating.
- Submission includes current user ID, role, message, optional rating, optional ride ID for complaints, submitter name and phone.
- Inserts to `fr_support_feedback`; on success clears message/ride ID and shows success text.
- The frontend insert handler does not independently confirm DB policies or anti-abuse controls.

## Admin source
- Admin list handler requires signed-in user and frontend role `admin`.
- Selects all columns, orders newest-first, limit 150.
- Complaint controls: In Review, Resolve, Close.
- Feedback controls: publish/remove from homepage and Close.
- Status updates write status and timestamp; feedback publishing writes `show_on_homepage`, status and timestamp.
- Frontend role check alone does not establish server authorization.

## Risks / evidence gaps
1. RLS for customer own-row insert and Admin-only select/update was not inspected or executed.
2. Admin list selects all columns; ensure only appropriate data is stored and authorized.
3. No server-side status transition allowlist evidence was reviewed.
4. Feedback publication policy and homepage query filter were not verified together.
5. Rate limiting/duplicate complaint abuse protection is not established by this source review.
6. The release gate's table/policy mapping is still pending runtime evidence.

## Test status
- Static source review: completed.
- Runtime/SQL tests: not executed.
- Production changes/deployments: 0.
- Fixes: 0.

## Release posture
Complaint/feedback form, submission, Admin review, and homepage feedback control are source-wired. Backend policy, Admin authorization, publication behavior, and runtime workflow remain unverified. Release remains blocked.
