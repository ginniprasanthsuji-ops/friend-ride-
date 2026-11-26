-- Phase 13C ERS/RRS focused read-only audit.
-- Safe for FRIEND RIDE QA only. SELECT/catalog queries; no writes.
with f as (
  select p.oid,p.proname,pg_get_functiondef(p.oid) as definition
  from pg_proc p join pg_namespace n on n.nspname='public' and n.oid=p.pronamespace
  where p.proname like 'fr_road_ride_%'
),
priv as (
  select f.proname,
    has_function_privilege('anon',f.oid,'EXECUTE') as anon_execute,
    has_function_privilege('authenticated',f.oid,'EXECUTE') as authenticated_execute
  from f
)
select 'rpc_execute_privileges' as audit_item,
       coalesce(string_agg(proname||': anon='||anon_execute||', authenticated='||authenticated_execute,
                          '; ' order by proname),'none') as result
from priv
union all
select 'participant_contact_single_row_limit',
       case when exists(select 1 from f where proname='fr_road_ride_get_participant_contact'
         and definition ~* 'order by b\.created_at desc limit 1')
         then 'confirmed: driver-side contact query returns at most one passenger'
         else 'not detected' end
union all
select 'source_integration',
       case when exists(select 1 from f where proname='fr_road_ride_get_participant_contact')
         then 'RPC exists; frontend integration must be checked separately' else 'RPC missing' end;
