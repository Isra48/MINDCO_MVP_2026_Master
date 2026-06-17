# MINDCO MVP 2026 — Contexto de trabajo

> Archivo de contexto para Claude Code. Este proyecto fue iniciado y trabajado previamente
> con Codex. Aquí se documenta el stack, la arquitectura y las reglas de trabajo (commits/push)
> para retomar el desarrollo sin perder las convenciones existentes.

## Qué es
App móvil **MindCo** construida con **React Native + Expo**. Muestra clases, eventos y un Home
con contenido destacado, manejo de perfil/registro/login y notificaciones de recordatorio de clases.

## Stack tecnológico
- **Expo** `~54.0.0` / **React Native** `0.81.5` / **React** `19.1.0`
- **React Navigation**: native-stack + bottom-tabs (v6) — ver [src/navigation/](src/navigation/)
- **@tanstack/react-query** `^5.59` para data-fetching, caché y persistencia
  (`query-async-storage-persister` + `react-query-persist-client`) — *solo en ramas de integración*
- **Strapi** como CMS/backend de contenido (clases, eventos, home) — *rama `strapiConnection`*
- **expo-notifications** para recordatorios de clase
- **expo-secure-store** / **@react-native-async-storage/async-storage** para persistencia local
- **@expo/vector-icons**, **react-native-reanimated**, **gesture-handler**, **safe-area-context**
- Teléfono: **libphonenumber-js** + **react-native-phone-number-input**

## Estado de las ramas (al 2026-06-11)

| Rama | Estado | Notas |
|------|--------|-------|
| **`strapiConnection`** | 🥇 **Más avanzada** (21 commits sobre `main`) | Integración completa con Strapi: capa de servicios/repositorios, TanStack Query, skeletons, mapeo de datos, notificaciones. Home, Clases, Login y Register conectados. |
| `codex/prepare-mindco-app-for-strapi-integration` | 11 sobre `main` | Scaffolding inicial de Strapi (ya mergeado dentro de `strapiConnection`). |
| `dev` / `SupaBaseConnection` / `versionUI1` | 10 sobre `main` (idénticas entre sí) | UI + notificaciones v1 + class info sheet. Sin backend conectado. |
| `main` | base | Solo mocks/UI. Última: "ajustes de iconos y date picker iphone". |
| `codex/refactor-react-native-app-structure` | desactualizada (15 detrás de `main`) | Refactor histórico a estructura modular. |

**➡️ Para retomar el trabajo más avanzado, usa `strapiConnection`.** Las ramas `dev`,
`SupaBaseConnection` y `versionUI1` están en el mismo punto (UI sin backend); `SupaBaseConnection`
parece un experimento de backend con Supabase que no llegó a divergir de `dev`.

## Arquitectura (rama `strapiConnection`)
Patrón en capas para desacoplar UI de la fuente de datos:

```
src/
  config/env.js              → lee STRAPI_URL, STRAPI_API_TOKEN, CONTENT_SOURCE
  lib/
    http/httpClient.js       → wrapper de fetch (baseURL, headers, timeout)
    strapi/strapiClient.js   → buildQuery (populate/filters/sort/pagination estilo Strapi)
    query/queryClient.js     → instancia de TanStack QueryClient + persistencia
  services/content/
    *.service.js             → llama a la API de Strapi y normaliza
    *.repository.js          → puerta de entrada del UI; mock vs strapi según CONTENT_SOURCE
    *.queries.js             → queryKeys/queryFns de TanStack
    mappers.js               → Strapi (data/attributes) → modelo interno del UI
  utils/
    dateFormatting.js        → timezone por defecto America/Mexico_City
    scheduling.js            → computeClassStatus / computeReminderTriggerDate
  context/NotificationContext.js
  screens/ · components/ · navigation/ · constants/ · hooks/
```

**Switch de fuente de datos:** la variable `CONTENT_SOURCE` (`mock` por defecto, o `strapi`)
controla si los repositorios usan datos mock o la API real. Detalle completo en
[README-integration.md](README-integration.md).

## Setup
```bash
npm install
npm run start        # expo start (QR para Expo Go)
npm run ios          # / android / web
```
Variables de entorno (copia de `.env.example`): `STRAPI_URL`, `STRAPI_API_TOKEN`, `CONTENT_SOURCE`.
**Nunca** commitear el token real.

---

## Reglas de commits y push

### Convención de mensajes (la que ya usa el proyecto)
El historial mezcla español y prefijos tipo *conventional*. Mantener consistencia:

- **Idioma:** español, en minúscula, descriptivo y conciso.
- **Prefijos** cuando aplique (ya usados en el repo): `fix:`, `refactor:`. Se pueden añadir
  `feat:`, `chore:`, `docs:`, `style:` para mayor claridad.
- **Foco:** un commit = un cambio lógico. Mensajes que digan *qué* y *dónde*
  (ej. `feat: home conectado con strapi`, `fix: ajustes en view classes con clases dinamicas`).
- Evitar dobles espacios al inicio (varios commits viejos los tienen — no replicar).

Ejemplos del propio historial:
```
register conectado con strapi
fetching home con skeleton y buenas practicas overfetching
fix: ajustes en view classes con clases dinamicas
refactor logic notification and rendering data class in cards
```

