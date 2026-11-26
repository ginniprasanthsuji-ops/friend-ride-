# QA Live App Feature Gap Audit — 2026-11-26

## Confirmed deployment vs code state
- GitHub Actions Run #6 is successful and deploys the QA branch.
- The deployed commit is `573c15b9e25b396a175620fc2c4d3b05a3d171b0`.
- QA branch `index.html` is 993,579 characters and identifies itself as FRIEND RIDE V11.1 PRO / application-version `11.1-PRO-category-routing-learning-isolation`.
- Main branch `index.html` has the same title/version/size and content as the QA branch index at the time of audit. Thus the successful deploy did not contain the separate feature-branch changes the user expects.
- GitHub Pages uses the `github-pages` environment, and custom domain `friendride.in` is configured. The QA branch preview therefore appears on the public custom domain; this is not a private staging URL.

## Feature presence quick scan in deployed QA index
- Learn & Teach: absent
- Shared Ride: absent
- Smart Grocery EMI: absent
- Delivery Instructions: absent
- Cycle Delivery: present (string scan only)
- TASKO/Laundry: string matches present, but string presence is not proof the feature workflow is integrated or functional.
- Admin Dashboard / Home Service strings present; functionality not verified.

## Candidate branches found
- `feature/learn-teach-marketplace-qa`: has Learn/Teach feature files and migrations, but branch is substantially behind main (166+ commits divergent); do not merge wholesale.
- `feature/tasko-laundry-services`: has TASKO/Laundry feature files and SQL/tests, but branch is substantially behind main (100+ commits divergent); do not merge wholesale.
- `friendride-ui-navy-orange-live-preview`: small branch with UI index changes (2 files); needs visual and functional diff review.
- `qa/phase8-14-error-recovery-2026-11-24`, `qa/phase8-15-role-authorization-2026-11-24`, `qa/phase8-16-notification-consistency-2026-11-24`, `phase14-qa-live-preview`: index remains V11.1 identical-size version; these branches mostly contain additional QA/docs and do not by themselves change the deployed Home UI.

## Next safe plan
1. Do not merge feature branches wholesale.
2. Audit each intended feature branch file-by-file and isolate feature UI/code/SQL/tests that are compatible with current V11.1.
3. Integrate selected changes onto QA branch only, preserving existing app and role separation.
4. Deploy QA preview after each integration batch, verify on the live preview, and let user review/correct.
5. Only after user approves reviewed changes, consider main merge/deployment. Production remains untouched until explicit approval.

## Status
- Live deployment succeeded but app feature content is not fully updated as expected.
- Feature integration: not started; branch-level audit finding recorded.
- Production code/SQL: untouched.
