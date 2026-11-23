// Phase 8.14 — Error recovery & failure handling QA contract (non-production).
'use strict';
function validRetryPolicy(policy) {
  return !!policy && Number.isInteger(policy.maxAttempts) && policy.maxAttempts >= 1 && policy.maxAttempts <= 5 &&
    Number.isFinite(policy.baseDelayMs) && policy.baseDelayMs >= 0 &&
    Number.isFinite(policy.maxDelayMs) && policy.maxDelayMs >= policy.baseDelayMs;
}
function shouldRetry({attempt, maxAttempts, retryable}) {
  if (!Number.isInteger(attempt) || attempt < 1 || !Number.isInteger(maxAttempts) || maxAttempts < 1) return false;
  return retryable === true && attempt < maxAttempts;
}
function retryDelay({attempt, baseDelayMs, maxDelayMs}) {
  if (![attempt,baseDelayMs,maxDelayMs].every(Number.isFinite) || attempt < 1 || baseDelayMs < 0 || maxDelayMs < baseDelayMs) return null;
  return Math.min(maxDelayMs, baseDelayMs * (2 ** (attempt - 1)));
}
function classifyFailure(error) {
  const code = error && error.code;
  const status = error && error.status;
  if (code === 'TIMEOUT' || status === 408 || status === 504) return 'timeout';
  if (code === 'NETWORK' || status === 502 || status === 503) return 'transient_network';
  if (status === 401 || status === 403) return 'auth_or_permission';
  if (status === 409) return 'conflict';
  if (status >= 400 && status < 500) return 'client_error';
  if (status >= 500) return 'server_error';
  return 'unknown';
}
function recoveryAction(failureClass) {
  if (failureClass === 'timeout' || failureClass === 'transient_network' || failureClass === 'server_error') return 'retry_with_backoff';
  if (failureClass === 'conflict') return 'refresh_state_then_retry';
  if (failureClass === 'auth_or_permission') return 'reauthenticate_or_check_access';
  if (failureClass === 'client_error') return 'correct_request_no_retry';
  return 'manual_review';
}
function checkPartialState({steps, completedSteps, failedStep, compensatingAction}) {
  if (!Array.isArray(steps) || !Array.isArray(completedSteps) || !steps.length) return {safe:false,reason:'invalid_workflow'};
  const valid = completedSteps.every(s => steps.includes(s)) && (failedStep === null || steps.includes(failedStep));
  if (!valid) return {safe:false,reason:'unknown_step'};
  if (completedSteps.includes(failedStep)) return {safe:false,reason:'failed_step_already_marked_completed'};
  if (failedStep && steps.indexOf(failedStep) < Math.max(-1,...completedSteps.map(s=>steps.indexOf(s)))) return {safe:false,reason:'out_of_order_failure'};
  if (completedSteps.length && failedStep && !compensatingAction) return {safe:false,reason:'compensation_required'};
  return {safe:true,reason:null};
}
function checkResume({currentState,expectedState,workflowId}) {
  if (!workflowId || !currentState || !expectedState) return {allowed:false,reason:'missing_resume_context'};
  if (currentState !== expectedState) return {allowed:false,reason:'state_mismatch'};
  return {allowed:true,reason:null};
}
function checkRecoveryRecord(record) {
  if (!record || !record.workflow_id || !record.failure_class || !record.recovery_action) return {valid:false,reason:'missing_recovery_metadata'};
  if (!Number.isInteger(record.attempt) || record.attempt < 1) return {valid:false,reason:'invalid_attempt'};
  return {valid:true,reason:null};
}
module.exports={validRetryPolicy,shouldRetry,retryDelay,classifyFailure,recoveryAction,checkPartialState,checkResume,checkRecoveryRecord};
