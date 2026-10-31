-- Isolated disbursement workflow foundation. Existing app_records and accounting data remain untouched.
alter type public.aysm_role add value if not exists 'tresorier';
alter type public.aysm_role add value if not exists 'responsable_administratif';

create table if not exists public.disbursement_orders (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  status text not null default 'brouillon'
    check (status in ('brouillon','en_attente_tresorier','approuve_tresorier','rejete','a_completer','en_attente_president','execute','annule')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_by_role text not null check (created_by_role in ('president','responsable_administratif')),
  treasurer_id uuid null references auth.users(id) on delete restrict,
  president_id uuid null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists disbursement_orders_status_idx on public.disbursement_orders(status, created_at desc);
create index if not exists disbursement_orders_creator_idx on public.disbursement_orders(created_by);
alter table public.disbursement_orders enable row level security;
revoke all on public.disbursement_orders from anon;
grant select, insert, update on public.disbursement_orders to authenticated;

drop policy if exists disbursement_read_workflow_roles on public.disbursement_orders;
create policy disbursement_read_workflow_roles on public.disbursement_orders
for select to authenticated
using ((select private.aysm_my_role()) in ('president','tresorier','responsable_administratif'));

drop policy if exists disbursement_create_admin_or_president on public.disbursement_orders;
create policy disbursement_create_admin_or_president on public.disbursement_orders
for insert to authenticated
with check (
  (select private.aysm_my_role()) in ('president','responsable_administratif')
  and created_by=(select auth.uid())
  and created_by_role=(select private.aysm_my_role())::text
  and status in ('brouillon','en_attente_tresorier')
);

drop policy if exists disbursement_update_president_or_owner_admin on public.disbursement_orders;
create policy disbursement_update_president_or_owner_admin on public.disbursement_orders
for update to authenticated
using (
  (select private.aysm_my_role())='president'
  or ((select private.aysm_my_role())='responsable_administratif'
      and created_by=(select auth.uid()) and status in ('brouillon','a_completer'))
)
with check (
  (select private.aysm_my_role())='president'
  or ((select private.aysm_my_role())='responsable_administratif'
      and created_by=(select auth.uid()) and status in ('brouillon','a_completer','en_attente_tresorier'))
);

create or replace function public.aysm_treasurer_decide_disbursement(
  p_order_id uuid, p_decision text, p_notes text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_order public.disbursement_orders%rowtype;
begin
  if private.aysm_my_role() <> 'tresorier' then
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
end; $$;
revoke all on function public.aysm_treasurer_decide_disbursement(uuid,text,text) from public, anon;
grant execute on function public.aysm_treasurer_decide_disbursement(uuid,text,text) to authenticated;
