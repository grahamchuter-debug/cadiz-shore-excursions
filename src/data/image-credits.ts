/**
 * World 2.0 image-credit registry (Corfu pattern).
 *
 * Customer-facing attribution is rendered by PhotoCredits. Add an entry
 * whenever a site image has a verified source page. Do not invent credits.
 */

export type ImageCredit = {
  /** Site image key (matches `public/images/{key}.jpg` and gallery imageKey). */
  imageKey: string;
  filename: string;
  workTitle: string;
  creator: string;
  sourcePlatform: string;
  sourceUrl: string;
  licence: string;
  licenceUrl: string | null;
  attributionRequired: boolean;
  shareAlike: boolean;
  modifications: string;
};

const PIPELINE_MODIFICATION =
  "Converted from the downloaded file to JPEG and resized by the site image pipeline. No creative crop.";

const PEXELS_LICENCE_URL = "https://www.pexels.com/license/";

function pexels(credit: Omit<ImageCredit, "licence" | "licenceUrl" | "attributionRequired" | "shareAlike" | "modifications" | "sourcePlatform">): ImageCredit {
  return {
    ...credit,
    sourcePlatform: "Pexels",
    licence: "Pexels Licence",
    licenceUrl: PEXELS_LICENCE_URL,
    attributionRequired: false,
    shareAlike: false,
    modifications: PIPELINE_MODIFICATION,
  };
}

