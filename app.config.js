// Configuración dinámica de Expo.
// Los secretos/llaves se leen de variables de entorno definidas en `.env`
// (gitignored) y NUNCA se commitean. Expo CLI carga `.env*` en process.env.
export default {
  expo: {
    name: "CodexReactNativeTest1",
    slug: "codexreactnativetest1",
    version: "1.0.0",
    orientation: "portrait",
    // Esquema de deep linking (necesario para el callback de OAuth de Google).
    scheme: "mindco",
    platforms: ["ios", "android", "web"],
    assetBundlePatterns: ["**/*"],
    plugins: [
      "expo-secure-store",
      "expo-web-browser",
      [
        "expo-image-picker",
        {
          photosPermission:
            "MindCo necesita acceso a tus fotos para que elijas tu foto de perfil.",
          cameraPermission:
            "MindCo necesita acceso a la cámara para que tomes tu foto de perfil.",
        },
      ],
    ],
    extra: {
      STRAPI_URL: process.env.STRAPI_URL || "",
      STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || "",
      // Por defecto "mock": la app arranca con datos de prueba.
      // Cambia a "strapi" en tu .env cuando el backend esté listo.
      CONTENT_SOURCE: process.env.CONTENT_SOURCE || "mock",
      LOGIN_REFETCH_ALWAYS: process.env.LOGIN_REFETCH_ALWAYS || "true",
      LOGIN_STALE_HOURS: process.env.LOGIN_STALE_HOURS || "12",
      // Caché/preview del contenido del CMS (ver .env.example).
      CONTENT_CACHE_HOURS: process.env.CONTENT_CACHE_HOURS || "6",
      CONTENT_PREVIEW_MODE: process.env.CONTENT_PREVIEW_MODE || "false",
      CONTENT_PREVIEW_STALE_SECONDS: process.env.CONTENT_PREVIEW_STALE_SECONDS || "30",
      // Supabase (Auth). La publishable/anon key es pública y segura en el cliente.
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
      // Bypass de auth SOLO para desarrollo (entra al Home sin login). Default off.
      DEV_SKIP_AUTH: process.env.DEV_SKIP_AUTH || "false",
    },
  },
};
