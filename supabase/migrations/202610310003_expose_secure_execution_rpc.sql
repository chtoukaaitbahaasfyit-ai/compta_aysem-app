-- PostgREST exposes public RPCs. This invoker wrapper delegates to the
-- private SECURITY DEFINER routine, which performs the authoritative role check.
grant usage on schema private to authenticated;

create or replace function public.aysm_execute_disbursement(
  p_order_id uuid,
  p_execution_reference text default null
) returns void
language sql
security invoker
set search_path = ''
as $$
  select private.aysm_execute_disbursement(p_order_id, p_execution_reference);
$$;

revoke all on function public.aysm_execute_disbursement(uuid,text) from public, anon;
grant execute on function public.aysm_execute_disbursement(uuid,text) to authenticated;
