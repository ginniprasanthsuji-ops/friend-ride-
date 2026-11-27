# X2 Food/Shop Order Idempotency Draft Review

Draft migration 012 adds a customer request UUID and unique index scoped by customer. It introduces a versioned RPC so existing UI calls remain unchanged until integration.

Purpose: retries (network reconnect, repeated tap) with the same request key return the existing order instead of creating duplicates.

Review caution: this draft uses an advisory transaction lock and calls the existing validated order RPC; runtime behavior, security-definer ownership, hash lock semantics and SQL compatibility must be tested in QA before application. The client must generate and retain one UUID per checkout attempt and call v2. Migration not applied; no runtime tests performed.