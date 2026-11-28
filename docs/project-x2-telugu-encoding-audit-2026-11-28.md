# Project X2 Telugu/emoji text encoding audit — 2026-11-28

Target branch: `yt-test-1-to-15` only. Main/Production untouched.

## Evidence
- Inspected `index.html` homepage service/quick-action and poster rail around the homepage markup.
- Confirmed literal mojibake sequences in user-visible Telugu copy and symbols, including the driver-partner benefit/safety poster, referral poster, fast-delivery poster, drive-safe/road-safety copy, and multiple homepage emoji/icon strings.
- Example source fragments contain malformed byte-decoding patterns such as `à°...`, `â¹`, and emoji sequences rendered as `ð...`.
- This is a source-level finding. Browser/device screenshots and Telugu rendering checks have not yet been run.

## Impact
- Telugu marketing/safety copy can display unreadable text.
- Emoji, rupee symbol and bullet characters may render incorrectly.
- Existing CI build, audit and Playwright checks do not currently prove visible-text encoding integrity.

## Safe correction plan
1. Scope a targeted homepage text restoration pass; avoid global replacement of every Unicode sequence because valid multilingual text and legacy copy may be mixed.
2. Restore Telugu copy from reviewed source wording or owner-approved translations; do not invent legal/safety promises.
3. Replace malformed emoji/symbol literals with known valid Unicode symbols where intended.
4. Add a regression test that checks the reviewed homepage poster/service copy for known mojibake markers, using a narrow allowlist for unrelated legacy strings.
5. Run build, audit, Playwright and deployment checks; follow with Android screenshot/manual Telugu rendering verification.

## Status
- Finding confirmed in source.
- No homepage text changed in this audit commit.
- No database, live orders, payments, or production settings changed.
- CI green on prior commit `ae11348a759a747d4772198733e913d62f8eb838`.
