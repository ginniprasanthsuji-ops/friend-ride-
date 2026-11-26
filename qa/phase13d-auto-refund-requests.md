# Phase 13D — Auto refund request tracking

QA Supabase project only.

Cancellation of Road Ride or Shared Ride now automatically creates a refund-tracking record:
- Road: `payment_check_required` because current Road Ride booking schema has no linked payment record.
- Shared: `refund_pending` when a linked payment row has paid_at set; otherwise `payment_check_required`.
- Driver cancellation queues every cancelled booking.
- Duplicate requests prevented by unique ride-type/booking constraint.
- Refund queue table hidden from client roles; service_role access only.
- No bank/UPI transfer is initiated. Existing payment setup is QR/manual confirmation and has no refund gateway endpoint. This work automates refund request creation/status tracking, not money movement.

Static verification should confirm table and four cancellation RPCs are deployed with permissions. Runtime cancellation fixtures and admin refund processor remain pending.