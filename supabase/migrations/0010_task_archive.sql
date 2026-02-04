alter table public.project_tasks
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

drop policy if exists tasks_update on public.project_tasks;
create policy tasks_update on public.project_tasks
for update using (
  (assigned_to = auth.uid() or public.is_admin()) and is_archived = false
)
with check (
  (assigned_to = auth.uid() or public.is_admin())
);

drop policy if exists tasks_update_primary on public.project_tasks;
create policy tasks_update_primary on public.project_tasks
for update using (public.is_primary_admin())
with check (public.is_primary_admin());
