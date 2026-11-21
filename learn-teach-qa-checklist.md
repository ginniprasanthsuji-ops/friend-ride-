# FRIEND RIDE Learn & Teach QA checklist

## Implemented on QA branch
- [x] Separate Learn tab in bottom navigation
- [x] Learn & Teach landing page and role cards
- [x] Student free registration action
- [x] Course search/category filters
- [x] ₹599/month enrollment request
- [x] Teacher registration form and teaching modes
- [x] ₹129/month teacher subscription request
- [x] Teacher dashboard status display
- [x] Course creation gate: approved teacher + active subscription
- [x] 90-minute class duration labels
- [x] Flexible scheduling note
- [x] Student home-tuition request form
- [x] Teacher application to open tuition requests
- [x] Coaching-center marketplace and institute registration
- [x] Admin approval UI for teachers, courses, institutes
- [x] Admin manual teacher-subscription activation (after payment verification)
- [x] SQL schema and RLS migration drafted

## Not yet live / blockers
- [x] Provision separate FRIEND RIDE QA Supabase project; apply all four Learn & Teach migrations (QA only) there\n- [x] Add SQL owner-update transition hardening migration: prevent student enrollment activation/fee/course changes; restrict tuition-request cancellation and application decisions; allow trusted service-role/admin updates\n- [x] Add CI static checks for RLS, migration constraints, eligibility tiers, one-person center rules, and update-transition guards
- [ ] Cashfree course enrollment payment integration
- [ ] Cashfree teacher ₹129 subscription payment integration
- [ ] Live teacher/student notification delivery
- [ ] Student/teacher schedule booking calendar and 90-minute session slot validation
- [ ] Institute referral attribution / commission tracking
- [ ] Admin approvals tested with real admin account
- [ ] Browser/device regression tests
- [ ] Security advisor review after QA schema deployment

## Regression test cases
1. Existing FRIEND RIDE Home, Friend Mart, Food Delivery, Categories, Orders and Menu tabs still open.
2. Learn tab is visible and opens the Learn page.
3. Student can register with authenticated account; duplicate registration is idempotent.
4. Anonymous user is prompted to login before registration/enrollment/request.
5. Approved course appears in student marketplace and is priced ₹599/month.
6. Enrollment inserts pending_payment; no success is claimed for payment.
7. Teacher registration saves as pending and does not publish courses.
8. Teacher subscription request is ₹129/month and pending_payment.
9. Teacher cannot create course until teacher approval and active subscription.
10. Admin can approve teacher/course/institute and activate teacher subscription after verifying payment.
11. Course creation always fixes monthly fee at ₹599.
12. Student tuition request contains class, subject, area, schedule, mode.
13. Approved subscribed teacher can view open requests and apply.
14. Student can browse approved institutes and send enquiry.
15. RLS prevents another user reading private student/enrollment data or changing approvals.
16. Class-duration UI consistently displays 90 minutes; time schedule is mutually agreed (calendar implementation still pending).
17. One-person coaching center registration requires teacher_count=1, supports multiple subjects, and daily hours are 4 or 5 split into periods.
18. One-person schedule validation rejects period totals below 4, above 5, or not matching the selected daily total.
19. One-person center is shown with the correct label and subject/schedule details after admin approval.
20. Teacher eligibility validation: 10th level cannot exceed Class 6; Intermediate cannot exceed Class 8; Degree cannot exceed Class 10; B.Ed subject-wise requires admin verification.
21. One-person coaching center qualification and class-range validation rejects disallowed combinations.


## Zoom classroom implementation (QA branch)
- [x] Separate QA table for 90-minute Zoom sessions
- [x] RLS limits read access to teacher, student, admin participants
- [x] Session scheduling UI on Teacher mode and participant session list
- [x] Edge Function scaffold uses Zoom Server-to-Server OAuth secrets (server only)
- [x] Host start URL is not sent to client response
- [x] Waiting room enabled and join-before-host disabled
- [x] QA migration applied to FRIEND RIDE QA project
- [x] Session update writes hardened to admin-only
- [x] Add reusable Zoom classroom table keyed by teacher/student/course on QA
- [x] Replace manual student/course UUID entry with active-enrollment picker
- [x] Deploy recurring Zoom meeting creation/reuse Edge Function to QA
- [x] Remove participant-readable host start URL storage
- [ ] Configure Zoom OAuth credentials and host user as QA Edge Function secrets
- [ ] Test Zoom API meeting creation with valid credentials
- [ ] Verify same join URL in teacher + student authenticated accounts
- [ ] Verify unrelated user denied access to meeting link
- [ ] Verify payment/active enrollment gate
- [ ] Run full Playwright and regression suite before merge/deploy
