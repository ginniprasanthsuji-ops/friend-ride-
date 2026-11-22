# FRIEND RIDE — COMPLETE MASTER APP WORKFLOW & SYSTEM BLUEPRINT

**Source of Truth:** User-provided master blueprint in ChatGPT conversation, 22 Nov 2026.  
**Repository:** `ginniprasanthsuji-ops/friend-ride-`  
**Domain:** `friendride.in`  
**Languages:** Telugu + English  
**Purpose:** Build and maintain FRIEND RIDE as a unified local super app. This blueprint is the authoritative product/workflow specification for future audits and implementation. Do not invent feature activation or backend support.

## 1. App Identity & Unified Architecture
FRIEND RIDE is one unified application with role selection: Customer, Driver/Rider, Partner/Merchant/Shop Owner, Service Provider/Gigger, and Admin. Each role must have its own dashboard, navigation, permissions, and workflows, while sharing the same app and design system. Preserve existing backend, integrations, features, routes, and data unless a change is explicitly approved and planned.

## 2. Customer Workflow
Customer journey: Registration/OTP → profile → location → home → choose service → booking/order → provider/driver assignment → tracking/status → completion → payment/receipt → rating/review → history/support.

Customer modules:
- Rides: Bike, Auto, Car
- Cycle delivery
- Parcel delivery and goods transport
- Food delivery
- Grocery and local stores/marketplace
- Medical/pharmacy marketplace (subject to applicable partner/legal controls)
- Shopping and catalogues
- Home services
- Laundry
- TASKO/GIGGER assistance
- Education/Vidya Setu
- Recharge & Bill Pay, only where authorized provider integration is active
- Train booking/travel, only where integration is active
- Orders, rides, bookings and history
- Wallet, offers, referral, notifications, profile
- Help/support, complaints/feedback and ratings

## 3. Ride Lifecycle
Statuses and workflow: Requested → Searching Driver → Driver Assigned → Accepted → Arriving → Arrived → Started → In Progress → Completed → Payment Pending/Completed, or Cancelled. Enforce valid state transitions and role authorization. Avoid duplicate completion, payment or rewards.

## 4. Driver/Rider Workflow
Driver registration: OTP → profile/passport-size photo → vehicle/details and documents → KYC → admin review/approval. Only verified and approved drivers can receive/accept eligible rides.
Driver dashboard/modules: online/offline; request accept/reject; pickup navigation; arrival; start ride; live location/tracking; completion; payment status; earnings; ride history; wallet/settlement; SOS; ratings/feedback; complaints; notifications; profile/documents/status. Keep all transitions and actions permission-checked and auditable.

## 5. Partner/Merchant/Shop Owner
Partner onboarding: OTP → profile/photo → shop/business details/address/categories → KYC → admin approval → subscription if applicable. Partner dashboard: catalogue, product images/categories, price/offer, stock, incoming orders, accept/reject, preparation, ready/pickup, delivery/completion, earnings, wallet/settlement.
Partner features: persistent partner-specific catalogue mapping; QR; products/categories; pricing; stock/availability; orders; delivery/pickup; earnings; settlement; subscriptions; offers; ratings/reviews; notifications; complaints. Catalogue entries and prices must belong to the correct partner and persist.

## 6. Food Delivery
Customer browse/menu → cart → checkout → shop acceptance → preparation → ready → delivery assignment/pickup → delivery tracking → completion → payment/receipt → rating. Maintain food marketplace compliance and show only genuinely available integrations/features.

## 7. Local Stores & Grocery Marketplace
Support multiple shops and categories including grocery, medical, chicken/meat, electrical, hardware, home appliances and general stores. Multi-shop cart should permit unified checkout while backend creates and links shop-wise orders correctly to customer, shop and delivery provider. Display item availability, partner-confirmed prices, charges, taxes and delivery details.
Example configurable delivery bands (admin-adjustable): 2–3 km ₹50; 3–8 km ₹80; >8 km ₹120. Do not treat examples as fixed hard-coded policy unless the system configuration says so.

## 8. Home Services
Categories include Electrician, Plumber, AC repair, appliance repair, Carpenter, Cleaning, Painting and other configured services. Booking workflow: select service → describe issue → quote/pricing disclosure → date/time → provider matching/assignment → visit/work status → payment → rating/review. Provider onboarding includes profile, skills, documents/KYC, admin approval, availability and earnings.

