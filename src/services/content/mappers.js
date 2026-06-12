import {
  formatDateLabel,
  formatTimeLabel,
  normalizeDateValue,
} from "../../utils/dateFormatting";
import { getStrapiUrl } from "../../config/env";
import { flattenMedia, pickMediaUrl } from "../../lib/strapi/normalize";

const DEFAULT_TIMEZONE = "America/Mexico_City";

const resolveAssetUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const baseUrl = getStrapiUrl();
  if (!baseUrl) return url;
  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${trimmedBase}${path}`;
};

/**
 * Extrae texto plano desde Rich Text de Strapi
 * @param {string | Array} value
 * @returns {string}
 */
const extractTextFromRichText = (value) => {
  if (!value) return "";

  // Si ya es string (por compatibilidad futura)
  if (typeof value === "string") return value;

  // Rich text (array de bloques)
  if (Array.isArray(value)) {
    return value
      .map(
        (block) =>
          block?.children?.map((child) => child.text).join("") || ""
      )
      .join("\n");
  }

  return "";
};

/**
 * Mapea una clase de Strapi al modelo interno de la app
 * @param {Object} attributes
 * @param {string|number} id
 * @returns {Object}
 */
export const mapStrapiClassToAppModel = (attributes = {}, id) => {
  const startAtISO = normalizeDateValue(
    attributes.startAt ||
      attributes.start_date ||
      attributes.startDateTime
  );

  const endAtISO = normalizeDateValue(
    attributes.endAt ||
      attributes.end_date ||
      attributes.endDateTime
  );

  const durationMinutes = (() => {
    if (typeof attributes.durationMinutes === "number") {
      return attributes.durationMinutes;
    }
    if (typeof attributes.duration === "number") {
      return attributes.duration;
    }
    if (startAtISO && endAtISO) {
      const diffMs = new Date(endAtISO) - new Date(startAtISO);
      if (!Number.isNaN(diffMs) && diffMs > 0) {
        return Math.round(diffMs / 60000);
      }
    }
    return undefined;
  })();

  const timezone = attributes.timezone || DEFAULT_TIMEZONE;

  const dateLabel = startAtISO
    ? formatDateLabel(startAtISO, timezone)
    : "";

  const timeLabel = startAtISO
    ? formatTimeLabel(startAtISO, timezone)
    : "";

  // Imagen: soporta media de Strapi v4 y v5 (ver lib/strapi/normalize).
  const imageUrl = pickMediaUrl(flattenMedia(attributes?.image));

  const instructorName =
    attributes?.instructor?.data?.attributes?.name ||
    attributes?.instructor?.name ||
    (typeof attributes.instructor === "string" ? attributes.instructor : "") ||
    "";

  return {
    id: String(id ?? attributes.id ?? ""),
    title: attributes.title || "",
    description: extractTextFromRichText(attributes.description),
    category: attributes.category || "",
    instructor: instructorName,
    date: dateLabel,
    time: timeLabel,
    modality: attributes.modality || "",
    materials: attributes.materials || "",
    startDateTime: startAtISO || "",
    endDateTime: endAtISO || null,
    timezone,
    zoomLink: attributes.zoomLink || attributes.zoom_link || attributes.link || attributes.zoomUrl || "",
    durationMinutes,
    isFeatured: Boolean(attributes.isFeatured),
    image: resolveAssetUrl(imageUrl),
  };
};
