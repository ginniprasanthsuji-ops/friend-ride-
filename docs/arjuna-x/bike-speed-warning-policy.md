# ARJUNA X QA — Bike Speed Warning Policy

**Status:** Deterministic mocked policy only; not wired to live GPS or push notifications.
**Rule:** Bike rides only; speed limit is 50 km/h. Over-limit samples propose a warning for both driver and customer.
**Spam control:** 60-second cooldown between warning proposals.
**GPS safeguards:** Samples with accuracy worse than 20 metres or age above 10 seconds are rejected. Invalid readings fail closed.
**Scope exclusions:** Auto, car, and delivery are ignored by this policy.
**Safety:** Policy decisions are side-effect-free. Actual GPS acquisition, ride state integration, notification delivery, and Supabase persistence require a separate implementation/approval and device testing.
