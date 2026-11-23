// Phase 8.16 — Notification & event consistency QA contract (test-only).
'use strict';
const EVENT_STATE = {
  ride_created:'requested', ride_accepted:'accepted', ride_started:'in_progress', ride_completed:'completed', ride_cancelled:'cancelled',
  order_created:'placed', order_accepted:'accepted', order_preparing:'preparing', order_ready:'ready', order_completed:'completed', order_cancelled:'cancelled',
  payment_pending:'pending', payment_success:'paid', payment_failed:'failed', kyc_submitted:'submitted', kyc_approved:'approved', kyc_rejected:'rejected'
};
const RECIPIENT_ROLE = {
  ride_created:['customer'], ride_accepted:['customer'], ride_started:['customer'], ride_completed:['customer'], ride_cancelled:['customer','driver'],
  order_created:['customer','partner'], order_accepted:['customer'], order_preparing:['customer'], order_ready:['customer'], order_completed:['customer'], order_cancelled:['customer','partner'],
  payment_pending:['customer'], payment_success:['customer'], payment_failed:['customer'], kyc_submitted:['admin'], kyc_approved:['applicant'], kyc_rejected:['applicant']
};
function knownEvent(eventType){return Object.prototype.hasOwnProperty.call(EVENT_STATE,eventType);}
function expectedState(eventType){return knownEvent(eventType)?EVENT_STATE[eventType]:null;}
function expectedRecipients(eventType){return knownEvent(eventType)?RECIPIENT_ROLE[eventType]:null;}
function validateEvent(event){if(!event||typeof event!=='object')return {valid:false,reason:'invalid_event'}; if(!event.eventId||!event.eventType||!event.entityId)return {valid:false,reason:'missing_required_fields'}; if(!knownEvent(event.eventType))return {valid:false,reason:'unknown_event_type'}; if(!Number.isFinite(Date.parse(event.createdAt)))return {valid:false,reason:'invalid_timestamp'}; return {valid:true,reason:null};}
function isDuplicateEvent(eventId,seen){return Boolean(eventId)&&Array.isArray(seen)&&seen.includes(eventId);}
function checkNotification(notification,event){if(!notification||!event)return {consistent:false,reason:'missing_notification_or_event'}; const valid=validateEvent(event); if(!valid.valid)return {consistent:false,reason:valid.reason}; if(notification.eventId!==event.eventId)return {consistent:false,reason:'event_id_mismatch'}; if(notification.entityId!==event.entityId)return {consistent:false,reason:'entity_id_mismatch'}; if(notification.eventType!==event.eventType)return {consistent:false,reason:'event_type_mismatch'}; if(notification.state!==expectedState(event.eventType))return {consistent:false,reason:'state_mismatch'}; if(!expectedRecipients(event.eventType).includes(notification.recipientRole))return {consistent:false,reason:'recipient_role_mismatch'}; if(notification.recipientId==null||notification.recipientId==='')return {consistent:false,reason:'missing_recipient'}; return {consistent:true,reason:null};}
function checkDashboardState(dashboard,event){if(!dashboard||!event)return {consistent:false,reason:'missing_dashboard_or_event'}; if(dashboard.entityId!==event.entityId)return {consistent:false,reason:'entity_id_mismatch'}; const expected=expectedState(event.eventType); if(expected==null)return {consistent:false,reason:'unknown_event_type'}; if(dashboard.state!==expected)return {consistent:false,reason:'dashboard_state_mismatch'}; if(Date.parse(dashboard.updatedAt)<Date.parse(event.createdAt))return {consistent:false,reason:'dashboard_stale'}; return {consistent:true,reason:null};}
function checkOrdering(previous,next){if(!previous||!next)return {ordered:false,reason:'missing_events'}; if(previous.entityId!==next.entityId)return {ordered:false,reason:'entity_mismatch'}; if(Date.parse(next.createdAt)<Date.parse(previous.createdAt))return {ordered:false,reason:'timestamp_regression'}; return {ordered:true,reason:null};}
function retryIsIdempotent({eventId,deliveryAttempts,deliveredEventIds}){if(!eventId||!Number.isInteger(deliveryAttempts)||deliveryAttempts<1)return {safe:false,reason:'invalid_retry_metadata'}; if(isDuplicateEvent(eventId,deliveredEventIds))return {safe:false,reason:'already_delivered'}; return {safe:true,reason:null};}
module.exports={EVENT_STATE,RECIPIENT_ROLE,knownEvent,expectedState,expectedRecipients,validateEvent,isDuplicateEvent,checkNotification,checkDashboardState,checkOrdering,retryIsIdempotent};
