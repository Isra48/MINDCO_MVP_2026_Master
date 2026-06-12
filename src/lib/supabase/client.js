import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "../../config/env";

const url = getSupabaseUrl();
const anonKey = getSupabaseAnonKey();

if (__DEV__ && (!url || !anonKey)) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Falta SUPABASE_URL o SUPABASE_ANON_KEY en .env — el login no funcionará."
  );
}

// Cliente único de Supabase. Persiste la sesión en AsyncStorage y la refresca
// automáticamente. detectSessionInUrl=false porque en RN no hay URL de navegador.
export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = () => Boolean(url && anonKey);

export default supabase;
