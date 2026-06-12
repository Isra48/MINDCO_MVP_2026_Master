/**
 * Normaliza respuestas de Strapi v4 y v5.
 *
 * - v4: cada entidad viene como `{ id, attributes: { ...campos } }` y los media
 *   como `{ data: { attributes: { url, formats } } }`.
 * - v5: la entidad viene aplanada `{ id, documentId, ...campos }` y los media
 *   como `{ url, formats, ... }` (o un array si es múltiple).
 *
 * Estos helpers dejan ambos formatos en una sola forma plana para que los
 * mappers/servicios no tengan que saber la versión de Strapi.
 */

/** Aplana una entidad: v4 (`attributes`) -> plano, v5 -> tal cual. */
export const flattenEntity = (item) => {
  if (!item || typeof item !== "object") return {};
  if (item.attributes && typeof item.attributes === "object") {
    return { id: item.id, documentId: item.documentId, ...item.attributes };
  }
  return item;
};

/** Aplana una lista de entidades (`response.data`). */
export const flattenList = (data) =>
  (Array.isArray(data) ? data : []).map(flattenEntity);

/**
 * Normaliza un campo de media a `{ url, formats, mime, ... } | null`.
 * Soporta v4 (`{ data: {attributes} }` / `{ data: [..] }`) y v5 (`{url,..}` / `[..]`).
 */
export const flattenMedia = (media) => {
  if (!media) return null;
  let node = media;
  if (media.data !== undefined && media.data !== null) {
    node = Array.isArray(media.data) ? media.data[0] : media.data; // v4
  } else if (Array.isArray(media)) {
    node = media[0]; // v5 múltiple
  }
  if (!node) return null;
  const attrs = node.attributes || node; // v4: node.attributes · v5: plano
  return attrs && attrs.url ? attrs : null;
};

/** Elige la mejor URL disponible de un media ya normalizado. */
export const pickMediaUrl = (mediaAttrs) => {
  if (!mediaAttrs) return null;
  return (
    mediaAttrs?.formats?.medium?.url ||
    mediaAttrs?.formats?.small?.url ||
    mediaAttrs?.url ||
    null
  );
};
