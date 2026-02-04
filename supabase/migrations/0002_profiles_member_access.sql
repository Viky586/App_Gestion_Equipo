-- Allow project members to read profiles of users in the same project
create or replace function public.shares_project_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
     or exists(
        select 1
        from public.project_members me
        join public.project_members other
          on other.project_id = me.project_id
        where me.user_id = auth.uid()
          and other.user_id = p_user_id
     );
$$;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (id = auth.uid() or public.shares_project_with(id));
