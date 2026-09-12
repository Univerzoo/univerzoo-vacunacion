# UNIVERZOO · Sistema de Recordatorios de Vacunación

Sistema web para la clínica veterinaria UNIVERZOO: registra propietarios, mascotas
y vacunaciones, y envía recordatorios automáticos por WhatsApp usando una fecha de
próxima vacunación **ingresada manualmente** (nunca calculada por el sistema).

## Arquitectura y stack

Decisiones tomadas y por qué:

- **Next.js 16 (App Router) + TypeScript, todo en un solo proyecto.** Un único
  framework full-stack (frontend + backend vía Server Actions y Route Handlers)
  reduce la superficie a mantener para un equipo chico, sin sacrificar
  escalabilidad (se puede desplegar en cualquier host Node.js o Docker).
- **Prisma ORM 7 + SQLite en desarrollo.** SQLite no requiere instalar un
  servidor de base de datos para levantar el proyecto. Para producción, basta
  cambiar el `provider` del datasource a `postgresql` y el adapter en
  `src/lib/db.ts` (de `@prisma/adapter-better-sqlite3` a
  `@prisma/adapter-pg`), sin tocar el resto del código.
- **Autenticación propia (bcrypt + JWT en cookie httpOnly), sin librerías de
  terceros para auth.** Next.js 16 es muy reciente; se evitó `next-auth`
  (todavía en beta) para no depender de una librería que podría no estar
  alineada con la versión de Next. La sesión es un JWT firmado (`jose`) en una
  cookie `httpOnly` + `secure` en producción, verificado en `src/proxy.ts`
  (el archivo que reemplazó a `middleware.ts` desde Next.js 16).
- **Roles**: ADMINISTRADOR, VETERINARIO, RECEPCIÓN, con permisos verificados
  tanto en la navegación (`proxy.ts`) como dentro de cada Server Action
  (defensa en profundidad).
- **Motor de recordatorios como proceso independiente** (`scripts/run-reminders.ts`),
  pensado para ejecutarse vía cron / Programador de tareas de Windows, **no**
  depende de que alguien tenga el navegador abierto. También existe un Route
  Handler (`/api/cron/reminders`, protegido con `CRON_SECRET`) para
  integrarlo con schedulers HTTP externos si se despliega en un host serverless.
- **WhatsApp Business Platform (Meta Cloud API) vía `fetch`,** sin
  automatización no oficial ni WhatsApp Web. Las credenciales viven únicamente
  en variables de entorno del servidor (`src/lib/whatsapp.ts`), nunca en el
  frontend.
- **Zod** para validar toda entrada de formularios/Server Actions.
- **Tailwind CSS v4** con la paleta de marca (naranja `#F78620` / marrón
  `#4D403A`, extraída del logo) definida como tokens en `src/app/globals.css`.

## Puesta en marcha

```bash
npm install
npm run db:migrate   # crea prisma/migrations y dev.db (SQLite)
npm run db:seed       # usuario admin + catálogo de vacunas + datos de ejemplo
npm run dev
```

Usuario de prueba creado por el seed:

- Email: `admin@univerzoo.com`
- Contraseña: `Univerzoo2026!`

**Cambiar esta contraseña / crear usuarios reales antes de usar en producción**
desde `Usuarios` (solo Administrador).

### Variables de entorno (`.env`)

Ver `.env.example`. Las más importantes:

- `DATABASE_URL`: cadena de conexión (`file:./dev.db` en desarrollo).
- `AUTH_SECRET`: secreto para firmar las sesiones. **Cambiar en producción.**
- `CRON_SECRET`: secreto para invocar `/api/cron/reminders` por HTTP.
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_VERIFY_TOKEN`: credenciales de
  WhatsApp Business Platform (Meta). Sin estas variables, el sistema sigue
  funcionando: genera y registra los recordatorios pendientes, pero cada envío
  queda marcado como `Error: Integración de WhatsApp no configurada`, visible
  en `Mensajes`.

### Motor de recordatorios (ejecución diaria)

```bash
npm run reminders:run
```

Programarlo en el sistema operativo:

- **Windows**: Programador de tareas → acción "Iniciar un programa" →
  `npm.cmd` con argumentos `run reminders:run`, directorio de inicio la carpeta
  del proyecto, frecuencia diaria.
- **Linux**: cron, ej. `0 8 * * * cd /ruta/al/proyecto && npm run reminders:run`.
- **Alternativa HTTP** (hosting sin acceso a cron del SO):
  `POST /api/cron/reminders` con header `Authorization: Bearer <CRON_SECRET>`.

## Plantillas de WhatsApp

Las plantillas (`Configuración → Plantillas de WhatsApp`) definen el texto
interno (para el registro/auditoría) y el **nombre exacto de la plantilla
aprobada en WhatsApp Business Manager** — WhatsApp exige plantillas
pre-aprobadas para mensajes iniciados por el negocio, así que ese nombre debe
coincidir con lo dado de alta en Meta.

## Etapas de desarrollo (según el documento de requerimientos)

1. Proyecto base, autenticación, base de datos — **hecho**
2. Propietarios (CRUD, búsqueda) — **hecho**
3. Mascotas (CRUD, ficha completa) — **hecho**
4. Vacunas (catálogo) + Vacunaciones (registro, fecha manual, historial) — **hecho**
5. Dashboard + estados (Al día / Próxima / Vence hoy / Vencida) — **hecho**
6. Motor automático de recordatorios (dedupe por vacunación+etapa) — **hecho**
7. Integración WhatsApp Cloud API (envío + webhook de respuestas) — **hecho**
8. Plantillas + registro de mensajes + reintento manual — **hecho**
9. Reportes (vacunaciones, vencimientos, WhatsApp) + exportación CSV — **hecho**
10. Auditoría + seguridad (bcrypt, roles, proxy, validación) — **hecho**

Funciones explícitamente fuera del MVP (dejadas preparadas en la arquitectura
para el futuro, sin construir): agenda de turnos, historia clínica,
facturación, farmacia, portal del propietario, chat automatizado, múltiples
sucursales.

## Estructura del proyecto

```
prisma/schema.prisma       Modelo de datos completo (11 tablas)
prisma/seed.ts             Datos iniciales (admin, catálogo, ejemplo)
scripts/run-reminders.ts   Motor de recordatorios como proceso standalone
src/lib/                   Lógica de negocio (auth, whatsapp, reminders, status...)
src/app/(app)/             Páginas protegidas (dashboard, propietarios, mascotas...)
src/app/login/             Login (público)
src/app/api/               Webhook de WhatsApp, cron HTTP, exportación CSV
src/proxy.ts               Protección de rutas (reemplaza a middleware.ts en Next 16)
```

## Notas para producción

- Cambiar `AUTH_SECRET` y la contraseña del usuario admin.
- Migrar de SQLite a PostgreSQL (cambiar `provider` en `prisma/schema.prisma`
  y el adapter en `src/lib/db.ts`).
- Configurar backups periódicos de la base de datos.
- Dar de alta las plantillas de WhatsApp en Meta Business Manager antes de
  activar el motor de recordatorios en producción.
