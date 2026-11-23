// FRIEND RIDE QA Phase 8.16 — Observability, audit events & QA reporting
// Pure contract validation only. Does not log, send events, or touch live systems.
const ALLOWED_EVENTS = new Set(["qa.started","qa.completed","qa.failed","workflow.transition","permission.denied","external_action.blocked","support.escalated"]);
const SAFE_FIELDS = new Set(["event","module","status","error_code","timestamp","request_id","actor_role"]);
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SENSITIVE_KEYS = new Set(["password","otp","token","access_token","refresh_token","authorization","secret","api_key","card_number","cvv","pin","payload","message_body","email","phone"]);
function hasSensitiveKey(value) { if (!value || typeof value !== "object") return false; for (const [key,child] of Object.entries(value)) { if (SENSITIVE_KEYS.has(key.toLowerCase())) return true; if (child && typeof child === "object" && hasSensitiveKey(child)) return true; } return false; }
function validateAuditEvent(event) {
 const errors=[];
 if (!event || typeof event!=="object" || Array.isArray(event)) return {valid:false,errors:["event must be an object"]};
 if (!ALLOWED_EVENTS.has(event.event)) errors.push("event_not_allowlisted");
 for (const key of Object.keys(event)) if (!SAFE_FIELDS.has(key)) errors.push("field_not_allowlisted:"+key);
 if (hasSensitiveKey(event)) errors.push("sensitive_field_detected");
 if (typeof event.module!=="string" || !event.module.trim()) errors.push("module_required");
 if (!["started","completed","failed","blocked","transition","escalated"].includes(event.status)) errors.push("status_invalid");
 if (event.error_code!==undefined && !/^[A-Z0-9_]{1,40}$/.test(event.error_code)) errors.push("error_code_invalid");
 if (typeof event.timestamp!=="string" || !ISO_RE.test(event.timestamp) || Number.isNaN(Date.parse(event.timestamp))) errors.push("timestamp_invalid");
 if (typeof event.request_id!=="string" || !ID_RE.test(event.request_id)) errors.push("request_id_invalid");
 if (event.actor_role!==undefined && !["customer","driver","partner","admin","system","qa"].includes(event.actor_role)) errors.push("actor_role_invalid");
 return {valid:errors.length===0,errors};
}
function validateTimeline(events) {
 if (!Array.isArray(events)) return {valid:false,errors:["events must be an array"]};
 const errors=[]; const ids=new Set(); let previous=-Infinity;
 for (const [i,e] of events.entries()) {
  const result=validateAuditEvent(e); if (!result.valid) errors.push("event_"+i+"_invalid:"+result.errors.join(","));
  const time=Date.parse(e?.timestamp); if (Number.isFinite(time)&&time<previous) errors.push("timeline_not_monotonic:"+i);
  if (e?.request_id&&ids.has(e.request_id)) errors.push("duplicate_request_id:"+i); if (e?.request_id) ids.add(e.request_id);
  if (Number.isFinite(time)) previous=time;
 }
 return {valid:errors.length===0,errors};
}
function buildQaReport(input) {
 const required=["phase","scope","commit_refs","files_verified","tests_authored","tests_executed","runtime_status","limitations"];
 const errors=required.filter(k=>!(k in (input||{}))).map(k=>"missing:"+k);
 if (input&&!Number.isInteger(input.phase)) errors.push("phase_must_be_integer");
 for (const k of ["commit_refs","files_verified","tests_authored","tests_executed","limitations"]) if (input&&!Array.isArray(input[k])) errors.push(k+"_must_be_array");
 if (input&&!["pending","not_run","passed","failed","blocked"].includes(input.runtime_status)) errors.push("runtime_status_invalid");
 return {valid:errors.length===0,errors,report:errors.length?null:{...input}};
}
module.exports={ALLOWED_EVENTS,SAFE_FIELDS,validateAuditEvent,validateTimeline,buildQaReport};
