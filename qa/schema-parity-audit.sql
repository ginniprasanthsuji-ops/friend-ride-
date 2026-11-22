-- Project Arjuna QA schema-parity inventory (READ ONLY).
-- Run against the QA Supabase project only; no DDL/DML is performed.
select 'public_tables' as section, json_agg(table_name order by table_name) as items
from information_schema.tables
where table_schema='public' and table_type='BASE TABLE'
union all
select 'public_functions', json_agg(routine_name order by routine_name)
from information_schema.routines
where routine_schema='public' and routine_type='FUNCTION';
