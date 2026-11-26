# Phase 13D QA Test Accounts — QA project only

**Never use these instructions on production.** Target project ref: `pqsangtvietawkfgpgfu`.

## Safe setup
1. Use Supabase Auth UI (QA project only) to create three dedicated email/password accounts. Use disposable email aliases that you control. Complete email confirmation if enabled.
2. Copy each account UUID from Auth > Users.
3. Set customer and driver roles in `public.profiles` only in the QA project. Do not insert into `auth.users` directly.
4. Grant the admin account using the single QA-only statement below after confirming the UUID belongs to the disposable QA admin.
5. Driver approval and KYC verification are simulated test fixtures only. Do not use real Aadhaar, DL, RC, personal phone numbers, or fake documents for production. For the QA driver, use an explicitly test-marked fixture record, then remove it after tests.

## Admin grant (QA project only)
```sql
-- Replace UUID with the disposable QA Admin Auth user ID.
insert into public.admin_users (user_id)
values ('<QA_ADMIN_UUID>'::uuid)
on conflict (user_id) do nothing;
```

## QA profile role assignments (QA only)
```sql
-- Customer
update public.profiles
set role='customer'
where id='<QA_CUSTOMER_UUID>'::uuid;

-- Driver test identity (synthetic profile only)
update public.profiles
set role='driver',
    driver_approval_status='approved',
    vehicle_type='Bike',
    vehicle_company='QA Fixture',
    vehicle_model='Test Bike',
    vehicle_registration='QA-TEST-0001',
    driving_experience_years=1,
    driving_license_number='QA-TEST-DL-0001'
where id='<QA_DRIVER_UUID>'::uuid;
```

Driver assignment RPC also requires three verified KYC document rows. Only add these if the QA fixture is clearly marked as simulated and the code path accepts test rows. **Do not create fake verified documents for a real user.** Prefer test-only staging fixtures and clean them up immediately.

## Lifecycle test
- Customer: create ERS booking, verify `payment_method=cash` and `payment_status=cash_pending`.
- Admin: assign booking to QA Driver UUID; assignment must reject unapproved driver / missing KYC.
- Driver: complete ride as assigned driver.
- Driver: confirm cash receipt after completed ride.
- Verify customer/admin lists and final status: `completed`, `cash_received`, non-null `cash_received_at`.
- Negative tests: anon RPC denied; non-admin assignment denied; other driver cannot complete or confirm cash; other customer cannot read booking.

## Cleanup
Delete the QA bookings, revoke the QA admin grant, remove QA-only KYC fixture rows, and delete disposable Auth users using Supabase Auth UI. Do not run cleanup against production.
