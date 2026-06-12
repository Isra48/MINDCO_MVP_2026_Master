// Configuración dinámica de Expo.
// Los secretos (STRAPI_URL, STRAPI_API_TOKEN) se leen de variables de entorno
// definidas en `.env` (gitignored) y NUNCA se commitean.
// Expo CLI carga automáticamente los archivos `.env*` en process.env.
export default {
  expo: {
    name: "CodexReactNativeTest1",
    slug: "codexreactnativetest1",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    assetBundlePatterns: ["**/*"],
    plugins: ["expo-secure-store"],
    extra: {
      STRAPI_URL: process.env.STRAPI_URL || "",
      STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || "",
      // Por defecto "mock": la app arranca con datos de prueba.
      // Cambia a "strapi" en tu .env cuando el backend esté listo.
      CONTENT_SOURCE: process.env.CONTENT_SOURCE || "mock",
      LOGIN_REFETCH_ALWAYS: process.env.LOGIN_REFETCH_ALWAYS || "true",
      LOGIN_STALE_HOURS: process.env.LOGIN_STALE_HOURS || "12",
    },
  },
};
