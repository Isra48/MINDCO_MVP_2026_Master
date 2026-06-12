import { strapiApi } from "../api/strapiApi";
import { getStrapiUrl } from "../../config/env";
import { flattenEntity, flattenMedia, pickMediaUrl } from "../../lib/strapi/normalize";

// Single type en Strapi para el reto del mes. Ajustar el slug al definir la colección.
const CHALLENGE_ENDPOINT = "/api/reto-del-mes";

const resolveAssetUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const baseUrl = getStrapiUrl();
  if (!baseUrl) return url;
  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${trimmedBase}${path}`;
};

const basePopulate = {
  populate: {
    image: {
      fields: ["url", "formats"],
    },
  },
};

const fields = ["badge", "emoji", "title", "subtitle", "url", "active"];

export const getMonthlyChallenge = async (params = {}) => {
  const response = await strapiApi.get(CHALLENGE_ENDPOINT, {
    fields,
    ...basePopulate,
    ...params,
  });

  const attributes = flattenEntity(response?.data);
  if (!attributes) return null;

  const directImage =
    typeof attributes?.image === "string" ? attributes.image : null;
  const imageUrl = directImage || pickMediaUrl(flattenMedia(attributes?.image));

  return {
    id: String(attributes.id ?? "challenge"),
    active: attributes?.active !== false,
    badge: attributes?.badge || "Challenge del mes",
    emoji: attributes?.emoji || "🔥",
    title: attributes?.title || "",
    subtitle: attributes?.subtitle || "",
    image: resolveAssetUrl(imageUrl),
    url: attributes?.url || "",
  };
};
