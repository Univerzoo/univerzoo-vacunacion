# Configurar el envío de WhatsApp (Meta Cloud API)

El sistema ya está preparado para enviar recordatorios por WhatsApp — solo
falta conectar una cuenta real de Meta. Como antes con Vercel/GitHub, hay
pasos que solo vos podés hacer (cuentas, verificación de negocio) y una parte
que ya dejé lista en el código.

---

## PARTE A — Crear la app de WhatsApp en Meta

### 1. Cuenta de desarrollador
Entrá a https://developers.facebook.com y logueate con un Facebook (personal
o de la clínica, da igual). Si nunca lo usaste, te va a pedir registrarte
como desarrollador (rápido, sin costo).

### 2. Crear la app
- **My Apps → Create App**
- Tipo de app: **Business**
- Nombre sugerido: `UNIVERZOO Vacunacion`

### 3. Agregar el producto WhatsApp
- Dentro de la app, en el catálogo de productos, agregá **WhatsApp**.
- Meta te da automáticamente un **número de prueba gratuito** — sirve para
  probar todo el flujo antes de usar un número real de la clínica.
- En la pantalla de configuración de WhatsApp vas a ver tres datos clave:
  - **Phone Number ID**
  - **WhatsApp Business Account ID** (WABA ID)
  - Un **token temporal** (dura 24 horas, sirve para probar ya mismo)

### 4. Agregar tu número como "tester" (para poder recibir los mensajes de prueba)
- En esa misma pantalla hay una sección **"To"** / destinatarios de prueba.
- Agregá tu propio WhatsApp para poder probar el envío.

### 5. Token permanente (para producción)
El token temporal vence en 24hs, no sirve para el día a día. Para uno
permanente:
- Meta Business Suite → **Configuración del negocio → Usuarios del sistema**
- **Añadir** → crear un usuario del sistema (rol: Admin)
- Asignale la app de WhatsApp con permiso `whatsapp_business_messaging`
- **Generar token** → elegí sin fecha de expiración → copialo (no se vuelve
  a mostrar completo después)

---

## PARTE B — Crear las plantillas (deben aprobarse en Meta)

WhatsApp exige que todo mensaje iniciado por el negocio use una **plantilla
aprobada**. Necesitás crear exactamente estas 5, con estos nombres (así
coinciden con lo ya configurado en `Configuración → Plantillas` del sistema).

Meta → tu app → WhatsApp → **Message Templates → Create Template**. Para
cada una: **Category: Utility**, **Language: Spanish (ES)**.

| Nombre exacto | Cuerpo del mensaje |
|---|---|
| `recordatorio_30_dias` | Hola {{1}} 👋. Te recordamos que {{2}} tiene programada su vacunación de {{3}} para el {{4}}. Comunicate con {{5}} para coordinar el turno. |
| `recordatorio_7_dias` | Hola {{1}} 👋. En 7 días, el {{4}}, corresponde la vacunación de {{3}} de {{2}}. Coordiná el turno con {{5}}. |
| `recordatorio_1_dia` | Hola {{1}} 👋. Mañana {{4}} corresponde la vacunación de {{3}} de {{2}}. Te esperamos en {{5}}. |
| `recordatorio_dia` | Hola {{1}} 👋. Hoy {{4}} corresponde la vacunación de {{3}} de {{2}}. Comunicate con {{5}} para coordinar el turno. |
| `recordatorio_vencida` | Hola {{1}} 👋. La vacunación de {{3}} de {{2}}, programada para el {{4}}, está vencida. Por favor comunicate con {{5}} para regularizarla. |

**Importante**: el orden de `{{1}}` a `{{5}}` no se puede cambiar — el
sistema siempre envía, en ese orden: **1) nombre del propietario, 2) nombre
de la mascota, 3) vacuna, 4) fecha, 5) nombre de la clínica.**

Cuando Meta te pida "ejemplos" para cada variable (obligatorio para mandar a
aprobar), usá algo como: Juan Pérez / Luna / Antirrábica / 12/09/2026 /
UNIVERZOO Clínica Veterinaria.

La aprobación suele tardar de minutos a un par de horas.

---

## PARTE C — Cargar las credenciales (vos, sin compartírmelas)

A diferencia de la base de datos, **el token de WhatsApp no hace falta que
me lo pases** — no necesito verlo para nada, solo lo usa el servidor en
producción. Cargalo vos directo en Vercel:

**Vercel → tu proyecto → Settings → Environment Variables** (Production):

| Variable | Valor |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | el token (temporal para probar, permanente para producción) |
| `WHATSAPP_PHONE_NUMBER_ID` | el Phone Number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | el WABA ID |
| `WHATSAPP_VERIFY_TOKEN` | ya debería estar cargado (`univerzoo-verify-2026`) |

Después de guardarlas, avisame para redesplegar (o hacelo vos mismo desde
**Deployments → ⋯ → Redeploy**).

---

## PARTE D — Configurar el Webhook (para recibir respuestas de los dueños)

En la pantalla de configuración de WhatsApp en Meta:

- **Callback URL**: `https://univerzoo-vacunacion.vercel.app/api/whatsapp/webhook`
- **Verify Token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`
- Suscribite al campo **messages**

---

## Verificar que funciona

1. Andá a `Configuración` dentro del sistema → sección WhatsApp → botón
   **"Probar conexión"**. Si dice "Conectado", las credenciales están bien.
2. Para una prueba real: en `Mensajes`, buscá un mensaje en estado **Error**
   y usá **Reintentar** (o esperá a que el motor de recordatorios genere uno
   nuevo) — debería pasar a **Enviado**.
