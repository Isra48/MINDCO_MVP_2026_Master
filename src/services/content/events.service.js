import { strapiApi } from "../api/strapiApi";
import { getStrapiUrl } from "../../config/env";
import { flattenEntity, flattenMedia, pickMediaUrl } from "../../lib/strapi/normalize";

const EVENTS_ENDPOINT = "/api/carrousels";

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

const fields = ["title", "link"];

export const getEvents = async (params = {}) => {
  const response = await strapiApi.get(EVENTS_ENDPOINT, {
    fields,
    ...basePopulate,
    ...params,
  });
  return (response?.data || []).map((event) => {
    const attributes = flattenEntity(event);
    const directImage =
      typeof attributes?.image === "string" ? attributes.image : null;
    const imageUrl = directImage || pickMediaUrl(flattenMedia(attributes?.image));

    return {
      id: String(attributes.id ?? event.id),
      name: attributes?.title || "",
      image: resolveAssetUrl(imageUrl),
      link: attributes?.link || "",
    };
  });
};