### Reglas de Claude para commit/push
1. **No commitear sin pedirlo.** Solo hago `git commit` / `git push` cuando el usuario lo solicita
   explícitamente.
2. **Nunca trabajar/commitear directo sobre `main`.** Si estoy en `main`, primero creo o cambio a
   una rama de trabajo. El trabajo activo vive en `strapiConnection` (o una rama derivada de ella).
3. **Antes de commitear:** revisar `git status` y `git diff`, agrupar cambios coherentes,
   y nunca incluir `.env`, tokens ni secretos (verificar `.gitignore`).
4. **No subir `node_modules`** ni archivos generados.
5. **Push:** subir a la rama remota correspondiente (`origin/<rama>`), nunca forzar (`--force`)
   sobre ramas compartidas sin confirmación explícita.
6. **PRs:** el flujo previo usa Pull Requests hacia `main` (ej. "Merge pull request #5 …").
   Mantener ese flujo: feature branch → PR → merge.
7. Mensajes de commit generados por Claude terminan con la línea de co-autoría estándar.

### Verificación antes de push
- Que la app levante (`npm run start`) sin errores de import.
- No dejar `console.log` de depuración ni el flag `CONTENT_SOURCE=strapi` apuntando a una
  instancia local en commits destinados a producción.

---

## Builds — qué preguntar y qué setear

> ⚠️ **REGLA PARA CLAUDE:** cada vez que Israel pida **hacer un build** (EAS, `expo build`,
> `expo prebuild`, build de release, APK/IPA, etc.), **antes de ejecutar nada PREGUNTAR**:
> *"¿este build es para **producción** o para seguir en **dev/preview**?"* — y según la respuesta,
> repasar con él el checklist de abajo y ajustar el `.env` / `app.config.js` en consecuencia.
> Nunca asumir el destino del build ni dejar flags de dev en un build de producción.

El `.env` es local y gitignored; los valores llegan a la app vía `app.config.js → extra` y se leen
en [src/config/env.js](src/config/env.js). Estos son los flags que cambian entre dev y producción:

| Flag (`.env`) | Dev / preview | **Producción** | Por qué |
|---------------|---------------|----------------|---------|
| `CONTENT_SOURCE` | `mock` o `strapi` | `strapi` | En prod siempre datos reales del CMS, no mocks. |
| `CONTENT_PREVIEW_MODE` | `true` (refresca casi en vivo) | **`false`** o ausente | El modo preview sobre-pide a Strapi; en prod la frescura la da `CONTENT_CACHE_HOURS`. |
| `CONTENT_CACHE_HOURS` | indiferente | `6` (o el acordado) | Horas que el contenido vive en caché; cuida la cuota de Strapi. Solo aplica con preview off. |
| `CONTENT_PREVIEW_STALE_SECONDS` | `30` | indiferente (preview off) | Solo afecta en modo preview. |
| `DEV_SKIP_AUTH` | `true` (entra al Home sin login) | **`false`** o ausente | Bypass de auth SOLO dev; jamás en prod. Hoy existe porque el login Supabase sigue roto. |
| `STRAPI_API_TOKEN` | token read-only | token read-only (NO commitear) | Nunca subir el token; siempre read-only. |
| `LOGIN_REFETCH_ALWAYS` / `LOGIN_STALE_HOURS` | `true` / `12` | revisar | Frescura de las pantallas de auth. |

### Checklist antes de un build de PRODUCCIÓN
1. **`CONTENT_SOURCE=strapi`** y `STRAPI_URL` / `STRAPI_API_TOKEN` (read-only) correctos.
2. **`CONTENT_PREVIEW_MODE=false`** (o quitarlo) y `CONTENT_CACHE_HOURS` en el valor acordado.
3. **`DEV_SKIP_AUTH=false`** (o quitarlo). ⚠️ Recordar: el bypass solo vive en la rama del PR #14,
   y el **login real de Supabase aún está roto** — si no está arreglado/mergeado, un build de prod
   no podrá pasar del login. Confirmar con Israel antes de buildear.
4. **Acotar `populate: "*"`** en [login.service.js](src/services/content/login.service.js) y
   [register.service.js](src/services/content/register.service.js) al campo real de imagen (deuda
   pendiente; confirmar el nombre del campo en el CMS antes — `populate` a ciegas rompe con 400).
5. **`useDebouncedValue` conectado al buscador del Home** (pendiente; evita fetch por cada tecla).
6. Sin `console.log` de depuración. App levanta sin errores de import (`npx expo start -c`).
7. **EAS sin configurar todavía:** `eas.json` está vacío. Antes del primer build con EAS hay que
   definir los perfiles (`development` / `preview` / `production`) y decidir cómo se inyectan estas
   variables en el build remoto (los `.env` locales NO viajan al builder de EAS — usar
   `eas secret` / `eas env` o las env vars del perfil). Confirmar esto con Israel.

### Para un build de DEV / preview
- `DEV_SKIP_AUTH=true` para entrar al Home sin login mientras Supabase no esté listo.
- `CONTENT_PREVIEW_MODE=true` si se quiere ver el contenido del CMS casi en tiempo real.
- `CONTENT_SOURCE=strapi` o `mock` según lo que se esté probando.
