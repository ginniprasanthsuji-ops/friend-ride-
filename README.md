
Replace repository root index.html, sw.js and add manifest.json, then commit.

Features in this frontend: SMS OTP login, profile save, customer booking, driver application/online/offline, admin driver approval, rides list, Google Maps point-to-point links, realtime ride updates while the app is open, customer/driver contact display when Supabase policies allow it, call/WhatsApp links, browser notification permission, service worker push-event handler.

IMPORTANT LIMITATION: Background push while app/browser is closed is not fully activated by these files alone. It needs a VAPID key pair, saving each user's PushSubscription in Supabase, and a trusted server/Edge Function that sends push messages when a ride is created/accepted. Never place VAPID private key or Supabase service-role key in index.html. The current Notifications ON button enables browser permission only. For secure access, if the other participant's profile details are hidden by RLS, use a SECURITY DEFINER RPC restricted to the ride's customer and assigned driver; do not make all profiles publicly readable.

Existing RPCs expected: is_friend_ride_admin, admin_list_driver_applications, admin_approve_driver, accept_ride. Rides table expected fields: customer_id, driver_id, vehicle_type, pickup, drop, fare_offer, agreed_fare, status, notes, created_at. Confirm your accept_ride RPC sets driver_id and status to accepted (or driver_accepted).