export const IMAGE_CREDITS: Record<string, ImageCredit> = {
  "seville-plaza-espana-hero": pexels({
    imageKey: "seville-plaza-espana-hero",
    filename: "seville-plaza-espana-hero.jpg",
    workTitle: "Plaza de España, Seville",
    creator: "Maria Carmona",
    sourceUrl: "https://www.pexels.com/photo/plaza-de-espana-12200751/",
  }),
  "seville-plaza-espana-canal": pexels({
    imageKey: "seville-plaza-espana-canal",
    filename: "seville-plaza-espana-canal.jpg",
    workTitle: "Plaza de España, Seville",
    creator: "Maria Carmona",
    sourceUrl: "https://www.pexels.com/photo/plaza-de-espana-12200747/",
  }),
  "seville-old-town-street": pexels({
    imageKey: "seville-old-town-street",
    filename: "seville-old-town-street.jpg",
    workTitle: "Historic Seville street / old town",
    creator: "Sergei Gussev",
    sourceUrl: "https://www.pexels.com/photo/charming-alley-in-seville-s-historic-center-36122759/",
  }),
  "seville-street-cafe": pexels({
    imageKey: "seville-street-cafe",
    filename: "seville-street-cafe.jpg",
    workTitle: "Outdoor café / street scene, Seville",
    creator: "Zeynep Merve Kılıç Çakır",
    sourceUrl: "https://www.pexels.com/photo/charming-outdoor-cafe-in-seville-spain-32536990/",
  }),
  "seville-torre-del-oro": pexels({
    imageKey: "seville-torre-del-oro",
    filename: "seville-torre-del-oro.jpg",
    workTitle: "Torre del Oro, Seville",
    creator: "Emilio Sánchez Hernández",
    sourceUrl: "https://www.pexels.com/photo/the-torre-del-oro-the-tower-of-gold-seville-spain-13378555/",
  }),
  "seville-cathedral-giralda": pexels({
    imageKey: "seville-cathedral-giralda",
    filename: "seville-cathedral-giralda.jpg",
    workTitle: "Seville Cathedral and Giralda",
    creator: "Igor Passchier",
    sourceUrl: "https://www.pexels.com/photo/seville-cathedral-and-la-giralda-tower-scenic-view-37490976/",
  }),
  "seville-giralda-detail": pexels({
    imageKey: "seville-giralda-detail",
    filename: "seville-giralda-detail.jpg",
    workTitle: "Giralda, Seville",
    creator: "Timo Hillemeyer",
    sourceUrl: "https://www.pexels.com/photo/giralda-bell-tower-of-seville-cathedral-in-spain-19857617/",
  }),
  "seville-alcazar-hero": pexels({
    imageKey: "seville-alcazar-hero",
    filename: "seville-alcazar-hero.jpg",
    workTitle: "Real Alcázar, Seville",
    creator: "kdry yldz",
    sourceUrl: "https://www.pexels.com/photo/alcazar-in-seville-22064835/",
  }),
  "seville-alcazar-gardens": pexels({
    imageKey: "seville-alcazar-gardens",
    filename: "seville-alcazar-gardens.jpg",
    workTitle: "Real Alcázar Royal Gardens",
    creator: "José Maldonado Díaz",
    sourceUrl: "https://www.pexels.com/photo/alcazar-of-seville-s-historic-royal-gardens-36481634/",
  }),
  "seville-alcazar-garden-view": pexels({
    imageKey: "seville-alcazar-garden-view",
    filename: "seville-alcazar-garden-view.jpg",
    workTitle: "Real Alcázar garden / architecture",
    creator: "AXP Photography",
    sourceUrl: "https://www.pexels.com/photo/garden-in-seville-alcazar-16681095/",
  }),
  "cadiz-cathedral-waterfront": pexels({
    imageKey: "cadiz-cathedral-waterfront",
    filename: "cadiz-cathedral-waterfront.jpg",
    workTitle: "Cádiz Cathedral from waterfront / sea",
    creator: "Emilio Sánchez Hernández",
    sourceUrl: "https://www.pexels.com/photo/view-of-cadiz-cathedral-from-the-sea-37240602/",
  }),
  "cadiz-cathedral-coast": pexels({
    imageKey: "cadiz-cathedral-coast",
    filename: "cadiz-cathedral-coast.jpg",
    workTitle: "Cádiz Cathedral and coast",
    creator: "Emilio Sánchez Hernández",
    sourceUrl: "https://www.pexels.com/es-es/foto/catedral-de-cadiz-y-vista-costera-en-andalucia-37204217/",
  }),
  "andalusia-vejer-white-village": pexels({
    imageKey: "andalusia-vejer-white-village",
    filename: "andalusia-vejer-white-village.jpg",
    workTitle: "Vejer de la Frontera",
    creator: "Charlie Jordan",
    sourceUrl: "https://www.pexels.com/photo/charming-aerial-of-vejer-de-la-frontera-spain-35728939/",
  }),
  "andalusia-vejer-street": pexels({
    imageKey: "andalusia-vejer-street",
    filename: "andalusia-vejer-street.jpg",
    workTitle: "Vejer de la Frontera street / courtyard detail",
    creator: "Jocelyn Erskine-Kellie",
    sourceUrl: "https://www.pexels.com/photo/a-brown-wooden-door-near-the-green-plants-8317006/",
  }),
  "seville-flamenco": pexels({
    imageKey: "seville-flamenco",
    filename: "seville-flamenco.jpg",
    workTitle: "Flamenco performance, Plaza de España, Seville",
    creator: "Griselda Belba",
    sourceUrl: "https://www.pexels.com/photo/flamenco-dance-performance-at-plaza-de-espana-32012065/",
  }),
  "seville-tapas-bar": pexels({
    imageKey: "seville-tapas-bar",
    filename: "seville-tapas-bar.jpg",
    workTitle: "Traditional tapas bar, Seville",
    creator: "Daka",
    sourceUrl: "https://www.pexels.com/photo/atmospheric-spanish-tapas-bar-in-seville-37894572/",
  }),
};

export function getImageCredits(imageKeys: string[]): ImageCredit[] {
  const seen = new Set<string>();
  const credits: ImageCredit[] = [];
  for (const key of imageKeys) {
    const credit = IMAGE_CREDITS[key];
    if (!credit || seen.has(credit.imageKey)) continue;
    seen.add(credit.imageKey);
    credits.push(credit);
  }
  return credits;
}
