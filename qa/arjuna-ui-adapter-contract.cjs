'use strict';

/**
 * QA-only adapter contract for the existing FRIEND RIDE UI.
 * Produces action descriptions only; it does not inspect DOM, click elements,
 * request permissions, or perform booking actions.
 */
const NAV_TARGETS = new Set(['home','ride','orders','services','profile','help']);
const RIDE_TYPES = new Set(['bike','auto','car']);

function mapIntentToUiAction(intent) {
 if (!intent || typeof intent !== 'object') return {type:'noop',reason:'invalid_intent'};
 if (intent.type==='navigate') {
   if (!NAV_TARGETS.has(intent.target)) return {type:'noop',reason:'target_not_allowlisted'};
   return {type:'navigation_request',target:intent.target,requiresUiIntegration:true};
 }
 if (intent.type==='select_ride_type') {
   if (!RIDE_TYPES.has(intent.rideType)) return {type:'noop',reason:'ride_type_not_allowlisted'};
   return {type:'ride_type_selection_request',rideType:intent.rideType,requiresUserReview:true};
 }
 if (intent.type==='review_booking') return {type:'booking_review_request',requiresExplicitUiConfirmation:true,execution:'none'};
 if (intent.type==='blocked') return {type:'blocked_notice',reason:intent.reason||'high_impact_voice_action_blocked'};
 return {type:'noop',reason:'intent_not_supported'};
}

function applyUiActionGate(action, context={}) {
 if (!action || typeof action !== 'object') return {allowed:false,reason:'invalid_action'};
 if (action.type==='navigation_request') {
   if (context.uiAvailable!==true) return {allowed:false,reason:'ui_not_available'};
   return {allowed:true,action:{type:'navigate',target:action.target},execution:'not_performed'};
 }
 if (action.type==='ride_type_selection_request') {
   if (context.uiAvailable!==true) return {allowed:false,reason:'ui_not_available'};
   if (context.userConfirmed!==true) return {allowed:false,reason:'selection_confirmation_required'};
   return {allowed:true,action:{type:'select_ride_type',rideType:action.rideType},execution:'not_performed'};
 }
 if (action.type==='booking_review_request') {
   if (context.uiAvailable!==true) return {allowed:false,reason:'ui_not_available'};
   return {allowed:true,action:{type:'open_booking_review'},execution:'not_performed',requiresExplicitUiConfirmation:true};
 }
 if (action.type==='blocked_notice') return {allowed:true,action:{type:'show_blocked_notice',reason:action.reason},execution:'not_performed'};
 return {allowed:false,reason:'action_not_allowlisted'};
}

module.exports={mapIntentToUiAction,applyUiActionGate,NAV_TARGETS,RIDE_TYPES};
