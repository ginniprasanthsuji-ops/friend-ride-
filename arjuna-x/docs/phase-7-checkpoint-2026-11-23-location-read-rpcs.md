# Phase 7 Checkpoint — Location/Public Read RPCs

## This checkpoint
- Static review of approved service provider list, approved store geo list, nearby-driver lookup, and homepage feedback public RPC.
- Verified function execute grants in QA catalog: anon false/authenticated true for provider/store/nearby; anon true/authenticated true for homepage feedback.
- Findings: exact nearby-driver coordinates can be queried by authenticated customer against arbitrary validated coordinates (potential repeated-query enumeration); approved providers listing returns phone; store listing returns exact coordinates/address; homepage feedback public content needs consent/moderation verification.
- Documented mitigation candidates for design review, not implemented.

## Progress estimate
86% Phase 7 (engineering estimate only).

## Remaining
- Review notification functions and remaining RPCs/ACL.
- Finalize least-privilege permission proposal and safe test plan.
- Controlled runtime test accounts; RLS/API/storage regression; release gate.

## Safety status
Read-only QA catalog/source inspection. No SQL or data mutation, no production changes, no merge/deploy.