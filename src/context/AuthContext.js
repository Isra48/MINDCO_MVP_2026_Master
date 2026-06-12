import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { signOut as supabaseSignOut } from "../lib/supabase/auth";
import { getUser, deleteUser } from "../utils/storage";

const AuthContext = createContext(null);

// Considera el perfil "completo" si hay un nombre guardado localmente.
const readHasProfile = async () => {
  const user = await getUser();
  return Boolean(user?.name);
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setHasProfile(await readHasProfile());
      setInitializing(false);
    })();

    // Fuente de verdad reactiva: cualquier login/logout actualiza la navegación.
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setHasProfile(await readHasProfile());
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Llamar tras guardar el perfil para refrescar la navegación.
  const refreshProfile = async () => setHasProfile(await readHasProfile());

  const signOut = async () => {
    await supabaseSignOut();
    await deleteUser();
    setHasProfile(false);
  };

  const value = {
    session,
    user: session?.user ?? null,
    isLoggedIn: Boolean(session),
    hasProfile,
    initializing,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
