# Configuración de Auth con Supabase + Google — MindCo

Guía exacta para dejar el **login y registro** funcionando de punta a punta con
(a) email/contraseña y (b) Google. El lado de la app **ya está implementado y
corregido** (ver `src/lib/supabase/auth.js`, `src/context/AuthContext.js`,
`src/navigation/AppNavigator.js`). Lo que falta es **configurar el proyecto
Supabase y el OAuth client de Google**, que es manual y se documenta aquí.

- Proyecto Supabase: **MindCoApp**
- URL: `https://yfllqmjckarjbxxujdqg.supabase.co`
- Deep link de la app (scheme): `mindco://` (definido en `app.config.js`)
- Redirect de OAuth en la app: `mindco://auth-callback` (build nativo) /
  `exp://...` (Expo Go)

---

## Paso 1 — Anon / Publishable key (obligatorio)

Sin esta key la app NO puede hablar con Supabase (login y registro fallan con un
mensaje claro: *"Supabase no está configurado…"*).

1. Entra a Supabase → proyecto **MindCoApp**.
2. **Project Settings** (engranaje) → **API**.
3. En **Project API keys** copia la key **`anon` / `public`** (o la nueva
   **`publishable`** `sb_publishable_...` si tu proyecto ya usa el esquema nuevo).
   - ⚠️ NUNCA uses la `service_role` / `secret` en la app. Esa es de servidor.
4. Pégala en el `.env` local del worktree:

   ```env
   SUPABASE_URL=https://yfllqmjckarjbxxujdqg.supabase.co
   SUPABASE_ANON_KEY=<pega-aquí-la-anon-o-publishable-key>
   ```

   El `.env` está **gitignored** (no se commitea). Los valores llegan a la app
   vía `app.config.js → extra` y se leen en `src/config/env.js`.
5. Reinicia Expo con caché limpio para que tome el `.env`: `npx expo start -c`.

> La URL ya quedó puesta en `.env`; solo falta reemplazar `PENDIENTE_anon_key`.

---

## Paso 2 — Provider Email (login/registro con correo)

1. Supabase → **Authentication** → **Providers** → **Email** → habilitarlo (Enable).
2. Decide **"Confirm email"** (Authentication → Providers → Email → *Confirm email*):

   | Opción | Efecto en la app |
   |--------|------------------|
   | **ON** (recomendado para prod) | `signUp` NO crea sesión hasta que el usuario abra el enlace del correo. La app ya lo maneja: `signUpWithEmail` devuelve `needsConfirmation: true` y `RegisterScreen` muestra *"Confirma tu correo"* y manda a Login. |
   | **OFF** (cómodo para pruebas) | `signUp` crea sesión al instante → la app entra directo al onboarding/Home sin pasar por el correo. |

   Para probar rápido el flujo completo en dev, puedes ponerlo **OFF**; para
   producción déjalo **ON**.
3. (Opcional, solo si Confirm email = ON) En **Authentication → URL
   Configuration → Site URL**, pon una URL válida para que el enlace del correo
   no falle. Para móvil puedes usar `mindco://auth-callback`.

---

## Paso 3 — Provider Google (login/registro con Google)

Crear el **OAuth Client es SIEMPRE manual en Google Cloud** (no hay MCP para eso).

### 3a. Crear el OAuth Client ID en Google Cloud Console
1. <https://console.cloud.google.com/> → selecciona/crea un proyecto.
2. **APIs & Services** → **OAuth consent screen**: configúralo (External),
   nombre de la app, email de soporte; agrega tu email como *test user* mientras
   esté en modo testing.
3. **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID**.
4. **Application type: `Web application`** (NO Android/iOS: el callback lo recibe
   Supabase, no la app directamente).
5. En **Authorized redirect URIs** agrega EXACTAMENTE:

   ```
   https://yfllqmjckarjbxxujdqg.supabase.co/auth/v1/callback
   ```
6. Crea y copia el **Client ID** y el **Client Secret**.

### 3b. Pegar credenciales en Supabase
1. Supabase → **Authentication** → **Providers** → **Google** → Enable.
2. Pega **Client ID** y **Client Secret** del paso 3a.
3. Guarda.

