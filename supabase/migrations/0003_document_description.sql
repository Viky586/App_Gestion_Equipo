alter table public.project_documents
  add column if not exists description text;

update public.project_documents
set description = 'Sin descripcion'
where description is null;

alter table public.project_documents
  alter column description set not null;
