export interface SiteImage {
  src: string;
  alt: string;
  /** Filename stem under /images (no extension). Used by responsive/preload helpers. */
  base?: string;
  /** Optional object-position for hero/card crops (portrait sources in landscape frames). */
  objectPosition?: string;
}

const B = "/images";

function img(base: string, alt: string, objectPosition?: string): SiteImage {
  return { base, src: `${B}/${base}.jpg`, alt, objectPosition };
}

/**
 * Approved World 2.0 commercial pack (Pexels — see image-credits.ts).
 * Do not reintroduce legacy unknown-provenance keys for public pages.
 */
export const siteImages = {
  hero: img(
    "cadiz-cathedral-waterfront",
    "Cádiz Cathedral on the waterfront",
    "center 40%",
  ),
  ogDefault: img(
    "cadiz-cathedral-coast",
    "Cádiz Cathedral and the Andalusian coast",
  ),
  logo: {
    src: `${B}/logo-mark.svg`,
    alt: "Cadiz Shore Excursions",
  },
  /** Editorial Cádiz city — not a cruise-pier photograph. */
  port: img(
    "cadiz-cathedral-coast",
    "Cádiz Cathedral and waterfront skyline",
    "center 45%",
  ),
} as const;

export const subjectImages: Record<string, SiteImage> = {
  "seville-plaza-espana-hero": img(
    "seville-plaza-espana-hero",
    "Plaza de España in Seville",
    "center 35%",
  ),
  "seville-plaza-espana-canal": img(
    "seville-plaza-espana-canal",
    "Canal and tiled balustrade at Plaza de España in Seville",
    "center 40%",
  ),
  "seville-old-town-street": img(
    "seville-old-town-street",
    "Narrow historic street in Seville's old town",
    "center center",
  ),
  "seville-street-cafe": img(
    "seville-street-cafe",
    "Outdoor café under orange trees in Seville",
    "center 30%",
  ),
  "seville-torre-del-oro": img(
    "seville-torre-del-oro",
    "Torre del Oro beside the Guadalquivir in Seville",
    "center 30%",
  ),
  "seville-cathedral-giralda": img(
    "seville-cathedral-giralda",
    "Seville Cathedral and the Giralda",
    "center 35%",
  ),
  "seville-giralda-detail": img(
    "seville-giralda-detail",
    "Upper stonework of the Giralda bell tower in Seville",
    "center 25%",
  ),
  "seville-alcazar-hero": img(
    "seville-alcazar-hero",
    "Courtyard at the Real Alcázar of Seville",
    "center 40%",
  ),
  "seville-alcazar-gardens": img(
    "seville-alcazar-gardens",
    "Palm trees and gardens at the Real Alcázar of Seville",
    "center 40%",
  ),
  "seville-alcazar-garden-view": img(
    "seville-alcazar-garden-view",
    "Mercury Pond and gallery at the Real Alcázar of Seville",
    "center 45%",
  ),
  "cadiz-cathedral-waterfront": img(
    "cadiz-cathedral-waterfront",
    "Cádiz Cathedral on the waterfront",
    "center 40%",
  ),
  "cadiz-cathedral-coast": img(
    "cadiz-cathedral-coast",
    "Cádiz Cathedral and the coast",
    "center 40%",
  ),
  "andalusia-vejer-white-village": img(
    "andalusia-vejer-white-village",
    "Whitewashed buildings in Vejer de la Frontera",
    "center 35%",
  ),
  "andalusia-vejer-street": img(
    "andalusia-vejer-street",
    "Flower-lined whitewashed doorway in Vejer de la Frontera",
    "center 40%",
  ),
  "seville-flamenco": img(
    "seville-flamenco",
    "Flamenco performance under the arches of Plaza de España in Seville",
    "center 40%",
  ),
  "seville-tapas-bar": img(
    "seville-tapas-bar",
    "Traditional tapas bar interior in Seville",
    "center 40%",
  ),
};

