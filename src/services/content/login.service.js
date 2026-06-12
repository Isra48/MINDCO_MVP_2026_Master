import { strapiApi } from "../api/strapiApi";
import { extractMediaFromAttributes } from "./media";
import { flattenEntity } from "../../lib/strapi/normalize";

const LOGIN_ENDPOINT = "/api/login";

// Soporta single type / collection en Strapi v4 (attributes) y v5 (plano).
const pickAttributes = (response) => {
  let payload = response?.data;
  if (Array.isArray(payload)) payload = payload[0];
  else if (payload?.data) {
    payload = Array.isArray(payload.data) ? payload.data[0] : payload.data;
  }
  return flattenEntity(payload);
};

export const getLoginContent = async (params = {}) => {
  const response = await strapiApi.get(LOGIN_ENDPOINT, {
    fields: ["title", "description"],
    populate: "*",
    ...params,
  });
  const attributes = pickAttributes(response);
  const backgroundMedia = extractMediaFromAttributes(attributes);

  return {
    title: attributes?.title || "",
    description: attributes?.description || "",
    backgroundMedia,
  };
};
