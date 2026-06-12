import Constants from "expo-constants";

const DEFAULT_CONTENT_SOURCE = "mock";

const getExpoExtra = () => Constants.expoConfig?.extra || {};

const readEnvValue = (key) => {
  const extra = getExpoExtra();
  if (extra && extra[key] !== undefined) return extra[key];
  if (typeof process !== "undefined" && process.env && process.env[key] !== undefined) {
    return process.env[key];
  }
  return undefined;
};

export const getStrapiUrl = () => readEnvValue("STRAPI_URL") || "";
export const getStrapiToken = () => readEnvValue("STRAPI_API_TOKEN") || "";
export const getContentSource = () => (readEnvValue("CONTENT_SOURCE") || DEFAULT_CONTENT_SOURCE).toLowerCase();
export const getLoginStaleHours = () => {
  const raw = readEnvValue("LOGIN_STALE_HOURS");
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
};
export const getLoginRefetchAlways = () => readEnvValue("LOGIN_REFETCH_ALWAYS") === "true";

// Horas que el contenido del CMS (clases, eventos, home) se considera fresco y
// sobrevive en caché entre arranques. Más alto = menos llamadas a Strapi (cuida
// la cuota de la prueba gratuita). El pull-to-refresh siempre fuerza datos nuevos.
export const getContentCacheHours = () => {
  const raw = readEnvValue("CONTENT_CACHE_HOURS");
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
};

// Modo preview/pruebas: refresca el contenido casi en tiempo real (al navegar o
// al volver la app a primer plano) en vez de cachear horas. NO hace polling, así
// que no sobre-pide: solo refetchea cuando la data ya pasó su ventana de frescura.
export const isContentPreviewMode = () => readEnvValue("CONTENT_PREVIEW_MODE") === "true";

// Segundos que la data se considera fresca en modo preview (default 30s).
export const getContentPreviewStaleSeconds = () => {
  const raw = readEnvValue("CONTENT_PREVIEW_STALE_SECONDS");
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
};

export const getSupabaseUrl = () => readEnvValue("SUPABASE_URL") || "";
export const getSupabaseAnonKey = () => readEnvValue("SUPABASE_ANON_KEY") || "";

export const isUsingStrapi = () => getContentSource() === "strapi";
export const isMockSource = () => !isUsingStrapi();

// Bypass de auth SOLO para desarrollo: entra directo al Home sin login real.
// Apagado por defecto y nunca se respeta fuera de __DEV__ (no llega a producción).
export const isDevAuthBypass = () =>
  __DEV__ && readEnvValue("DEV_SKIP_AUTH") === "true";

export const config = {
  strapiUrl: getStrapiUrl(),
  strapiToken: getStrapiToken(),
  contentSource: getContentSource(),
};

if (__DEV__) {
  // No imprimir el token. Solo info útil para depurar la fuente de datos.
  // eslint-disable-next-line no-console
  console.log("[config] CONTENT_SOURCE:", getContentSource(), "| STRAPI_URL set:", Boolean(getStrapiUrl()));
}
