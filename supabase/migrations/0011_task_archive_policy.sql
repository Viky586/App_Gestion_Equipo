drop policy if exists tasks_update_primary on public.project_tasks;
create policy tasks_update_primary on public.project_tasks
for update using (public.is_primary_admin() and is_archived = true)
with check (public.is_primary_admin() and is_archived = false);
