-- AYSM COMPTA: atomic multi-module save with optimistic locking + guard for the last active president.
-- Safe to run once in the Supabase SQL editor (idempotent). Take a backup first.

create or replace function public.aysm_save_modules(p_items jsonb)
returns jsonb
language plpgsql
security invoker            -- RLS policies of app_records still apply
set search_path = ''
as $$
declare
  it jsonb;
  v_module text;
  v_rev bigint;
  v_new bigint;
  v_result jsonb := '{}'::jsonb;
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    v_module := it->>'module';
    if it ? 'expected_revision' and jsonb_typeof(it->'expected_revision') = 'number' then
      v_rev := (it->>'expected_revision')::bigint;
      update public.app_records
         set payload = it->'payload', updated_by = v_uid, updated_at = now(), revision = revision + 1
       where module = v_module and revision = v_rev
       returning revision into v_new;
      if v_new is null then
        raise exception 'revision_conflict:%', v_module using errcode = 'AY409';
      end if;
    else
      begin
        insert into public.app_records(module, payload, created_by, updated_by)
        values (v_module, it->'payload', v_uid, v_uid)
        returning revision into v_new;
      exception when unique_violation then
        raise exception 'revision_conflict:%', v_module using errcode = 'AY409';
      end;
    end if;
    v_result := v_result || jsonb_build_object(v_module, v_new);
    v_new := null;
  end loop;
  return v_result;   -- any exception above rolls back ALL modules of the call
end;
$$;
revoke all on function public.aysm_save_modules(jsonb) from public, anon;
grant execute on function public.aysm_save_modules(jsonb) to authenticated;

-- The last active president can never be demoted, deactivated or deleted (prevents locking everyone out).
create or replace function private.aysm_protect_last_president()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'president' and old.is_active
     and (tg_op = 'DELETE' or new.role <> 'president' or new.is_active = false)
     and not exists (select 1 from public.profiles p where p.id <> old.id and p.role = 'president' and p.is_active) then
    raise exception 'cannot_remove_last_president';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end; $$;
revoke all on function private.aysm_protect_last_president() from public, anon, authenticated;
drop trigger if exists aysm_protect_last_president on public.profiles;
create trigger aysm_protect_last_president before update or delete on public.profiles
for each row execute function private.aysm_protect_last_president();

-- The GIN index is useless with one JSONB document per module and slows every save.
drop index if exists public.app_records_payload_gin_idx;
