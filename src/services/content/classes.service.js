import { strapiApi } from "../api/strapiApi";
import { mapStrapiClassToAppModel } from "./mappers";
import { flattenEntity } from "../../lib/strapi/normalize";

const CLASSES_ENDPOINT = "/api/classes";

const basePopulate = {
  populate: {
    image: {
      fields: ["url", "formats"],
    },
  },
};

const fields = [
  "title",
  "description",
  "startAt",
  "endAt",
  "timezone",
  "category",
  "instructor",
  "modality",
  "materials",
  "isActive",
];

const buildFilters = ({ upcomingOnly }) => {
  if (!upcomingOnly) return undefined;
  const nowIso = new Date().toISOString();
  return {
    filters: {
      startAt: {
        $gte: nowIso,
      },
    },
  };
};

export const getClasses = async ({ upcomingOnly, limit } = {}) => {
  const filters = buildFilters({ upcomingOnly });
  const pagination = limit ? { pagination: { limit } } : undefined;
  const response = await strapiApi.get(CLASSES_ENDPOINT, {
    fields,
    ...basePopulate,
    ...filters,
    ...pagination,
    sort: ["startAt:asc"],
  });

  return (response?.data || []).map((item) => {
    const entity = flattenEntity(item);
    return mapStrapiClassToAppModel(entity, entity.id ?? item.id);
  });
};

export const getClassById = async (id) => {
  if (!id) return null;
  const response = await strapiApi.get(`${CLASSES_ENDPOINT}/${id}`, {
    fields,
    ...basePopulate,
  });
  const entity = flattenEntity(response?.data);
  if (!entity || (!entity.title && entity.id === undefined)) return null;
  return mapStrapiClassToAppModel(entity, entity.id ?? response?.data?.id);
};
