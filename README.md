# TeamHub - Portal de gestion de proyectos y equipo

![CI](https://github.com/Viky586/App_Gestion_Equipo/actions/workflows/ci.yml/badge.svg)

Portal con Auth, RBAC, chat, documentos, notas y tareas por proyecto. Pensado para desplegar en Vercel y usar Supabase.

## Entrega
- Despliegue (Vercel): https://app-gestion-equipo.vercel.app/
- Slides: https://1drv.ms/p/c/e8f28fa30e98233b/IQA0uhHr5oZ4RqqQd8vCdR7JAQRm6x1cxYSud_gfWMaplyU?e=HtTvzA
- Repo: https://github.com/Viky586/App_Gestion_Equipo

## Descripcion general
TeamHub es un portal de gestion de proyectos y equipos con roles (ADMIN y COLLAB). Permite crear proyectos, invitar usuarios por email, asignarlos a proyectos y colaborar mediante chat, documentos, notas y tareas. Incluye control de acceso por rol y pertenencia, validacion de entradas y politicas RLS en la base de datos.

## Stack tecnologico
- Next.js App Router + TypeScript (strict)
- Tailwind + shadcn/ui
- Supabase (PostgreSQL + Storage + Auth)
- Route Handlers (serverless)
- Zod para validacion
- Testing: Vitest (unit/integration)
- CI: GitHub Actions

## Instalacion y ejecucion
```
npm install
```
1) Crea `.env.local` con las variables de la seccion "Variables de entorno".  
2) Ejecuta las migraciones en Supabase (ver seccion "Migraciones").  
3) (Opcional) `npm run seed`  
4) `npm run dev`

## Estructura del proyecto
```
src/
  domain/           # entidades + reglas
  application/      # use cases + DTOs + interfaces
  infrastructure/   # Supabase/Storage + DI
  presentation/     # UI + route handlers + validacion
supabase/
  migrations/       # SQL de migraciones
tests/
  unit/             # tests de use cases
  integration/      # tests de route handlers
```

## Funcionalidades principales
- Auth email/password con sesiones Supabase
- Roles: ADMIN y COLLAB
- Admin Panel:
  - CRUD proyectos
  - crear usuarios por invitacion
  - asignar colaboradores a proyectos
- Proyecto detalle con tabs: Tareas, Chat, Documentos, Notas
- Chat por proyecto (mensajes persistidos)
- Documentos: upload a Supabase Storage + signed URLs
- Notas por proyecto (autor y permisos de edicion)
- Notas personales por usuario
- Tareas por proyecto (estado, asignacion, archivado)

## Arquitectura (Clean Architecture)
```
src/
  domain/
  application/
  infrastructure/
  presentation/
```

## Requisitos
- Node.js 20+
- Cuenta Supabase + proyecto

## Variables de entorno
Crear `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=project-documents
SIGNED_URL_TTL_SECONDS=900
```

## Migraciones Supabase
Aplicar en el SQL editor de Supabase, en orden:
```
supabase/migrations/0001_init.sql
supabase/migrations/0002_profiles_member_access.sql
supabase/migrations/0003_document_description.sql
supabase/migrations/0004_notes_author_only.sql
supabase/migrations/0005_primary_admin.sql
supabase/migrations/0006_primary_admin_delete_policies.sql
supabase/migrations/0007_personal_notes.sql
supabase/migrations/0008_remove_note_titles.sql
supabase/migrations/0009_project_tasks.sql
supabase/migrations/0010_task_archive.sql
supabase/migrations/0011_task_archive_policy.sql
```

## Seeds (opcional)
Script disponible:
```
node scripts/seed.js
```
Variables opcionales:
```
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=
SEED_COLLAB_EMAIL=
SEED_COLLAB_PASSWORD=
SEED_COLLAB_NAME=
SEED_PROJECT_NAME=
```

## Scripts
```
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:watch
```

## Testing
- Unit: CreateProject, AssignUserToProject, PostProjectMessage
- Integration: POST /api/projects (happy path + forbidden)

## Despliegue en Vercel
1) Conecta el repo en Vercel.
2) Configura las variables de entorno.
3) Deploy.

## Notas de seguridad
- RLS habilitado en todas las tablas
- Policies por rol y pertenencia a proyecto
- Validacion con Zod en endpoints
- Signed URLs para documentos