## 9. TASKO / GIGGER
Service categories: Office Work, Government Office Work Assistance, Personal Assistance, Errands, Document Work, Field Work, Daily Assistance and Other. Pricing configuration examples: minimum ₹150/day; up to 6 hours; base maximum ₹400; after 4 hours provide water-bottle assistance; extra hour ₹50. These are configurable rules and must be clearly disclosed before booking. Flow: customer request → provider registration/approval as needed → assignment/acceptance → work start → completion → payment → rating.

## 10. Laundry
Services: washing, ironing, steam ironing, dry cleaning, per-kg/per-piece pricing, pickup and delivery. Workflow: booking/pickup → partner processing → ready → delivery → payment → rating. Laundry partners manage service pricing, orders and earnings.

## 11. Education / Vidya Setu
Student registration/profile, learning resources, homework/assignments, learning tasks, notifications, progress and submissions. Teacher/instructor workflows and admin content/management. This is a separate learning workflow within the unified app, with its own role-aware navigation and data permissions.

## 12. Smart Grocery Payment Plan / EMI
Only show or enable where the feature is actually configured and supported. Workflow: KYC (PAN where required) → eligibility/limit → admin approval → order → payment-plan/mandate setup → installment schedule/reminders → payment/history. Example limit ₹5,000 and CIBIL eligibility are configurable examples, not automatic guarantees. Cashfree Autopay/mandates only if integration is operational, legal and supported. Disclose all fees, dates and terms; never show fake eligibility or approvals.

## 13. Recharge & Bill Pay / Travel
Recharge and bill payments only through authorized, operational APIs: provider/number validation → amount/details → customer confirmation → payment/provider transaction → success/failure and receipt/history. Train booking/travel modules only when an operational integration exists. Do not represent unavailable APIs as active.

## 14. Admin Dashboard & Operations
Admin modules: dashboard; user/customer management; drivers/riders; partners/shops; service providers/giggers; KYC and approvals; rides; orders; food/grocery/shops/catalogue/delivery; home services; laundry; TASKO; education; complaints/feedback/ratings; offers/referrals/subscriptions; payments/refunds; wallet/settlements; notifications; reports/analytics; pricing/configuration/availability; banners/content; roles/permissions; audit logs; settings. Admin actions must be protected, logged and permission-gated.

## 15. Payments
Payment flow must use operational gateway integration, server-side verification and verified webhooks. Show only supported payment methods. Frontend must never mark a payment successful on its own. Prevent duplicate charges/orders; support clear pending, success, failure, refund and receipt states.

## 16. QR Payment / Completion
QR should contain/resolve a transaction or order reference, be verified securely by backend, have configurable expiry (example 5 minutes), prevent replay/duplicate payment, and regenerate only where policy permits. QR/payment success must be based on backend verification.

## 17. Offers & Referral
Offers/rewards must be configurable with terms, eligibility and fraud controls. Examples from blueprint: customer ₹50 offer; Driver/Partner one-month subscription free; qualifying condition of 2 completed rides/orders. Reward only after genuine qualifying completion and backend validation. Examples are not automatic promises.

## 18. Notifications
Telugu-first notifications with Telugu/English support; in-app and push/background delivery where configured; notification bell; history; read/unread; role-based targeting/preferences; sound/vibration only where supported and allowed. Trigger from real backend events, avoid fake or duplicate notifications, and preserve delivery/error state where available.

## 19. Location & Tracking
Request permission appropriately; current GPS; pickup/destination/address search/map; accuracy display; manual location fallback; tracking; distance and ETA. If GPS unavailable or denied, allow manual selection where workflow supports it. Do not fabricate current location, driver position, distance or ETA.

## 20. Profile & Security
Profile photo or default avatar; name/mobile/address/role; documents and status; profile editing; logout. Security: OTP/authentication, RBAC, server/backend validation, RLS, protected documents, privacy and secure session handling. Avoid exposing sensitive data.

