# Phase 11 — Full QA SECURITY DEFINER RPC Role Boundary Sweep

**QA project:** `pqsangtvietawkfgpgfu`  
**Audit mode:** Catalog/source review only. No RPC calls or schema changes.

## Catalog sweep
Reviewed the QA snapshot of public SECURITY DEFINER functions and effective EXECUTE grants for `anon`, `authenticated`, and `service_role`.

### Positive role checks seen in source
- `accept_ride(uuid)`: requires approved Driver role; atomic update only for unassigned requested ride.
- `counter_offer_ride(uuid,numeric)`: requires approved Driver role; validates positive fare; requires driver to have no active ride; updates only an unassigned requested ride.
- `accept_counter_offer(uuid)` and `decline_counter_offer(uuid)`: authenticated customer action scoped by `customer_id=auth.uid()`.
- `fr_customer_create_service_request(...)`: customer-role check and input validation.
- `fr_driver_start_ride(uuid)` / `fr_driver_complete_ride(uuid)`: approved driver and ride ownership checks.
- `fr_laundry_provider_transition(uuid,text)`: requires assigned-provider ownership and valid state transition.
- `fr_tasko_provider_transition(uuid,text,numeric)`: requires assigned-provider ownership and state checks.
- `fr_service_provider_update_request(uuid,text)`: approved provider ownership and allowed transitions.
- Admin RPCs previously audited use `admin_users` membership checks.

## Role/privacy findings
### A. Ride contact-detail RPCs
- `get_ride_customer_details_v2(uuid)`: authenticated EXECUTE; source restricts to the assigned driver (`r.driver_id=auth.uid()`) and ride statuses accepted/confirmed/ongoing/in_progress/started/completed. It returns customer name, phone, photo path and avatar gender.
- `get_ride_driver_details(uuid)`: authenticated EXECUTE; source restricts to ride customer (`r.customer_id=auth.uid()`) and similar statuses. Returns driver name, phone, vehicle details, registration and photo path.
- **Review needed:** contact data appears available for completed rides as well as active rides. Confirm whether access should expire after completion or be retained for a defined dispute/safety window. Static source confirms ride-owner relationship, but not a time-limited privacy policy.

### B. Browse RPCs lacking visible role gate
- `fr_customer_list_approved_service_providers(text)`: authenticated EXECUTE, SECURITY DEFINER, source does not visibly check `auth.uid()` or customer role; returns provider phone and service area.
- `fr_customer_list_approved_stores_geo(text)`: authenticated EXECUTE, SECURITY DEFINER, source filters approved partners but does not visibly check `auth.uid()`/customer role; returns business address and precise coordinates.
- These appear accessible to any authenticated role at SQL/RPC level. Runtime role testing has not been performed. This is a role-boundary and data-minimization finding; determine intended visibility and enforce explicit role gating if customer-only.

### C. Feedback public endpoint
- `fr_public_homepage_feedback()`: anon EXECUTE is granted. Source returns published homepage feedback with display name/message; verify explicit consent and moderation.

### D. Privilege table
- Authenticated EXECUTE is broadly granted to many SECURITY DEFINER functions, but source guards are function-specific. This is not by itself proof of vulnerability.
- `fr_notification_claim_batch` remains service_role-only; anon/authenticated EXECUTE denied.
- Trigger function `fr_create_notification_preferences_for_new_user`: no anon/authenticated EXECUTE; service_role privilege shown. It uses `search_path=public`, unlike most functions with empty search_path; verify trigger context and hardening.

## Suggested priority
1. **High privacy review:** customer/provider browse RPC role gates and returned phone/address/precise location.
2. **High privacy review:** completed-ride contact details retention/expiry policy.
3. **Consent check:** public feedback names/messages.
4. **Runtime authorization tests:** approved/unapproved drivers, customer, partner, provider, non-admin, anon.
5. **ACL least privilege:** previous `admin_users` authenticated TRUNCATE privilege finding remains open.

## Status
Static review sweep documented. **No SQL, RPC, test-data, or production changes made.** Phase 11 closure is still pending approved remediation and runtime evidence.
