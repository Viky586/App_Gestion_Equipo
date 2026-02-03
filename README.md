# TeamHub – Portal de gestión de proyectos y equipo

Portal con Auth, RBAC, chat, documentos y notas por proyecto. Pensado para desplegar en Vercel y usar Supabase.

## Stack
- Next.js App Router + TypeScript (strict)
- Tailwind + shadcn/ui
- Supabase (PostgreSQL + Storage)
- Route Handlers (serverless)
- Zod para validación
- Testing: Vitest (unit/integration)
- CI: GitHub Actions

## Funcionalidad MVP
- Auth email/password con sesiones Supabase
- Roles: ADMIN, COLLAB
- Admin Panel: CRUD proyectos, crear colaboradores, asignación a proyectos
- Proyecto detalle con tabs: Chat, Documentos, Notas
- Documentos: upload a Supabase Storage + signed URLs
- Notas: CRUD

## Arquitectura (Clean Architecture)
```
src/
  domain/           # entidades + reglas
  application/      # use cases + DTOs + interfaces
  infrastructure/   # Supabase/Storage + DI
  presentation/     # UI + route handlers + validación
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
El SQL inicial está en:
```
supabase/migrations/0001_init.sql
```
Aplicar en Supabase (SQL editor).

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
```

## Testing
- Unit: 3 use cases (CreateProject, AssignUserToProject, PostProjectMessage)
- Integration: route handler POST /api/projects (happy path + forbidden)

## Despliegue en Vercel
1. Conecta el repo en Vercel.
2. Configura las variables de entorno.
3. Deploy.

## Notas de seguridad
- RLS habilitado en todas las tablas
- Policies por rol y pertenencia a proyecto
- Validación con Zod en endpoints
- Signed URLs para documentos