> Cómo funciona en la app (ya implementado, flujo **PKCE**): la app abre el
> navegador con `WebBrowser.openAuthSessionAsync`, Google → Supabase devuelve un
> `?code=...` al redirect, y la app llama `exchangeCodeForSession(code)` con el
> `code_verifier` guardado en AsyncStorage. (Antes el código solo leía
> `#access_token` del fragmento, que en PKCE nunca llega — ese era el bug que
> rompía el login con Google.)

---

## Paso 4 — Redirect URLs en Supabase (obligatorio para Google)

Supabase → **Authentication** → **URL Configuration** → **Redirect URLs** → Add:

1. **Build nativo (APK/IPA, EAS):**
   ```
   mindco://auth-callback
   ```
2. **Expo Go (desarrollo):** un redirect tipo `exp://...`. No es fijo; depende de
   tu IP/puerto. Para obtenerlo:
   - Agrega temporalmente en `signInWithGoogle` (en `src/lib/supabase/auth.js`,
     justo después de calcular `redirectTo`):
     ```js
     console.log("[auth] redirectTo =", redirectTo);
     ```
   - Arranca Expo Go, toca *Continuar con Google* y copia del log el valor, p. ej.
     `exp://192.168.1.50:8081/--/auth-callback`.
   - Pégalo tal cual en **Redirect URLs**. Quita el `console.log` después.
   - Alternativa: registra el comodín `exp://*` o, mejor, prueba Google en un
     **dev build** nativo (no Expo Go), donde el redirect ya es el fijo
     `mindco://auth-callback`.

> Para Expo Go también puedes usar un proxy de Expo
> (`makeRedirectUri({ useProxy: true })` → `https://auth.expo.io/...`), pero el
> código actual usa deep link directo; lo más simple para Google estable es el
> dev build nativo con `mindco://auth-callback`.

---

## Qué se puede hacer por MCP de Supabase vs. qué es manual

| Tarea | ¿MCP de Supabase? | Notas |
|-------|-------------------|-------|
| Leer/obtener la anon/publishable key | Posible vía MCP (project settings/keys) | Igual hay que pegarla en `.env`. |
| Habilitar provider **Email** y "Confirm email" | Posible vía MCP (auth config) | |
| Habilitar provider **Google** (pegar Client ID/Secret) | Posible vía MCP (auth config) | Pero necesitas ANTES el Client ID/Secret de Google. |
| Agregar **Redirect URLs** (`mindco://auth-callback`, `exp://...`) | Posible vía MCP (auth config / URL configuration) | |
| Crear el **OAuth Client en Google Cloud** | ❌ **Manual SIEMPRE** | No hay MCP de Supabase para Google Cloud. Paso 3a a mano. |

---

## Checklist priorizado para que el login funcione de punta a punta

1. **[BLOQUEANTE] Anon key real** en `.env` (`SUPABASE_ANON_KEY`). Sin esto, nada
   de auth funciona. (Paso 1)
2. **[BLOQUEANTE] Provider Email habilitado** + decidir Confirm email. (Paso 2)
   → con esto ya funciona login/registro por correo.
3. **OAuth Client de Google (Web)** creado en Google Cloud con el redirect
   `https://yfllqmjckarjbxxujdqg.supabase.co/auth/v1/callback`. (Paso 3a — manual)
4. **Provider Google habilitado** en Supabase con Client ID/Secret. (Paso 3b)
5. **Redirect URLs** en Supabase: `mindco://auth-callback` y el `exp://...` de
   Expo Go. (Paso 4) → con esto funciona Google.
6. (Solo dev) `DEV_SKIP_AUTH=true` permite saltarse el login para probar el resto
   de la app; mantenerlo en `false` mientras se prueba el flujo de auth real, y
   **siempre `false` en producción**.

---

## Verificación rápida en la app

- Email: Login con un usuario creado → debe entrar (si Confirm email = OFF, el
  registro entra directo; si ON, primero confirmar el correo).
- Google: *Continuar con Google* → navegador → vuelve a la app con sesión.
- Tras el primer login, la app muestra **ProfileEditor** (onboarding); al guardar,
  pasa al Home (`refreshProfile()` sincroniza el gating).
- Logout desde **Ajustes** vuelve a Login automáticamente.
