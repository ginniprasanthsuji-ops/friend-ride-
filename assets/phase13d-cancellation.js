/* FRIEND RIDE Phase 13D — cancellation RPC client helpers (QA). UI cards/buttons pending. */
(function(){
 'use strict';
 const rpc={roadPassenger:'fr_road_ride_cancel_booking',roadDriver:'fr_road_ride_driver_cancel',sharedPassenger:'fr_shared_ride_cancel_booking',sharedDriver:'fr_shared_ride_driver_cancel'};
 async function run(name,args,msg){
  if(!window.sb||!window.currentUser)throw new Error('Login required');
  if(!confirm(msg+'\n\nRefund is not automatic; manual review may be required.'))return null;
  const {data,error}=await window.sb.rpc(name,args);if(error)throw error;
  if(data?.refund_request_created||data?.refund_review_required)alert('Cancellation completed. Refund review pending; no automatic refund was processed.');
  return data;
 }
 window.FRPhase13DCancel={
  roadPassenger:id=>run(rpc.roadPassenger,{p_booking_id:id},'Cancel Road Ride booking?'),
  roadDriver:id=>run(rpc.roadDriver,{p_ride_id:id},'Cancel Road Ride and eligible bookings?'),
  sharedPassenger:id=>run(rpc.sharedPassenger,{p_booking_id:id},'Cancel Shared Ride seats?'),
  sharedDriver:id=>run(rpc.sharedDriver,{p_ride_id:id},'Cancel Shared Ride and eligible bookings?')
 };
})();