alter table public.project_notes
  drop column if exists title;

alter table public.personal_notes
  drop column if exists title;
