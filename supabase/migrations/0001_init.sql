-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('ADMIN', 'COLLAB');
exception
  when duplicate_object then null;
end $$;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'COLLAB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_project_messages_project on public.project_messages(project_id, created_at desc);
create index if not exists idx_project_notes_project on public.project_notes(project_id, updated_at desc);
create index if not exists idx_project_docs_project on public.project_documents(project_id, created_at desc);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_notes_updated_at on public.project_notes;
create trigger trg_notes_updated_at before update on public.project_notes
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end; $$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user after insert on auth.users
for each row execute function public.handle_new_user();

-- Role safety (avoid self-escalation)
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if not public.is_admin() and new.role <> old.role then
    raise exception 'forbidden';
  end if;
  return new;
end; $$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation before update on public.profiles
for each row execute function public.prevent_role_escalation();

-- RLS helper functions
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  );
$$;

create or replace function public.is_project_member(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
     or exists(
        select 1 from public.project_members pm
        where pm.project_id = p_project_id and pm.user_id = auth.uid()
     );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_messages enable row level security;
alter table public.project_notes enable row level security;
alter table public.project_documents enable row level security;

-- Profiles policies
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Projects policies
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
for select using (public.is_project_member(id));

drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects
for insert with check (public.is_admin());

drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects
for delete using (public.is_admin());

-- Members policies
drop policy if exists members_select on public.project_members;
create policy members_select on public.project_members
for select using (public.is_project_member(project_id));

drop policy if exists members_insert on public.project_members;
create policy members_insert on public.project_members
for insert with check (public.is_admin());

drop policy if exists members_delete on public.project_members;
create policy members_delete on public.project_members
for delete using (public.is_admin());

-- Messages policies
drop policy if exists messages_select on public.project_messages;
create policy messages_select on public.project_messages
for select using (public.is_project_member(project_id));

drop policy if exists messages_insert on public.project_messages;
create policy messages_insert on public.project_messages
for insert with check (public.is_project_member(project_id) and author_id = auth.uid());

drop policy if exists messages_delete on public.project_messages;
create policy messages_delete on public.project_messages
for delete using (author_id = auth.uid() or public.is_admin());

-- Notes policies
drop policy if exists notes_select on public.project_notes;
create policy notes_select on public.project_notes
for select using (public.is_project_member(project_id));

drop policy if exists notes_insert on public.project_notes;
create policy notes_insert on public.project_notes
for insert with check (public.is_project_member(project_id) and author_id = auth.uid());

drop policy if exists notes_update on public.project_notes;
create policy notes_update on public.project_notes
for update using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists notes_delete on public.project_notes;
create policy notes_delete on public.project_notes
for delete using (author_id = auth.uid() or public.is_admin());

-- Documents policies
drop policy if exists docs_select on public.project_documents;
create policy docs_select on public.project_documents
for select using (public.is_project_member(project_id));

drop policy if exists docs_insert on public.project_documents;
create policy docs_insert on public.project_documents
for insert with check (public.is_project_member(project_id) and author_id = auth.uid());

drop policy if exists docs_delete on public.project_documents;
create policy docs_delete on public.project_documents
for delete using (author_id = auth.uid() or public.is_admin());

-- Storage bucket + policies
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict do nothing;

-- Access only if member of project (path: projects/{projectId}/...)
drop policy if exists storage_select_project_docs on storage.objects;
create policy storage_select_project_docs on storage.objects
for select using (
  bucket_id = 'project-documents'
  and public.is_project_member((split_part(name, '/', 2))::uuid)
);

drop policy if exists storage_insert_project_docs on storage.objects;
create policy storage_insert_project_docs on storage.objects
for insert with check (
  bucket_id = 'project-documents'
  and public.is_project_member((split_part(name, '/', 2))::uuid)
);

drop policy if exists storage_delete_project_docs on storage.objects;
create policy storage_delete_project_docs on storage.objects
for delete using (
  bucket_id = 'project-documents'
  and public.is_project_member((split_part(name, '/', 2))::uuid)
);
