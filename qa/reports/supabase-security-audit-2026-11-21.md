# FRIEND RIDE — Supabase Security QA Audit (2026-11-21)

## Status
- Main browser regression workflow: **PASS** (5 GitHub checks completed successfully on QA commit `e27a69e675dfa463cf06415b2f8fadf9d9ce055c`).
- PR #21: **open, draft, mergeable**; no merge performed.
- OTP Edge Function live deployment: version 32; recent requests return HTTP 200, but OTP delivery/login success is **not confirmed by a user/device test**.
- Merge gate: **HOLD** pending live OTP test and security review.

## Supabase Security Advisor findings
- `rls_enabled_no_policy`: INFO, **23 tables**. RLS is enabled but there are no policies on these tables. This can be intentional for service-role-only access; confirm the app's data access design before adding policies.
- `anon_security_definer_function_executable`: WARN, **6 functions** callable by `anon` as SECURITY DEFINER. Confirm intended public access and add explicit auth/validation checks or revoke EXECUTE where public access is not required.
- `authenticated_security_definer_function_executable`: WARN, **88 functions** callable by `authenticated` as SECURITY DEFINER. Review each function body for authorization checks (especially admin RPCs) and restrict grants where not needed. Do not blanket-revoke; app workflows may depend on RPCs.
- `auth_leaked_password_protection`: WARN — enable compromised-password protection in Supabase Auth settings.

## RLS-enabled tables with no policies (23)
- fr_ai_usage_daily
- fr_market_order_items
- fr_market_orders
- fr_parcel_orders
- fr_partner_catalogue_items
- fr_partner_order_candidates
- fr_partner_order_routes
- fr_platform_business_settings
- fr_service_requests
- fr_v8_delivery_otps
- fr_v8_invoice_lines
- fr_v8_invoice_verification_logs
- fr_v8_invoices
- fr_v8_order_ledger
- fr_v8_platform_settings
- fr_v8_subscription_events
- friend_ride_receipt_email_logs
- phone_otps
- ride_offers
- shop_delivery_assignments
- shop_invoice_counters
- shop_order_items
- shop_payment_profiles

## Public SECURITY DEFINER RPCs flagged (6)
- fr_customer_list_approved_stores_geo(p_category text)
- fr_customer_list_partner_catalogue(p_store_id uuid)
- fr_get_platform_business_details()
- fr_learn_teach_is_admin()
- fr_list_approved_partner_stores()
- fr_public_homepage_feedback()

## Recommended safe next steps
1. Review function source and classify: public read, authenticated user RPC, admin-only, service-only.
2. Confirm authorization checks inside each SECURITY DEFINER function; prioritize `admin_*`, order/parcel/payment, KYC/document, and OTP-related RPCs.
3. Add targeted GRANT/REVOKE and function-body checks in a QA migration only after workflow dependencies are mapped.
4. For tables with no RLS policies, confirm service-role-only intent. Do not add broad policies.
5. Enable Supabase Auth compromised-password protection.
6. Re-run advisors, API permission checks, and full regression after security changes.
7. Final merge only after live Admin OTP verification and critical security review.

**No production schema, RLS, or function privileges were modified during this audit.**
