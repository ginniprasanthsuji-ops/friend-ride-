# Smart Grocery EMI onboarding screen model

New screen-model helper coordinates the customer-facing onboarding steps:
intro -> identity (DigiLocker information and official external link) -> credit consent -> CIBIL report (official external link; optional manual score return) -> application review -> approved -> quotation.

This is presentation/state mapping only. It is not a UI component and does not implement navigation, API calls, data persistence, bureau/lender APIs, DigiLocker authorization, credit consent storage, or notifications. Credit limit must only be sourced from the existing authoritative approval helper. Manual CIBIL score remains unverified.
