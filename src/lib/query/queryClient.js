import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, focusManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  getContentCacheHours,
  getContentPreviewStaleSeconds,
  isContentPreviewMode,
} from "../../config/env";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const PREVIEW = isContentPreviewMode();

// Producción: el contenido del CMS cambia poco, así que se cachea muchas horas
// para no re-pedir lo mismo en cada arranque y cuidar la cuota de la prueba
// gratuita de Strapi (configurable con CONTENT_CACHE_HOURS, default 6h).
const PROD_CACHE_MS = getContentCacheHours() * HOUR_MS;

// Preview/pruebas: la data se considera fresca solo unos segundos para reflejar
// cambios del CMS casi al instante al navegar o volver a la app. Sin polling.
const PREVIEW_STALE_MS = getContentPreviewStaleSeconds() * 1000;

const STALE_MS = PREVIEW ? PREVIEW_STALE_MS : PROD_CACHE_MS;
// En preview, mantener algo de caché en memoria/persistencia (mín. 5 min) para
// que navegar dentro de la ventana de frescura no dispare llamadas repetidas.
const GC_MS = PREVIEW ? Math.max(PREVIEW_STALE_MS, 5 * MINUTE_MS) : PROD_CACHE_MS;

// Puente de "foco" para React Native: sin esto, react-query nunca sabe cuándo la
// app vuelve a primer plano. Habilitado siempre; solo refetchea si la query lo
// pide (refetchOnWindowFocus), que únicamente está activo en modo preview.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => subscription.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      gcTime: GC_MS,
      // Preview: refrescar al montar / enfocar / reconectar (al navegar o volver
      // a la app) para ver cambios casi en vivo —pero solo si la data ya está
      // stale, así que no sobre-pide. Producción: solo el pull-to-refresh.
      refetchOnMount: PREVIEW,
      refetchOnWindowFocus: PREVIEW,
      refetchOnReconnect: PREVIEW,
      retryOnMount: false,
      retry: false,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// La caché persistida sobrevive reinicios de la app durante este tiempo.
export const PERSIST_MAX_AGE_MS = GC_MS;
