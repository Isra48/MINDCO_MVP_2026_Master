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

export const getSupabaseUrl = () => readEnvValue("SUPABASE_URL") || "";
export const getSupabaseAnonKey = () => readEnvValue("SUPABASE_ANON_KEY") || "";

export const isUsingStrapi = () => getContentSource() === "strapi";
export const isMockSource = () => !isUsingStrapi();

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
