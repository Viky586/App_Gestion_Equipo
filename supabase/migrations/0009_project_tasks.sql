-- Task status enum
do $$ begin
  create type public.task_status as enum ('PENDING', 'REVIEWED', 'DONE');
exception
  when duplicate_object then null;
end $$;

-- Tasks
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'PENDING',
  is_archived boolean not null default false,
  archived_at timestamptz,
  assigned_to uuid not null references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_tasks_project on public.project_tasks(project_id);
create index if not exists idx_project_tasks_assignee on public.project_tasks(assigned_to);

drop trigger if exists trg_project_tasks_updated_at on public.project_tasks;
create trigger trg_project_tasks_updated_at before update on public.project_tasks
for each row execute function public.set_updated_at();

alter table public.project_tasks enable row level security;

drop policy if exists tasks_select on public.project_tasks;
create policy tasks_select on public.project_tasks
for select using (public.is_project_member(project_id));

drop policy if exists tasks_insert on public.project_tasks;
create policy tasks_insert on public.project_tasks
for insert with check (public.is_admin());

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

drop policy if exists tasks_delete on public.project_tasks;
create policy tasks_delete on public.project_tasks
for delete using (public.is_admin());
