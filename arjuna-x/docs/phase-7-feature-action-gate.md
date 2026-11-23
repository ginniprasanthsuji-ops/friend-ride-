# Phase 7 feature + action gate checkpoint

The feature-access evaluator is now combined with the existing permission-tier policy:
- Disabled or unknown features are denied before action permissions are considered.
- Allowed manual workflows continue to use tier-based action permissions.
- Tier 3 actions require explicit user confirmation.
- Tier 4 actions require special approval.
- No role/session identity binding has been implemented here; this remains an isolated core policy helper and must be wired into app routes/runtime after audit.
- No production SQL, merge, or deployment.