## 21. UI/UX Design System
Unified premium UI across all roles/modules. Use approved FRIEND RIDE brand palette (current direction Dark + Gold unless later approved); consistent contrast, typography, spacing, cards, icons and navigation. Mobile-first, responsive, accessible and Telugu/English friendly. Remove developer/debug/backend implementation text from user screens. No old UI beside new UI, duplicate dashboards, or parallel themes. Provide loading, empty, error, disabled, success and pending states. All visible shortcuts/buttons must lead to working actions or clearly indicate unavailable status.

## 22. Customer Home
Greeting; profile/avatar; notification bell; current location; search; service categories; ride/cycle/parcel/goods/food/grocery/stores/home services/laundry/TASKO/education/recharge only if active; offers/popular/recent; support and rating. Every visible shortcut must work and route correctly.

## 23. Cart & Order Management
Multi-shop cart and unified checkout; shop-wise order creation; clear item prices, delivery charges, platform fee/taxes and total; payment; tracking; order history; cancel/refund according to policy. Example platform fee ₹2 per ₹100 is configurable and must not be hard-coded as a promise. Show all fees before confirmation.

## 24. Support & Complaints
Ticket creation, category/details, status, admin handling/resolution and customer notifications. Feedback/complaints must map correctly to support/admin and be visible to authorized roles.

## 25. Ratings & Reviews
Allow ratings/reviews only after eligible completed ride/order/service. Correctly map customer/provider/partner and transaction. Prevent duplicates/abuse according to policy.

## 26. Backend & Data Architecture
Preserve existing Supabase architecture, schema, authentication, integrations and RLS by default. Entities/workflows should have secure relationships and role access. Any backend/schema/auth/payment architecture change requires a migration and review plan; do not casually modify backend logic during UI-only work.

## 27. Workflow Validation
Validate role permissions, allowed state transitions, backend checks, history/audit, error and retry behavior. Prevent duplicate orders, payments, completion, rewards and unauthorized actions. UI states must reflect verified backend state.

## 28. Complete QA / Regression Checklist
Test:
- Login/OTP, roles, profile/photo/default avatar, logout, navigation, cards, routes, buttons
- Ride request/search/assignment/accept/arrival/start/live tracking/completion/cancel/payment/QR
- Driver KYC/approval, online/offline, earnings/history/wallet/settlement/SOS
- Partner KYC/approval/subscription/catalogue persistence/price/stock/orders
- Multi-shop cart/checkout/shop-wise orders, food/grocery/store categories, delivery, cycle delivery, parcel/goods
- Home services provider/booking/work/payment/rating
- Laundry pickup/processing/ready/delivery/payment
- TASKO/GIGGER categories, pricing/terms, provider workflow
- Education/Vidya Setu student/teacher/content/homework/submission/progress
- Smart grocery plan eligibility/approval/mandate/installments only if enabled
- Recharge/bill pay/travel integrations only if operational
- Notification bell/history/read-unread/in-app/push/background
- GPS permissions/current/manual location/map/live tracking
- Admin dashboard, approvals, users, operations, reports, complaints/feedback/ratings
- Wallet, offers/referrals, payments, refunds, receipts, settlement
- Responsive/mobile UI, Telugu/English, accessibility, loading/empty/error states
- Syntax errors, duplicate IDs, console/runtime errors, broken routes, inert buttons and regression

## 29. Staged Implementation & Release
1. Inspect current architecture/source, map roles/modules/routes/integrations to blueprint; inventory working and unavailable features.
2. Write short implementation plan and risk list.
3. Backup before destructive work; follow agreed Git workflow. Use QA/testing isolation where practical; never deploy failing or unverified changes.
4. Implement in small, focused commits. Preserve existing features, logic, schema, auth, payments and integrations unless approved changes have a migration plan.
5. Run targeted tests then complete regression; fix failures and repeat.
6. Verify commit/push and deployment status; inspect live app and report evidence.
7. Report what is completed, what passed/failed, remaining blockers, and any feature that is unavailable—do not claim completion without verification.

## 30. Definition of Done
FRIEND RIDE should be one unified, responsive, premium app with correct role-specific workflows, secure backend-connected actions, preserved existing functionality, all visible controls working, verified integrations, complete regression evidence, and a truthful release report. Blueprint compliance is the standard for future app audit, implementation and QA.
