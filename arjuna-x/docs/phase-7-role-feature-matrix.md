# Phase 7 role-feature matrix checkpoint

A conservative allowlist helper has been added for the Phase 7 roles and manually-supported feature catalog.

- Customer: ride lifecycle, partner order/customer flows, delivery/services, TASKO/Laundry customer workflows.
- Driver: ride lifecycle, driver onboarding/KYC review, delivery/service work.
- Partner: partner orders/quotes, delivery/services, TASKO/Laundry workflows.
- Teacher/Student: Learn/Teach records/homework.
- Admin: listed manual workflows and approvals/complaints.
- Disabled/unknown feature names are denied before role checks.

This matrix is core-policy only. It is not app-route wiring and does not replace Supabase RLS or authorization in existing Edge Functions. Validate against actual product route permissions before integration. No SQL changes were required for this pure policy helper. No production SQL, merge, or deployment.
