drop policy if exists notes_update on public.project_notes;
create policy notes_update on public.project_notes
for update using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists notes_delete on public.project_notes;
create policy notes_delete on public.project_notes
for delete using (author_id = auth.uid());
