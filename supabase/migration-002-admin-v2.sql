-- Admin v2: history, atomic publish with conflict check, logo storage.
create table if not exists public.app_config_history (
  id bigserial primary key,
  rev int not null,
  data jsonb not null,
  by uuid,
  at timestamptz not null default now()
);
alter table public.app_config_history enable row level security;
drop policy if exists "admin read history" on public.app_config_history;
create policy "admin read history" on public.app_config_history for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

create or replace function public.publish_config(new_data jsonb, expected_rev int)
returns int language plpgsql security definer set search_path=public as $$
declare cur int; nr int; final jsonb;
begin
  if not exists (select 1 from public.admin_users where user_id=auth.uid()) then
    raise exception 'not admin';
  end if;
  select coalesce((data->>'rev')::int,0) into cur from public.app_config where id='main' for update;
  if cur is distinct from expected_rev then raise exception 'conflict'; end if;
  nr := cur+1;
  final := new_data || jsonb_build_object('rev',nr);
  update public.app_config set data=final, updated_at=now() where id='main';
  insert into public.app_config_history(rev,data,by) values (nr,final,auth.uid());
  delete from public.app_config_history where id < (select max(id)-30 from public.app_config_history);
  return nr;
end $$;
revoke all on function public.publish_config(jsonb,int) from public, anon;
grant execute on function public.publish_config(jsonb,int) to authenticated;

insert into storage.buckets (id,name,public) values ('sponsor-logos','sponsor-logos',true) on conflict (id) do nothing;
drop policy if exists "logos public read" on storage.objects;
create policy "logos public read" on storage.objects for select using (bucket_id='sponsor-logos');
drop policy if exists "logos admin insert" on storage.objects;
create policy "logos admin insert" on storage.objects for insert to authenticated
with check (bucket_id='sponsor-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "logos admin delete" on storage.objects;
create policy "logos admin delete" on storage.objects for delete to authenticated
using (bucket_id='sponsor-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
