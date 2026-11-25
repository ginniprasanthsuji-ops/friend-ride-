# Phase 7B — Session Restore / Logout Source Review
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety

## Source inspected
- `index.html` session/auth setup, OTP session acceptance, later stability patch and centralized restore/logout.
- Existing role and session browser tests.

## Source-backed positive controls
- Supabase Auth configured with local persistence and auto-refresh.
- Session restore uses `sb.auth.getSession()` and retries profile/admin membership reads; it does not explicitly sign out on transient read failure.
- Authoritative role routing derives Admin from `admin_users` membership in the stable restore path and rejects invalid roles.
- Explicit logout calls local Supabase signOut, resets in-memory user/profile/role, removes saved selected-role key, stops realtime, and stops driver GPS/request polling.
- Signed-out auth event clears currentUser/currentProfile and stops driver polling.

## Review concerns (source-only, not runtime confirmed)
1. **Logout timer cleanup appears incomplete:** stable final logout clears driver polling and customer tracking timer, but the earlier code also has `frCustomerRideRefreshTimer`; confirm that the final logout wrapper/stop routine clears it. It may remain scheduled, although callbacks guard on current role/user.
2. **Profile cache remains after logout:** `friendride_profile_cache_<uid>` is retained. It is UID-keyed and not used as the active user on its own, but stale cached profile material remains on the device. Consider clear-on-logout after assessing whether needed for retry fallback.
3. **Admin fallback risk during profile acceptance:** in the stable accept handler, an `admin_users` query error plus cached/profile role `admin` can produce `isAdmin=true`. The stable restore path requires a successful admin membership read first, but other acceptSession call paths may encounter this branch. Admin access should fail closed when membership cannot be verified.
4. **Cross-user isolation is not proven:** no real account A/B, device restart, unauthorized direct route, or backend RLS test was run.

## Required follow-up (not executed)
- Test logout and confirm all realtime channels, polling timers, GPS watch, and role/user context are stopped.
- Confirm Account A cache does not expose data after Account B login.
- Verify admin membership read failures cannot grant Admin role in any session acceptance path.
- Verify Admin authorization is enforced by backend RLS/RPC, not only UI role checks.

## Status
- Source review checkpoint completed.
- No code, SQL, configuration, deployment or production changes.
- Runtime tests not executed.
- Phase 7B progress: **77%** (source-level security review advanced; live test gates remain open).
