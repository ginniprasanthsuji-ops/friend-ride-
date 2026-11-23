# DigiLocker information in FRIEND RIDE

A customer-facing information panel should explain:
- DigiLocker is a Government of India / MeitY Digital India digital document wallet.
- Issued document availability depends on participating issuers; examples include identity, driving, education and other certificates.
- Steps: register/sign in, verify, fetch issued documents, review the requesting organization/purpose and consent before sharing.
- Smart Grocery EMI can use this as an identity-verification explanation, but automatic fetch/verification is not implemented yet.

Official links:
- https://www.digilocker.gov.in/
- https://api.digitallocker.gov.in/

Security: never ask users to enter DigiLocker password/OTP in FRIEND RIDE. Actual document retrieval requires authorized requester integration and explicit user consent. Do not scrape, store excess documents, or claim integration is live until partner/API approval and server implementation are completed.

Core content scaffold: `digilocker-information.ts`. UI wiring, official requester/API integration, server consent, document validation, and persistence are pending.
