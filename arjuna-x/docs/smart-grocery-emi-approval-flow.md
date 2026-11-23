# Smart Grocery EMI: CIBIL + DigiLocker + lender OR admin approval

## Proposed user flow
1. User opens Smart Grocery EMI and sees lender/credit-check disclosure, privacy notice, and eligibility terms.
2. User explicitly consents to DigiLocker identity verification and authenticates through the authorized integration. Store verification result/reference and minimal metadata—not credentials or raw documents.
3. User separately consents to credit-bureau (e.g. CIBIL) enquiry and its purpose; record timestamp and consent handling.
4. Authorized bureau/partner performs the check. The app must not calculate or fabricate a CIBIL score.
5. Application enters review. A credit limit may be approved through either:
   - **Lender/NBFC approval:** lender decision, positive limit and decision reference; or
   - **Authorized Admin approval:** privileged admin explicitly approves a positive limit, with approver ID and audit reference.
6. Show approved limit only after DigiLocker identity verification, both consents, completed credit check, and one complete approval path. Admin approval does not bypass identity or credit-check gates.
7. After approval, customer sees a congratulations message and the approved limit (example: ₹5,000) in the app.
8. Customer submits a grocery quotation through the app. The quotation is sent to Admin for procurement; requests exceeding the approved limit are blocked.
9. Admin accepts the quotation and confirms the order. Customer receives an in-app message that delivery is targeted within 2 days after order confirmation, with status updates. This is a delivery target, not a guaranteed SLA; actual delivery dates depend on stock, location, and logistics.
10. Pending/rejected cases show status, not a guessed limit. Admin actions must be auditable, server-authorized, and protected from customer/partner role access.

## Integration/security requirements
- Official, authorized DigiLocker and credit-bureau/lending partner integrations only; no password collection, scraping, or unofficial score access.
- Separate identity and bureau consent records; audit timestamps, purpose, partner request IDs and withdrawal handling.
- Admin approval must be enforced server-side through privileged role/RLS, recorded with admin ID, decision reference, amount, timestamp and reason; consider dual control for high limits.
- Encrypt sensitive records, minimize retention, restrict role access, and verify backend authorization/RLS.
- Credit decisions/limits are server-authoritative; UI and AI cannot override them. Admin authority must be formally configured by the business/lending compliance process.
- Avoid retaining raw Aadhaar, credentials, or documents unless a lawful approved requirement exists.
- Customer message and quotation/order helpers are scaffolding only; customer UI, admin procurement dashboard, notifications, inventory/order service, delivery tracking, persistence and RLS remain to be integrated.\n- This scaffold does not connect external partners or make decisions; lender partnership and regulatory/compliance review are required before launch.
