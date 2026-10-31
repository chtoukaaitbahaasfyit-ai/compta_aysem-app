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

-- The treasurer decision RPC must also pass through the update trigger using a
-- transaction-local guard; direct REST updates remain rejected.
create or replace function public.aysm_treasurer_decide_disbursement(
  p_order_id uuid, p_decision text, p_notes text default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_order public.disbursement_orders%rowtype;
begin
  if auth.uid() is null or private.aysm_my_role() <> 'tresorier' then
    raise exception 'صلاحية أمين المال مطلوبة';
  end if;
  if p_decision not in ('approuve_tresorier','rejete','a_completer') then
    raise exception 'قرار غير صالح';
  end if;
  select * into v_order from public.disbursement_orders where id=p_order_id for update;
  if not found or v_order.status <> 'en_attente_tresorier' then
    raise exception 'الطلب ليس في انتظار مراجعة أمين المال';
  end if;
  if v_order.created_by=auth.uid() then
    raise exception 'لا يمكن اعتماد طلب أنشأه أمين المال نفسه';
  end if;
  perform set_config('aysm.allow_treasurer_decision', 'on', true);
  update public.disbursement_orders
  set status=p_decision, treasurer_id=auth.uid(), updated_at=now(),
      payload=jsonb_set(
        jsonb_set(
          jsonb_set(payload, '{treasurerId}', to_jsonb(auth.uid()::text), true),
          '{treasurerDecision}', to_jsonb(p_decision), true
        ),
        '{treasurerNotes}', to_jsonb(coalesce(p_notes,'')), true
      )
  where id=p_order_id;
end;
$$;
revoke all on function public.aysm_treasurer_decide_disbursement(uuid,text,text) from public, anon;
grant execute on function public.aysm_treasurer_decide_disbursement(uuid,text,text) to authenticated;

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
    if current_setting('aysm.allow_treasurer_decision', true) is distinct from 'on'
      or old.status <> 'en_attente_tresorier'
      or new.status not in ('approuve_tresorier','rejete','a_completer')
      or new.payload->>'treasurerId' is distinct from auth.uid()::text
      or new.created_by is distinct from old.created_by
      or new.created_by_role is distinct from old.created_by_role
      or new.executed_at is distinct from old.executed_at
      or new.executed_by is distinct from old.executed_by then
      raise exception 'قرارات أمين المال تمر حصرياً عبر إجراء المراجعة المعتمد';
    end if;
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
