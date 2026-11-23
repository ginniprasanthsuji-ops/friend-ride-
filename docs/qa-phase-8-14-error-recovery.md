# Phase 8.14 — Error Recovery & Failure Handling QA

**Branch:** `qa/phase8-14-error-recovery-2026-11-24`  
**Base:** Phase 8.13 QA branch  
**Scope:** Contract assertions only; no production code or Supabase schema changes.

## Coverage
- Retry policy bounds and exponential backoff cap
- Retry eligibility and attempt limits
- Timeout, transient network, permission, conflict, client/server error classification
- Recovery-action mapping
- Partial workflow state and compensation requirement
- Safe workflow resume only when expected state matches
- Recovery metadata validation

## Status
Files authored and committed to isolated QA branch. Runtime test execution is pending. Contract checks do not yet enforce behavior in live handlers.
