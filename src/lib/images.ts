export interface SiteImage {
  src: string;
  alt: string;
}

const B = "/images";

export const siteImages = {
  hero: {
    src: `${B}/hero-home.jpg`,
    alt: "Cadiz cathedral and Atlantic waterfront above the cruise port",
  },
  ogDefault: {
    src: `${B}/og-default.jpg`,
    alt: "Cadiz cruise planning — cathedral, waterfront and Andalusian coastline",
  },
  logo: {
    src: `${B}/logo-mark.svg`,
    alt: "Cadiz Shore Excursions",
  },
  port: {
    src: `${B}/cruise-port.jpg`,
    alt: "Cruise ships berthed at the Cadiz cruise terminal on the waterfront",
  },
} as const;

export const subjectImages: Record<string, SiteImage> = {
  seville: { src: `${B}/seville.jpg`, alt: "Plaza de España and Seville's historic centre" },
  "old-town": { src: `${B}/old-town.jpg`, alt: "Narrow streets and plazas in Cadiz old town" },
  cathedral: { src: `${B}/cathedral.jpg`, alt: "Cadiz cathedral and golden dome above the Atlantic" },
  "la-caleta": { src: `${B}/la-caleta.jpg`, alt: "La Caleta beach and castle walls in Cadiz" },
  sherry: { src: `${B}/sherry.jpg`, alt: "Sherry bodega barrels in Jerez de la Frontera" },
  "white-villages": { src: `${B}/white-villages.jpg`, alt: "Whitewashed hill town in Andalusia's White Villages" },
  vejer: { src: `${B}/vejer.jpg`, alt: "Vejer de la Frontera perched above the Andalusian coast" },
  tapas: { src: `${B}/tapas.jpg`, alt: "Andalusian tapas and fresh seafood in Cadiz" },
  markets: { src: `${B}/markets.jpg`, alt: "Cadiz central market and local produce stalls" },
  flamenco: { src: `${B}/flamenco.jpg`, alt: "Flamenco performance in Andalusia" },
  "city-highlights": { src: `${B}/city-highlights.jpg`, alt: "Cadiz waterfront promenade and Atlantic views" },
  "private-tour": { src: `${B}/private-tour.jpg`, alt: "Private guided tour exploring Andalusia from Cadiz" },
  family: { src: `${B}/family.jpg`, alt: "Family-friendly Cadiz sights and open spaces" },
  planner: { src: `${B}/city-highlights.jpg`, alt: "Planning a Cadiz cruise day in Andalusia" },
};

function pick(key: string): SiteImage {
  return subjectImages[key] ?? siteImages.ogDefault;
}

const excursionImageKeys: Record<string, string> = {
  "seville-highlights": "seville",
  "seville-cathedral-and-alcazar": "seville",
  "cadiz-walking-tour": "old-town",
  "jerez-and-sherry-experience": "sherry",
  "white-villages-tour": "white-villages",
  "andalusian-food-experience": "tapas",
  "flamenco-experience": "flamenco",
  "cadiz-highlights": "city-highlights",
  "private-andalusia-shore-excursion": "private-tour",
  "small-group-seville-tour": "seville",
};

export function getExcursionImage(slug: string): SiteImage {
  return pick(excursionImageKeys[slug] ?? "city-highlights");
}

export const excursionsHubImage = pick("seville");

const attractionImageKeys: Record<string, string> = {
  "seville-from-cadiz-cruise-port": "seville",
  "la-caleta-beach-from-cruise-port": "la-caleta",
  "jerez-from-cadiz-cruise-port": "sherry",
};

export function getAttractionImage(slug: string): SiteImage {
  return pick(attractionImageKeys[slug] ?? "city-highlights");
}

const guideImageKeys: Record<string, string> = {
  "cadiz-old-town-walking-guide": "old-town",
  "cadiz-cathedral-guide": "cathedral",
  "best-things-to-do-in-cadiz-from-a-cruise-ship": "city-highlights",
  "one-day-in-cadiz-from-a-cruise-ship": "city-highlights",
  "sherry-bodegas-tour": "sherry",
  "white-villages-from-cadiz": "white-villages",
  "vejer-de-la-frontera-guide": "vejer",
  "andalusian-food-guide": "tapas",
  "flamenco-experiences-from-cadiz": "flamenco",
  "cadiz-markets-and-tapas-guide": "markets",
  "independent-vs-cruise-line-excursions": "private-tour",
  "best-cadiz-excursions-for-first-time-visitors": "city-highlights",
  "best-cadiz-excursions-for-repeat-visitors": "white-villages",
  "best-cadiz-excursions-for-food-and-wine-lovers": "tapas",
  "best-cadiz-excursions-for-history-lovers": "cathedral",
};

export function getGuideImage(slug: string): SiteImage {
  const key = guideImageKeys[slug] ?? "city-highlights";
  return pick(key);
}
