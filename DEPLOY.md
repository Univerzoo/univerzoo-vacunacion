# Guía para poner el sistema en línea (Vercel)

Hay pasos que solo vos podés hacer (crear cuentas, hacer clic en botones de un
dashboard que no puedo tocar) y pasos que hago yo (código, migraciones,
verificación). Te marco claramente cuáles son cuáles.

---

## PARTE A — Lo que hacés vos

### 1. Crear cuenta en GitHub (si no tenés)
- Entrá a https://github.com/signup y creá la cuenta.

### 2. Crear el repositorio del código
- Una vez logueado, andá a https://github.com/new
- Nombre sugerido: `univerzoo-vacunacion`
- Marcalo como **Privado** (tiene datos de una clínica real).
- **NO** tildes "Add a README file" ni ".gitignore" ni licencia — el proyecto
  ya los tiene, si los agregás GitHub crea conflictos al primer push.
- Clic en "Create repository".
- Copiá la URL que te muestra GitHub, algo como:
  `https://github.com/tu-usuario/univerzoo-vacunacion.git`
- **Pasame esa URL** (por chat) para que yo suba el código.

### 3. Crear cuenta en Vercel
- Entrá a https://vercel.com/signup
- Elegí **"Continue with GitHub"** (así queda todo conectado con una sola cuenta).

### 4. Importar el proyecto
- En el dashboard de Vercel: **Add New… → Project**.
- Elegí el repositorio `univerzoo-vacunacion` que creaste.
- Framework: Vercel detecta Next.js automáticamente. No cambies nada más todavía.
- Dale **Deploy**. (Va a fallar porque todavía no hay base de datos — es
  esperado, seguimos al paso 5.)

### 5. Crear la base de datos (Postgres vía Neon, gratis)
- Dentro del proyecto en Vercel, andá a la pestaña **Storage**.
- **Create Database → Postgres (Neon)**.
- Seguí el asistente y **conectala a tu proyecto** cuando te lo pida — esto
  agrega automáticamente la variable `DATABASE_URL`, no hace falta copiarla a mano.

### 6. Cargar el resto de las variables de entorno
- Andá a **Settings → Environment Variables** del proyecto y agregá estas
  (marcá "Production" y "Preview" en ambas):

| Variable | Valor |
|---|---|
| `AUTH_SECRET` | `ncU1qRCqMT1PpOpeLdYym_CvH1d7aPBSJ6RWWOCXLQ0` |
| `CRON_SECRET` | `mAUeJai9DgfAvv1G8UJV6lpgJgJBAvbo` |
| `CLINIC_NAME` | `UNIVERZOO Clínica Veterinaria` |
| `CLINIC_PHONE` | tu teléfono real |
| `CLINIC_WHATSAPP` | tu WhatsApp real |
| `WHATSAPP_ACCESS_TOKEN` | (cuando tengas cuenta de WhatsApp Business API) |
| `WHATSAPP_PHONE_NUMBER_ID` | (idem) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | (idem) |
| `WHATSAPP_VERIFY_TOKEN` | inventá cualquier texto secreto, ej. `univerzoo-verify-2026` |

Los dos primeros valores (`AUTH_SECRET`, `CRON_SECRET`) ya te los generé yo,
son seguros para usar tal cual — solo copialos y pegalos.

### 7. Avisame
Una vez que tengas el repo creado (paso 2) y la base de datos conectada
(paso 5), avisame. Ahí hago yo la Parte B y coordinamos el redeploy final.

---

## PARTE B — Lo que hago yo (cuando me avises)

1. Subir el código al repositorio que creaste.
2. Adaptar el proyecto de SQLite (desarrollo) a PostgreSQL (producción): cambiar
   el `provider` en `prisma/schema.prisma`, el adaptador en `src/lib/db.ts`, y
   generar/aplicar la migración inicial contra tu base en Neon.
3. Verificar que el build de producción funcione antes de que hagas el deploy
   final.
4. Confirmarte la URL pública (`https://univerzoo-vacunacion.vercel.app` o
   similar) y probar el login ahí mismo.

## Después de estar en línea

- El motor de recordatorios ya está configurado para correr automáticamente
  todos los días a las 12:00 UTC vía **Vercel Cron** (ver `vercel.json`) —
  no hace falta programar nada en ninguna PC.
- Si más adelante querés un dominio propio (ej. `vacunacion.univerzoo.com`),
  eso se agrega en **Settings → Domains** del proyecto en Vercel.
