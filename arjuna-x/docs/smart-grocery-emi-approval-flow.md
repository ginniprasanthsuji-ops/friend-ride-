# Smart Grocery EMI: CIBIL + DigiLocker identity + lender approval

## Proposed user flow
1. User opens Smart Grocery EMI and sees lender/credit-check disclosure, privacy notice, and eligibility terms.
2. User explicitly consents to DigiLocker identity verification and authenticates through the authorized DigiLocker integration. The app stores verification result/reference and minimum required metadata only—not Aadhaar/DigiLocker credentials or raw document contents.
3. User separately consents to credit-bureau (e.g. CIBIL) enquiry and its stated purpose. Consent is timestamped and revocable as permitted by the partner flow.
4. Authorized lending partner/bureau performs the credit check. The app must not calculate or fabricate a CIBIL score.
5. Application enters review/decision pending. The lending partner evaluates eligibility and issues approved/rejected decision.
6. Approved limit is shown only after verified identity, recorded consents, completed credit check, and explicit lender approval with a valid positive limit and reference.
7. On rejection/pending, show a clear status and next steps; never display a guessed or AI-estimated credit limit.

## Integration/security requirements
- Use official, authorized DigiLocker and credit-bureau/lending partner integrations; no password collection, scraping, or unofficial score access.
- Separate consent records for identity verification and bureau enquiry; audit timestamps, purpose, partner request IDs and withdrawal handling.
- Encrypt sensitive records, minimize retention, restrict access by role, and verify backend authorization/RLS.
- Credit limit and decision are server-authoritative partner outputs; UI and AI cannot override them.
- Do not store raw Aadhaar numbers, credentials, or document images unless an approved legal/partner requirement and retention policy explicitly requires it.
- This flow scaffold does not connect external partners or make credit decisions; regulatory/compliance review and lender partnership are required before launch.
