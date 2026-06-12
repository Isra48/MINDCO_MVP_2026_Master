<div align="center">

# 🧘 MindCo

### Tu espacio de bienestar, en el bolsillo.

*Clases de meditación, respiración y yoga — en vivo y a tu ritmo.*

</div>

---

## ✨ ¿Qué es MindCo?

**MindCo** es una app móvil que te acerca a la calma. Reúne clases de **mindfulness, respiración
consciente y yoga** impartidas por instructores reales, ya sea **en línea (Zoom)** o **presenciales**,
para que encuentres tu momento de pausa donde estés.

La idea es simple: abrir la app, ver qué clase viene pronto y unirte con un toque.

## 🌿 ¿Qué puedes hacer?

- 🏠 **Descubrir** las clases destacadas y próximas desde la pantalla de inicio.
- 📅 **Explorar la agenda** de clases ordenadas por cercanía, con su horario, modalidad e instructor.
- 🔔 **Recibir recordatorios** antes de que empiece tu clase para no perdértela.
- 📍 **Ver destinos y eventos** presenciales destacados.
- 👤 **Crear tu cuenta y perfil** para personalizar tu experiencia.
- ℹ️ **Consultar el detalle** de cada clase: materiales, duración y enlace de acceso.

## 📲 Cómo probar la app (sin conocimientos técnicos)

1. Instala **Expo Go** en tu teléfono (gratis):
   - iPhone → [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android → [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Pídele al equipo de desarrollo que **levante el servidor** (ver sección de abajo).
3. **Escanea el código QR** que aparece:
   - iPhone → con la app **Cámara**.
   - Android → desde el escáner dentro de **Expo Go**.
4. ¡Listo! La app se abre en tu teléfono. *(Tu teléfono y la computadora deben estar en la misma red Wi‑Fi.)*

---

# 👩‍💻 Para desarrolladores y agentes

> Para contexto profundo del proyecto (arquitectura, estado de la integración, reglas internas)
> lee **[CLAUDE.md](CLAUDE.md)**. Para preparar un Strapi nuevo, usa **[STRAPI_SETUP_PROMPT.md](STRAPI_SETUP_PROMPT.md)**.

## 🧱 Stack

- **Expo** `~54` · **React Native** `0.81` · **React** `19`
- **React Navigation** (native-stack + bottom-tabs)
- **TanStack Query** (`@tanstack/react-query`) para fetching, caché y persistencia
- **Strapi** como CMS de contenido (compatible con **v4 y v5**)
- **expo-notifications** (recordatorios) · **expo-secure-store** / **AsyncStorage** (persistencia)

## 🚀 Arranque rápido

```bash
# 1. Instalar dependencias (primera vez o tras cambiar de rama)
npm install

# 2. Configurar variables de entorno
cp .env.example .env        # luego edita .env con tus valores

# 3. Levantar Metro + QR
npm start                   # = npx expo start
```

Variantes útiles:

```bash
npx expo start --clear      # limpia caché de Metro
npx expo start --tunnel     # si el teléfono y la Mac no están en la misma red
npm run ios | android | web # abrir en simulador / emulador / navegador
```

## 🔐 Variables de entorno

Se definen en `.env` (gitignored, **nunca se commitea**) y las expone `app.config.js` → `expo.extra`.

| Variable | Descripción |
|----------|-------------|
| `CONTENT_SOURCE` | `mock` (datos de prueba, por defecto) o `strapi` (API real) |
| `STRAPI_URL` | URL base del Strapi (sin `/` final) |
| `STRAPI_API_TOKEN` | API Token **read-only** de Strapi |
| `LOGIN_REFETCH_ALWAYS` / `LOGIN_STALE_HOURS` | tuning de caché de la pantalla de login |

## 🗂️ Arquitectura (resumen)

Patrón en capas que desacopla la UI de la fuente de datos. El flag `CONTENT_SOURCE` decide
entre mocks y Strapi sin tocar la UI.

```
src/
  config/env.js            → lee la config desde expo.extra / process.env
  lib/
    http/ · strapi/        → cliente fetch + buildQuery + normalize (v4/v5)
  services/content/        → service (API) · repository (mock|strapi) · queries (TanStack) · mappers
  screens/ · components/ · navigation/ · context/ · hooks/ · utils/
```

> **Strapi v4 vs v5:** la respuesta se normaliza en [`src/lib/strapi/normalize.js`](src/lib/strapi/normalize.js)
> (`flattenEntity` / `flattenMedia`), así que el resto del código funciona con ambas versiones.

## 🌱 Flujo de trabajo (Git)

- Rama principal: **`main`** (única fuente de verdad).
- **No se commitea directo a `main`.** Cada cambio va en una rama feature → PR → merge.
- Commits con **Conventional Commits + Gitmoji** en español, con el **emoji al final** (ej. `feat(strapi): ... ✨`, `fix: ... 🐛`).
- El comando **`/sf`** (Claude Code) automatiza: rama feature + commits + push + PR.
  Definición en [`.claude/commands/sf.md`](.claude/commands/sf.md).

## 🤖 Nota para agentes

Antes de tocar tareas de IA/Strapi/commits, revisa `CLAUDE.md` y respeta el flujo `/sf`.
La app fue iniciada con Codex y continúa con Claude Code; mantén las convenciones existentes.
