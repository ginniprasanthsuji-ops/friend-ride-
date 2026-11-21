# Learn & Teach Zoom Classroom QA

## User story
After login, teacher schedules a 90-minute session for an active enrolled student. The server creates a Zoom meeting; the same join URL appears in both teacher and student accounts, limited to participants/admins.

## Security requirements
- Zoom account/client credentials are Supabase Edge Function secrets only.
- Client never receives Zoom host start_url.
- RLS restricts sessions to teacher, student, admin.
- Only approved teacher + active enrollment can create a session.
- Sessions must be future-dated and 90 minutes.
- Zoom waiting room enabled; join-before-host disabled.

## QA blockers
- Zoom OAuth Server-to-Server credentials not yet provided/configured.
- Payment integration must activate enrollment before meeting creation.
- Test real Zoom API only after secrets are configured in QA project.

## Regression checklist
- Student cannot create sessions.
- Teacher not approved cannot create.
- Student without active enrollment cannot be scheduled.
- Unrelated logged-in user cannot view link.
- Student and teacher can see same join URL after session is created.
- Host start URL is never returned to student.
- Session duration fixed at 90 minutes.
- Past dates rejected.
- Cancelled/completed state reflected in both dashboards.
- Playwright UI and API tests pass before merge.