function pick(key: string): SiteImage {
  return subjectImages[key] ?? siteImages.ogDefault;
}

const excursionImageKeys: Record<string, string> = {
  "seville-on-your-own": "seville-plaza-espana-hero",
  "small-group-seville": "seville-alcazar-hero",
  "seville-highlights": "seville-plaza-espana-canal",
  "seville-cathedral-and-alcazar": "seville-cathedral-giralda",
  "cadiz-walking-tour": "cadiz-cathedral-coast",
  /** Jerez bodega image not yet sourced — Cádiz gateway context only. */
  "jerez-and-sherry-experience": "cadiz-cathedral-waterfront",
  "white-villages-tour": "andalusia-vejer-white-village",
  "andalusian-food-experience": "seville-tapas-bar",
  "flamenco-experience": "seville-flamenco",
  "cadiz-highlights": "cadiz-cathedral-waterfront",
  "private-andalusia-shore-excursion": "andalusia-vejer-white-village",
  "small-group-seville-tour": "seville-alcazar-gardens",
};

const excursionAltOverrides: Record<string, string> = {
  "jerez-and-sherry-experience":
    "Cádiz waterfront — gateway for inland Andalusian days including Jerez",
  "sherry-bodegas-tour":
    "Cádiz waterfront — gateway for inland Andalusian days including Jerez",
  "la-caleta-beach-from-cruise-port": "Cádiz Cathedral and the Atlantic coast near the old town",
};

export function getExcursionImage(slug: string): SiteImage {
  const image = pick(excursionImageKeys[slug] ?? "cadiz-cathedral-coast");
  const alt = excursionAltOverrides[slug];
  return alt ? { ...image, alt } : image;
}

export const excursionsHubImage = pick("seville-plaza-espana-hero");

const attractionImageKeys: Record<string, string> = {
  "seville-from-cadiz-cruise-port": "seville-plaza-espana-hero",
  "la-caleta-beach-from-cruise-port": "cadiz-cathedral-coast",
  "jerez-from-cadiz-cruise-port": "cadiz-cathedral-waterfront",
};

export function getAttractionImage(slug: string): SiteImage {
  return pick(attractionImageKeys[slug] ?? "cadiz-cathedral-coast");
}

const guideImageKeys: Record<string, string> = {
  "cadiz-old-town-walking-guide": "cadiz-cathedral-coast",
  "cadiz-cathedral-guide": "cadiz-cathedral-waterfront",
  "best-things-to-do-in-cadiz-from-a-cruise-ship": "cadiz-cathedral-waterfront",
  "one-day-in-cadiz-from-a-cruise-ship": "cadiz-cathedral-coast",
  "sherry-bodegas-tour": "cadiz-cathedral-waterfront",
  "white-villages-from-cadiz": "andalusia-vejer-white-village",
  "vejer-de-la-frontera-guide": "andalusia-vejer-street",
  "andalusian-food-guide": "seville-tapas-bar",
  "flamenco-experiences-from-cadiz": "seville-flamenco",
  "cadiz-markets-and-tapas-guide": "seville-tapas-bar",
  "independent-vs-cruise-line-excursions": "cadiz-cathedral-coast",
  "best-cadiz-excursions-for-first-time-visitors": "cadiz-cathedral-waterfront",
  "best-cadiz-excursions-for-repeat-visitors": "andalusia-vejer-white-village",
  "best-cadiz-excursions-for-food-and-wine-lovers": "seville-tapas-bar",
  "best-cadiz-excursions-for-history-lovers": "cadiz-cathedral-waterfront",
};

/**
 * Resolve a subject key (e.g. seville-plaza-espana-hero) or a guide slug.
 * Product galleries pass subject keys; GuideArticle may pass page slugs.
 */
export function getGuideImage(key: string): SiteImage {
  if (subjectImages[key]) return subjectImages[key];
  const mapped = guideImageKeys[key];
  return pick(mapped ?? key);
}
