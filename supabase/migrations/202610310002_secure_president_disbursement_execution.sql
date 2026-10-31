-- Secure, idempotent president confirmation for a treasurer-approved disbursement.
-- This records the association's authorization decision; it does not transfer money
-- or create a ledger entry. Bank execution and accounting posting remain separate.
alter table public.disbursement_orders
  add column if not exists executed_at timestamptz,
  add column if not exists executed_by uuid references auth.users(id) on delete restrict,
  add column if not exists execution_reference text;

create or replace function private.aysm_execute_disbursement(
  p_order_id uuid,
  p_execution_reference text default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.disbursement_orders%rowtype;
begin
  if auth.uid() is null or private.aysm_my_role() <> 'president' then
    raise exception 'صلاحية الرئيس مطلوبة لتأكيد تنفيذ طلب الصرف';
  end if;

  select * into v_order
  from public.disbursement_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'طلب الصرف غير موجود';
  end if;
  if v_order.status <> 'approuve_tresorier' then
    raise exception 'لا يمكن تأكيد التنفيذ قبل موافقة أمين المال';
  end if;
  if v_order.executed_at is not null or v_order.status = 'execute' then
    raise exception 'سبق تأكيد تنفيذ هذا الطلب';
  end if;

  perform set_config('aysm.allow_disbursement_execution', 'on', true);
  update public.disbursement_orders
  set status = 'execute',
      president_id = auth.uid(),
      executed_at = now(),
      executed_by = auth.uid(),
      execution_reference = nullif(btrim(p_execution_reference), ''),
      updated_at = now()
  where id = p_order_id;
end;
$$;

revoke all on function private.aysm_execute_disbursement(uuid,text) from public, anon;
grant execute on function private.aysm_execute_disbursement(uuid,text) to authenticated;

-- Prevent direct president edits to workflow state; the approved RPC sets a
-- transaction-local guard before making its narrowly scoped update.
create or replace function public.aysm_guard_disbursement_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_role text := private.aysm_my_role()::text;
begin
  if v_role = 'responsable_administratif' then
    if old.created_by <> auth.uid()
      or old.status not in ('brouillon','a_completer')
      or new.created_by <> old.created_by
      or new.created_by_role <> old.created_by_role
      or new.treasurer_id is distinct from old.treasurer_id
      or new.president_id is distinct from old.president_id
      or new.executed_at is distinct from old.executed_at
      or new.executed_by is distinct from old.executed_by
      or new.execution_reference is distinct from old.execution_reference
      or new.status <> 'en_attente_tresorier' then
      raise exception 'المسؤول الإداري يمكنه فقط إحالة طلبه للمراجعة أو استكماله';
    end if;
  elsif v_role = 'tresorier' then
    raise exception 'قرارات أمين المال تمر حصرياً عبر إجراء المراجعة المعتمد';
  elsif v_role = 'president' then
    if current_setting('aysm.allow_disbursement_execution', true) is distinct from 'on'
      or old.status <> 'approuve_tresorier'
      or new.status <> 'execute'
      or new.payload is distinct from old.payload
      or new.created_by is distinct from old.created_by
      or new.created_by_role is distinct from old.created_by_role
      or new.treasurer_id is distinct from old.treasurer_id
      or new.executed_by is distinct from auth.uid()
      or new.executed_at is null then
      raise exception 'تأكيد التنفيذ يتم حصرياً عبر الإجراء الآمن للرئيس';
    end if;
  else
    raise exception 'غير مخول لتعديل طلب الصرف';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
