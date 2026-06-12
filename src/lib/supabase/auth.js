import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "./client";

// Necesario para que el navegador de auth se cierre correctamente al volver.
WebBrowser.maybeCompleteAuthSession();

/** Inicia sesión con email y contraseña. */
export const signInWithEmail = async (email, password) => {
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
 * Cloud, y la redirect URL registrada en Supabase (ver README/PR).
 */
export const signInWithGoogle = async () => {
  const redirectTo = makeRedirectUri({ scheme: "mindco", path: "auth-callback" });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No se pudo iniciar el flujo de Google.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    return { cancelled: true };
  }

  // El redirect trae los tokens en el fragmento (#access_token=...&refresh_token=...)
  const fragment = result.url.split("#")[1] || result.url.split("?")[1] || "";
  const params = new URLSearchParams(fragment);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) {
    throw new Error("No se recibieron los tokens de Google.");
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) throw sessionError;
  return { session: sessionData.session };
};
