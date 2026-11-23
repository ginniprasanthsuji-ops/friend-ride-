# Smart Grocery EMI — Admin quotation review

## Review actions
- Only the admin-role path is accepted by this pure helper.
- Pending quotation status `submitted-to-admin` can transition to `admin-accepted` or `rejected`.
- Rejection requires a non-empty reason.
- The helper returns an audit-event payload with event ID, quotation/customer IDs, actor, action, old/new status, timestamp, and rejection reason when applicable.

## Security boundary
This helper is not an authorization boundary. The API/server must authenticate the actor, authorize admin role, validate quotation ownership and approved credit limit, prevent duplicate/replay actions, persist status and audit event atomically, and apply RLS/least privilege. Do not trust client-provided role, actor ID, timestamps, or event IDs.

## Remaining integration
Admin UI/dashboard, server-side action endpoint, durable audit log, transactional persistence, notification dispatch, inventory availability, supplier procurement, delivery tracking, and RLS remain unimplemented. Delivery timing remains a target message, not a guarantee.
