import { strapiApi } from "../api/strapiApi";
import { flattenList } from "../../lib/strapi/normalize";

const HOME_ENDPOINT = "/api/homes";

const fields = ["tituloCarrousel", "tituloDeListados"];

export const getHomeContent = async (params = {}) => {
  const response = await strapiApi.get(HOME_ENDPOINT, {
    fields,
    ...params,
  });
  const attributes = flattenList(response?.data)[0] || {};

  return {
    carouselTitle: attributes?.tituloCarrousel || "",
    listTitle: attributes?.tituloDeListados || "",
  };
};
