import { strapiApi } from "../api/strapiApi";
import { flattenEntity } from "../../lib/strapi/normalize";

// Single type en Strapi para el reto del mes. Ajustar el slug al definir la colección.
const CHALLENGE_ENDPOINT = "/api/reto-del-mes";

const fields = ["badge", "icon", "title", "progressLabel", "url", "active"];

export const getMonthlyChallenge = async (params = {}) => {
  const response = await strapiApi.get(CHALLENGE_ENDPOINT, {
    fields,
    ...params,
  });

  const attributes = flattenEntity(response?.data);
  if (!attributes) return null;

  return {
    id: String(attributes.id ?? "challenge"),
    active: attributes?.active !== false,
    badge: attributes?.badge || "Challenge del mes",
    icon: attributes?.icon || "target",
    title: attributes?.title || "",
    progressLabel: attributes?.progressLabel || "",
    url: attributes?.url || "",
  };
};
