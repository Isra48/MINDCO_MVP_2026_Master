import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase, isSupabaseConfigured } from "./client";

// Necesario para que el navegador de auth se cierre correctamente al volver.
WebBrowser.maybeCompleteAuthSession();

// Mensaje único cuando faltan credenciales (URL/anon key) en .env.
const SUPABASE_NOT_CONFIGURED =
  "Supabase no está configurado: faltan SUPABASE_URL o SUPABASE_ANON_KEY en tu .env.";

const assertConfigured = () => {
  if (!isSupabaseConfigured()) throw new Error(SUPABASE_NOT_CONFIGURED);
};

/** Inicia sesión con email y contraseña. */
export const signInWithEmail = async (email, password) => {
  assertConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Registra un usuario con email y contraseña.
 * Devuelve { needsConfirmation } true si el proyecto exige confirmar el correo
 * (en ese caso no hay sesión activa hasta que el usuario confirme).
 */
export const signUpWithEmail = async (email, password) => {
  assertConfigured();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return { ...data, needsConfirmation: !data.session };
};

/** Cierra la sesión actual. */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Inicia sesión con Google vía OAuth (deep link de Expo).
 * Requiere: provider Google habilitado en Supabase con credenciales de Google
 * Cloud, y la redirect URL registrada en Supabase → URL Configuration
 * (ver docs/supabase-auth-setup.md).
 *
 * Importante: supabase-js v2 usa por defecto el flujo PKCE, así que el provider
 * NO devuelve los tokens en el fragmento (#access_token), sino un `code` en el
 * query (?code=...) que hay que intercambiar con exchangeCodeForSession. Aquí se
 * soportan AMBOS casos para ser robustos:
 *   - PKCE  → ?code=...  → exchangeCodeForSession(url)
 *   - implícito → #access_token=...&refresh_token=...  → setSession(...)
 *
 * En Expo Go, makeRedirectUri devuelve un redirect "exp://..." (hay que
 * registrarlo en Supabase); en un build nativo devuelve "mindco://auth-callback".
 */
export const signInWithGoogle = async () => {
  assertConfigured();
  const redirectTo = makeRedirectUri({ scheme: "mindco", path: "auth-callback" });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No se pudo iniciar el flujo de Google.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    // El usuario cerró el navegador / canceló. No es un error.
    return { cancelled: true };
  }

  // Parseamos query (?...) y fragmento (#...) por separado: el code viaja en el
  // query y los tokens del flujo implícito en el fragmento.
  const [beforeHash, hash = ""] = result.url.split("#");
  const queryString = beforeHash.split("?")[1] || "";
  const queryParams = new URLSearchParams(queryString);
  const hashParams = new URLSearchParams(hash);

  // Si el provider/Supabase devolvió un error explícito, propágalo claro.
  const oauthError =
    queryParams.get("error_description") ||
    queryParams.get("error") ||
    hashParams.get("error_description") ||
    hashParams.get("error");
  if (oauthError) throw new Error(decodeURIComponent(oauthError));

  // 1) Flujo PKCE (el predeterminado en supabase-js v2): intercambiar code.
  const code = queryParams.get("code");
  if (code) {
    // exchangeCodeForSession espera el CÓDIGO (no la URL completa). Usa el
    // code_verifier de PKCE que signInWithOAuth guardó en AsyncStorage.
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return { session: sessionData.session };
  }

  // 2) Flujo implícito: tokens directos en el fragmento.
  const access_token = hashParams.get("access_token");
  const refresh_token = hashParams.get("refresh_token");
  if (access_token && refresh_token) {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({ access_token, refresh_token });
    if (sessionError) throw sessionError;
    return { session: sessionData.session };
  }

  throw new Error(
    "No se recibió la sesión de Google (ni code ni tokens en el redirect)."
  );
};
