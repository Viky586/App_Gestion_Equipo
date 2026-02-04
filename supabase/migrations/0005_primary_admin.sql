alter table public.profiles
  add column if not exists is_primary_admin boolean not null default false;

create or replace function public.is_primary_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_primary_admin = true
  );
$$;

drop policy if exists notes_delete on public.project_notes;
create policy notes_delete on public.project_notes
for delete using (author_id = auth.uid() or public.is_primary_admin());
