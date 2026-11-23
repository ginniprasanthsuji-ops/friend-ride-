'use strict';

/** Permission and high-impact-action policy. Pure checks; no OS prompts or provider calls. */
const PERMISSIONS = new Set(['microphone','location']);
const HIGH_IMPACT = new Set(['payment','cancel_ride','submit_booking','share_location']);

function permissionRequest(permission, context={}) {
  if (!PERMISSIONS.has(permission)) return {allowed:false,reason:'permission_not_allowlisted'};
  if (context.foreground !== true) return {allowed:false,reason:'foreground_required'};
  if (context.userGesture !== true) return {allowed:false,reason:'user_gesture_required'};
  if (permission === 'microphone' && context.purpose !== 'voice_command') return {allowed:false,reason:'purpose_not_allowed'};
  if (permission === 'location' && context.purpose !== 'pickup_drop_selection') return {allowed:false,reason:'purpose_not_allowed'};
  return {allowed:true,permission,purpose:context.purpose,scope:'single_foreground_session'};
}

function authorizeHighImpact(action, context={}) {
  if (!HIGH_IMPACT.has(action)) return {allowed:false,reason:'action_not_allowlisted'};
  if (context.source === 'voice') return {allowed:false,reason:'voice_high_impact_blocked'};
  if (context.source !== 'in_app_ui') return {allowed:false,reason:'ui_source_required'};
  if (context.userGesture !== true) return {allowed:false,reason:'user_gesture_required'};
  if (context.explicitConfirmation !== true) return {allowed:false,reason:'explicit_confirmation_required'};
  if (action === 'share_location' && context.destinationApproved !== true) return {allowed:false,reason:'destination_approval_required'};
  return {allowed:true,action,source:'in_app_ui',requiresBackendAuthorization:true,execution:'not_performed'};
}

function backgroundPermissionUse(permission) {
  return {allowed:false,reason:'background_permission_use_disabled',permission};
}

module.exports = {permissionRequest, authorizeHighImpact, backgroundPermissionUse, PERMISSIONS, HIGH_IMPACT};
