# Phase 7 — SOS & Live Location Security Test Matrix

QA only; test execution pending test accounts and explicit approval for any write-based test fixtures. No production testing.

## SOS insert
| Test | Expected |
|---|---|
| Customer inserts SOS for own participating ride | Allow if lifecycle workflow permits |
| Assigned driver inserts SOS for assigned ride | Allow if lifecycle workflow permits |
| Authenticated user inserts SOS for unrelated ride | Deny |
| Caller sets sender_id to another user | Deny |
| Anonymous insert | Deny |
| Ride id nonexistent | Deny |

## Live location
| Test | Expected |
|---|---|
| Participant inserts own location row on participating ride | Allow |
| Participant updates own location on same participating ride | Allow |
| Participant changes row user_id to another UID | Deny |
| Participant retargets ride_id to unrelated ride | Deny |
| Nonparticipant reads another ride's live location | Deny |
| Anonymous insert/update/read | Deny |

## Preconditions
- Test identities for customer, assigned driver, unrelated authenticated user, admin, anon.
- Fixtures must be QA-only and disposable; use synthetic data.
- Verify exact lifecycle conditions for SOS and location update before positive tests.
- Capture expected policy and grant behavior; tests must not use service_role for authorization tests.

## Status
- Catalog policy verification: completed read-only.
- Draft hardening SQL: committed, not applied.
- Authenticated runtime regression: not yet executed.
- Rollback artifact: still to be prepared after exact policy/grant snapshot.
