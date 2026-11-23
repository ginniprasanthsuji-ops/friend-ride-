// Phase 8.15 — Cross-role authorization and privilege escalation QA contract.
'use strict';
const ROLE_PERMISSIONS = {
  customer: ['ride.create','ride.read_own','order.create','order.read_own','profile.read_own','profile.update_own','complaint.create_own'],
  driver: ['ride.read_assigned','ride.update_assigned','profile.read_own','profile.update_own','driver.kyc.read_own','driver.kyc.submit_own'],
  partner: ['store.order.read_own','store.order.update_own','store.catalog.update_own','profile.read_own','profile.update_own','partner.kyc.read_own','partner.kyc.submit_own'],
  admin: ['admin.dashboard.read','admin.user.read','admin.user.update','admin.kyc.review','admin.workflow.manage','admin.audit.read']
};
const PRIVILEGED = new Set(['admin.dashboard.read','admin.user.read','admin.user.update','admin.kyc.review','admin.workflow.manage','admin.audit.read']);
function validRole(role){return Object.prototype.hasOwnProperty.call(ROLE_PERMISSIONS,role);}
function hasPermission(role,permission){return validRole(role)&&ROLE_PERMISSIONS[role].includes(permission);}
function isPrivilegedPermission(permission){return PRIVILEGED.has(permission);}
function authorize(role,permission){if(!validRole(role))return {allowed:false,reason:'invalid_role'}; if(!hasPermission(role,permission))return {allowed:false,reason:isPrivilegedPermission(permission)?'privilege_denied':'permission_denied'}; return {allowed:true,reason:null};}
function checkOwnerAccess({role,actorId,recordOwnerId,permission}){if(!actorId||!recordOwnerId)return {allowed:false,reason:'missing_identity'}; if(role==='admin')return authorize(role,permission); if(actorId!==recordOwnerId)return {allowed:false,reason:'not_owner'}; return authorize(role,permission);}
function checkAssignedDriver({role,actorId,assignedDriverId,permission}){if(role!=='driver')return {allowed:false,reason:'wrong_role'}; if(!actorId||!assignedDriverId)return {allowed:false,reason:'missing_identity'}; if(actorId!==assignedDriverId)return {allowed:false,reason:'not_assigned_driver'}; return authorize(role,permission);}
function checkPartnerStore({role,actorId,storeOwnerId,permission}){if(role!=='partner')return {allowed:false,reason:'wrong_role'}; if(!actorId||!storeOwnerId)return {allowed:false,reason:'missing_identity'}; if(actorId!==storeOwnerId)return {allowed:false,reason:'not_store_owner'}; return authorize(role,permission);}
function checkAdminGuard({role,sessionVerified,permission}){if(!sessionVerified)return {allowed:false,reason:'unverified_session'}; if(role!=='admin')return {allowed:false,reason:'admin_only'}; return authorize(role,permission);}
function checkRoleChange({actorRole,targetRole,approved}){if(!validRole(targetRole))return {allowed:false,reason:'invalid_target_role'}; if(actorRole!=='admin')return {allowed:false,reason:'admin_only'}; if(approved!==true)return {allowed:false,reason:'approval_required'}; return {allowed:true,reason:null};}
function checkSensitiveAction({role,sessionVerified,permission,stepUpVerified}){const auth=authorize(role,permission); if(!auth.allowed)return auth; if(!sessionVerified)return {allowed:false,reason:'unverified_session'}; if(isPrivilegedPermission(permission)&&!stepUpVerified)return {allowed:false,reason:'step_up_required'}; return {allowed:true,reason:null};}
module.exports={ROLE_PERMISSIONS,validRole,hasPermission,isPrivilegedPermission,authorize,checkOwnerAccess,checkAssignedDriver,checkPartnerStore,checkAdminGuard,checkRoleChange,checkSensitiveAction};
