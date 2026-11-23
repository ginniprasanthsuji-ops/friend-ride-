# CIBIL score display in FRIEND RIDE

The external free-report link does not automatically return a score to FRIEND RIDE. The customer may optionally enter the score and report date they see on their report; this is displayed as customer-entered and unverified. It must not be represented as verified or used as an authoritative eligibility/credit decision.

For a verified score in-app, FRIEND RIDE needs a compliant, authorized CIBIL/bureau or lender-partner integration, appropriate consent, server-side credential handling, security review, retention limits, and audit controls. Never scrape the CIBIL site, ask customers for CIBIL login credentials or OTPs, or upload/store a full credit report unless a lawful, approved flow specifically requires it.

Core helper added: `cibil-score-display.ts`; manual scores are labeled unverified. Partner-verified status requires a partner verification reference in the helper, but this reference check alone is not proof—server integration must validate the reference with the authorized partner.
