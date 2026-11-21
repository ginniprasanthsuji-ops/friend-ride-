# FRIEND RIDE QA Regression Gate

QA recovery branch: qa/ui-regression-recovery-2026-11-22
PR: #34

## Required automated checks
- [ ] Inline JavaScript syntax validation
- [ ] Playwright browser regression suite
- [ ] Navigation isolation and 5-tab bottom navigation
- [ ] Cycle Delivery card, route, pricing calculator, partner login entry
- [ ] VidyaSetu Teacher, Student, Coaching Center entry points
- [ ] Teacher dashboard and role-selector return navigation
- [ ] Notification bell and profile avatar fallback
- [ ] No browser JavaScript errors in added smoke tests

## Release gate
Do not merge QA to main or deploy unless the complete regression workflow succeeds and the UI migration is reviewed. If CI is unavailable or incomplete, keep main and live deployment untouched.
