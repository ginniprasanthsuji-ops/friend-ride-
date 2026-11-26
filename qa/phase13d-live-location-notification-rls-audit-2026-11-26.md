# Phase 13D QA — Live Location RLS and Notifications Policy Audit
Date: 2026-11-26
Project: QA Supabase pqsangtvietawkfgpgfu

## Scope
Read-only inspection of pg_policies for rides, ride_live_locations, driver_locations, fr_notification_tokens, fr_notification_events, and fr_notification_preferences.

## Findings

### Live location insert/read policies
- INSERT policy checks user_id = auth.uid() and existence of ride where caller is customer_id or driver_id.
- SELECT policy restricts rows to rides where caller is customer or assigned driver.
- UPDATE policy USING checks user_id = auth.uid() and participant existence for current row.
- UPDATE policy WITH CHECK currently checks only user_id = auth.uid(), and does not repeat ride-participant existence for the target row.

### Risk
A user who can update their own live-location row may attempt to change ride_id to a ride they are not a participant in, because the UPDATE WITH CHECK does not validate the target ride's participant relationship. This is a policy asymmetry and should be hardened in QA before runtime tests. Potential impact depends on table grants, composite PK behavior, and frontend writes; static policy evidence alone is not proof of exploit.

### Driver online-location policy
- ALL policy restricts driver_id to auth.uid().
- WITH CHECK allows is_online=true only if the profile is a driver with driver_approval_status='approved'; setting offline is permitted.
- Static review only.

### Notifications
- Notification tokens: ALL policy allows only owner user_id=auth.uid().
- Notification preferences: ALL policy allows only owner user_id=auth.uid().
- Notification events: authenticated SELECT policy restricts to user_id=auth.uid(); no other policies were returned for this table in the inspected policy list.
- Push dispatch is server-side/trusted service requirement; policy catalog does not prove dispatch is configured or functional.

## Status
Static catalog audit only. No mutations made. No runtime exploit testing performed. Main/Production untouched.

## Recommended QA hardening
Update live-location UPDATE WITH CHECK to require both user_id=auth.uid() and existence of the target ride where auth.uid() is customer_id or driver_id. Also verify explicit grants and test authorized/unauthorized ride_id reassignment using QA identities.
