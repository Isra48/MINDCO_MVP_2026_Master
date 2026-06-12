import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { asyncStoragePersister, PERSIST_MAX_AGE_MS, queryClient } from "./src/lib/query/queryClient";
import { isDevAuthBypass } from "./src/config/env";

function Root() {
  const { session, hasProfile, initializing } = useAuth();

  // Bypass de desarrollo (DEV_SKIP_AUTH): entra al Home sin login real.
  if (isDevAuthBypass()) {
    return <AppNavigator session={{ dev: true }} hasProfile />;
  }

  if (initializing) return null;

  return <AppNavigator session={session} hasProfile={hasProfile} />;
}

export default function App() {
  return (
    <AuthProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: PERSIST_MAX_AGE_MS,
          buster: "strapi-v4-fields-1",
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => query.state.status === "success",
          },
        }}
      >
        <NotificationProvider>
          <Root />
        </NotificationProvider>
      </PersistQueryClientProvider>
    </AuthProvider>
  );
}
