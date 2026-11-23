# Phase 7 Checkpoint — Remaining RPC Inventory

- Read-only full public function ACL inventory: 30 public SECURITY DEFINER functions in current catalog result.
- anon EXECUTE denied for all except homepage feedback.
- service-only functions: notification claim batch, new-user preference trigger, profile guard trigger.
- Reviewed driver request list and customer/driver ride detail RPC bodies.
- Findings: driver request list returns full ride row (pickup/drop coordinates/text, notes, fare, customer UUID) before acceptance; evaluate data minimization/pre-accept drop disclosure. Ride detail functions restrict to ride owner/assigned driver and lifecycle statuses; completed ride access retained by current status allowlist.

Estimated Phase 7 progress: 90% (engineering estimate, not runtime test completion).

Remaining: final ACL/column grant proposal, all permission review consolidation, controlled runtime test matrix, RLS/API/storage/edge tests, regression, release gate. No SQL mutations, no production changes, no merge/deploy.