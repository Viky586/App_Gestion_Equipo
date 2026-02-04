-- Personal notes (private per user)
create table if not exists public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_personal_notes_user on public.personal_notes(user_id);

drop trigger if exists trg_personal_notes_updated_at on public.personal_notes;
create trigger trg_personal_notes_updated_at before update on public.personal_notes
for each row execute function public.set_updated_at();

alter table public.personal_notes enable row level security;

drop policy if exists personal_notes_select on public.personal_notes;
create policy personal_notes_select on public.personal_notes
for select using (user_id = auth.uid());

drop policy if exists personal_notes_insert on public.personal_notes;
create policy personal_notes_insert on public.personal_notes
for insert with check (user_id = auth.uid());

drop policy if exists personal_notes_update on public.personal_notes;
create policy personal_notes_update on public.personal_notes
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists personal_notes_delete on public.personal_notes;
create policy personal_notes_delete on public.personal_notes
for delete using (user_id = auth.uid());
