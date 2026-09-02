/**
 * World 2.0 commercial product-page content for Cádiz / Seville.
 *
 * Keep this data-driven so destinations share one page architecture.
 * Copy here is customer-facing editorial wording — not supplier paste.
 */

import { getBookableProduct, type BookableProduct } from "./bookable-products";

export type ProductGalleryImage = {
  imageKey: string;
  alt: string;
  /** Shot-list subject this asset is standing in for. */
  subject: string;
};

export type ProductItineraryStop = {
  number: string;
  title: string;
  body: string;
};

export type ProductValueBlock = {
  title: string;
  body: string;
  icon: "transfer" | "sunbed" | "umbrella" | "drink" | "time";
};

export type ProductFactItem = {
  label: string;
  value: string;
};

export type ProductNotice = {
  title: string;
  body: string;
};

export type ProductAuthorityLink = {
  label: string;
  href: string;
};

export type GuestReview = {
  rating: number;
  text: string;
  displayName: string;
  verified: boolean;
  photos?: string[];
};

export type ProductPageContent = {
  customerHeadline: string;
  proposition: string;
  quickFacts: string;
  durationLabel: string;
  activityLevel: string;
  departurePoint: string;
  whyWeChoseTitle: string;
  whyWeChose: string;
  itineraryTitle: string;
  itinerary: ProductItineraryStop[];
  valueBlocksTitle?: string;
  valueBlocks?: ProductValueBlock[];
  includedTitle: string;
  included: string[];
  notIncluded?: string[];
  practicalFacts: ProductFactItem[];
  accessibility: string[];
  whatToBring: string[];
  importantNotices: ProductNotice[];
  gallery: ProductGalleryImage[];
  /** Reserved for a future tour-preview clip. Never render a placeholder. */
  video?: { src: string; poster?: string } | null;
  authorityLinks: ProductAuthorityLink[];
  ctaMicrocopy: string;
  /** First-party reviews only. Empty array keeps the section hidden. */
  reviews: GuestReview[];
};

export type ProductExperience = BookableProduct & ProductPageContent;

const PAGES: Record<string, ProductPageContent> = {
  "seville-on-your-own": {
    customerHeadline: "Seville with time that is actually yours",
    proposition:
      "Return transport from the Cádiz cruise pier, a stop at Plaza de España, and around 3–4 hours to walk the historic centre your own way.",
    quickFacts: "≈8 hours · Cruise pier · Easy activity · ~3–4h free time in Seville",
    durationLabel: "Approximately 8 hours",
    activityLevel: "Easy",
    departurePoint: "Cruise ship pier",
    whyWeChoseTitle: "Why we chose this one",
    whyWeChose:
      "If you want Seville without a full guided circuit of tickets and queues, this is the day we'd pick for freedom and value. The coach solves the hard part — the long road from Cádiz and the return buffer to the ship — then leaves you roughly three to four hours to shape the centre yourself. Plaza de España is included as an organised stop; Cathedral and Real Alcázar tickets are not. That is deliberate: you pay for transport and timing confidence, not for monuments you may or may not want to enter.",
    itineraryTitle: "Your Seville day",
    itinerary: [
      {
        number: "01",
        title: "Meet at the cruise pier",
        body: "Join the excursion at the cruise ship pier in Cádiz. Expect a full port day — normally around eight hours door to door, sometimes closer to seven on shorter ship calls.",
      },
      {
        number: "02",
        title: "Cádiz to Seville — about 90 minutes",
        body: "The journey inland takes roughly an hour and a half each way. Use the coach time for orientation commentary; this is a long transfer, not a short hop from the pier.",
      },
      {
        number: "03",
        title: "Panoramic Seville & Plaza de España",
        body: "A scenic introduction covers highlights such as María Luisa Park, Triana, the Guadalquivir and the exterior of the Real Maestranza, with a stop at Plaza de España before free time begins.",
      },
      {
        number: "04",
        title: "Independent free time — about 3–4 hours",
        body: "Explore the historic centre at your pace. Possible independent stops include Santa Cruz, the Cathedral and Giralda, the Real Alcázar, the Archive of the Indies and the Golden Tower. Admissions during free time are not included.",
      },
      {
        number: "05",
        title: "Return to your ship",
        body: "Rejoin for the drive back, usually with a panoramic pass through Cádiz before the pier. The plan targets return at least about one hour before your ship's scheduled departure.",
      },
    ],
    includedTitle: "What's included",
    included: [
      "Round-trip transport from the cruise ship pier",
      "Guided commentary on the journey",
      "Panoramic Seville sightseeing and Plaza de España stop",
      "Approximately 3–4 hours independent free time in the historic centre",
      "Bottled water",
      "Return timing aimed at least about one hour before scheduled ship departure",
    ],
    notIncluded: [
      "Cathedral, Real Alcázar or other attraction admissions during free time",
      "Guided walking tour of the historic centre",
      "Food and drinks beyond bottled water",
    ],
    practicalFacts: [
      { label: "Duration", value: "Approximately 8 hours (may be ~7 hours on shorter calls)" },
      { label: "Leaves from", value: "Cruise ship pier" },
      { label: "Transfer", value: "About 90 minutes each way Cádiz ↔ Seville" },
      { label: "Seville free time", value: "Approximately 3–4 hours" },
      { label: "Group", value: "Standard excursion size" },
      { label: "Activity", value: "Easy" },
      { label: "Food & drink", value: "Bottled water included" },
    ],
    accessibility: [
      "Expect coach boarding and city walking during free time on uneven historic streets.",
      "Activity level is Easy overall, but independent exploration may involve cobbles, crowds and queues if you enter major monuments.",
    ],
    whatToBring: [
      "Comfortable walking shoes",
      "Sun protection and weather-appropriate clothing",
      "Ship departure time noted clearly",
      "Passport if you plan to visit the Real Alcázar independently during free time",
    ],
    importantNotices: [
      {
        title: "Honest timing from Cádiz",
        body: "Seville is not a short transfer. About 90 minutes each way means a large share of an eight-hour day is road time. What you buy here is reliable port logistics plus several hours of genuine free time in the city — not an all-day guided monument circuit.",
      },
      {
        title: "Admissions during free time",
        body: "Cathedral, Real Alcázar and other attraction tickets are not included. If you enter the Real Alcázar on your own, carry a valid passport — Spanish ticket systems often require ID matching the booking.",
      },
      {
        title: "Return buffer",
        body: "The excursion is planned to be back at the pier about one hour before your ship's scheduled departure. Stay with the stated meet time after free time; independent wandering past the coach departure is how port days go wrong.",
      },
    ],
    gallery: [
      {
        imageKey: "seville-plaza-espana-hero",
        alt: "Plaza de España in Seville",
        subject: "Plaza de España hero",
      },
      {
        imageKey: "seville-plaza-espana-canal",
        alt: "Canal and tiled balustrade at Plaza de España in Seville",
        subject: "Plaza de España second angle",
      },
      {
        imageKey: "seville-old-town-street",
        alt: "Narrow historic street in Seville's old town",
        subject: "Independent historic exploration",
      },
      {
        imageKey: "seville-street-cafe",
        alt: "Outdoor café under orange trees in Seville",
        subject: "Free time / café leisure",
      },
      {
        imageKey: "seville-cathedral-giralda",
        alt: "Seville Cathedral and the Giralda",
        subject: "Major Seville landmark",
      },
      {
        imageKey: "seville-torre-del-oro",
        alt: "Torre del Oro beside the Guadalquivir in Seville",
        subject: "Wider Seville / river landmark",
      },
    ],
    video: null,
    authorityLinks: [
      { label: "Seville from Cádiz cruise port", href: "/seville-from-cadiz-cruise-port" },
      { label: "One day in Cádiz from a cruise ship", href: "/one-day-in-cadiz-from-a-cruise-ship" },
      { label: "Cádiz cruise planner", href: "/cruise-planner" },
    ],
    ctaMicrocopy: "Share your cruise date and we'll check this Seville day for your call before you commit.",
    reviews: [],
  },
  "small-group-seville": {
    customerHeadline: "Seville's headline sights, organised",
    proposition:
      "A smaller group, guided Santa Cruz, and skip-the-line admission to the Cathedral and Real Alcázar — with return timing built for a Cádiz cruise call.",
    quickFacts: "≈8 hours · Max 20 per guide · Moderate · Cathedral & Alcázar included",
    durationLabel: "Approximately 8 hours",
    activityLevel: "Moderate",
    departurePoint: "Cruise ship pier",
    whyWeChoseTitle: "Why we chose this one",
    whyWeChose:
      "If you want Seville's two essential interiors without juggling tickets, queues and a DIY timetable after a long drive from Cádiz, this is the fuller day. The group stays smaller — maximum 20 guests per guide — with guided time in Santa Cruz, about an hour in the Cathedral and about an hour in the Real Alcázar. Free time shrinks to roughly one to two hours because the inclusions take priority. That trade-off is the point of Best Overall versus Best Value.",
    itineraryTitle: "Your Seville day",
    itinerary: [
      {
        number: "01",
        title: "Meet at the cruise pier",
        body: "Depart from the cruise ship pier in Cádiz for a full inland day — typically about eight hours, occasionally nearer seven when the ship call is shorter.",
      },
      {
        number: "02",
        title: "Cádiz to Seville — about 90 minutes",
        body: "Air-conditioned coach inland. The road time is real: plan on roughly ninety minutes each way before counting sightseeing.",
      },
      {
        number: "03",
        title: "Panoramic Seville & Plaza de España",
        body: "Orientation sightseeing typically includes Avenida de las Palmeras, the Golden Tower, Triana and Plaza de España before the guided historic-centre section.",
      },
      {
        number: "04",
        title: "Santa Cruz, Cathedral & Real Alcázar",
        body: "Guided walking in Santa Cruz, then skip-the-line admission for roughly an hour in Seville Cathedral and roughly an hour in the Real Alcázar — the day's organised centrepiece.",
      },
      {
        number: "05",
        title: "Free time, then return",
        body: "About 1–2 hours free time depending on the ship schedule, then the drive back with a panoramic Cádiz pass and a planned return about one hour before scheduled departure.",
      },
    ],
    includedTitle: "What's included",
    included: [
      "Small-group excursion — maximum 20 guests per official guide",
      "Air-conditioned round-trip transport from the cruise ship pier",
      "Panoramic Seville sightseeing including Plaza de España",
      "Guided visit in the Santa Cruz quarter",
      "Skip-the-line Seville Cathedral admission (~60-minute guided visit)",
      "Skip-the-line Real Alcázar admission (~60-minute visit)",
      "Approximately 1–2 hours free time (schedule dependent)",
      "Bottled water",
      "Return timing aimed at about one hour before scheduled ship departure",
    ],
    notIncluded: ["Food and drinks beyond bottled water", "Optional purchases during free time"],
    practicalFacts: [
      { label: "Duration", value: "Approximately 8 hours (may be ~7 hours on shorter calls)" },
      { label: "Leaves from", value: "Cruise ship pier" },
      { label: "Transfer", value: "About 90 minutes each way Cádiz ↔ Seville" },
      { label: "Group", value: "Maximum 20 guests per guide" },
      { label: "Free time", value: "Approximately 1–2 hours" },
      { label: "Activity", value: "Moderate" },
      { label: "Food & drink", value: "Bottled water included" },
    ],
    accessibility: [
      "Not a wheelchair-optimised day — expect coach steps, cobbles in Santa Cruz, and substantial walking inside the Cathedral and Alcázar.",
      "Moderate activity: standing time, uneven surfaces and indoor queues even with skip-the-line admission.",
    ],
    whatToBring: [
      "Valid passport for every guest (required on the tour)",
      "Comfortable walking shoes",
      "Sun protection and modest clothing suitable for a cathedral visit",
      "Ship departure time noted clearly",
    ],
    importantNotices: [
      {
        title: "Passport details required before booking",
        body: "Before you book, know that every guest must provide passport information: full name, passport number, date of birth and nationality. Each guest must also carry a valid passport on the tour. This is a supplier requirement for Cathedral and Real Alcázar admission — not optional paperwork.",
      },
      {
        title: "Skip-the-line admissions included",
        body: "Seville Cathedral and Real Alcázar admissions are included, with skip-the-line entry as stated by the supplier. That is the main difference from the Best Value free-time day, where those tickets are paid separately if you choose them.",
      },
      {
        title: "Honest timing from Cádiz",
        body: "About 90 minutes each way still applies. An eight-hour day leaves less free wandering than the Best Value option because Cathedral and Alcázar visits are built in. Choose this when guided inclusions matter more than maximum unstructured time.",
      },
      {
        title: "Return buffer",
        body: "Return is planned for about one hour before your ship's scheduled departure. Keep to the guide's meet times after free time.",
      },
    ],
    gallery: [
      {
        imageKey: "seville-alcazar-hero",
        alt: "Courtyard at the Real Alcázar of Seville",
        subject: "Real Alcázar hero",
      },
      {
        imageKey: "seville-alcazar-gardens",
        alt: "Palm trees and gardens at the Real Alcázar of Seville",
        subject: "Alcázar gardens",
      },
      {
        imageKey: "seville-alcazar-garden-view",
        alt: "Mercury Pond and gallery at the Real Alcázar of Seville",
        subject: "Alcázar architecture / garden",
      },
      {
        imageKey: "seville-cathedral-giralda",
        alt: "Seville Cathedral and the Giralda",
        subject: "Included Cathedral / Giralda",
      },
      {
        imageKey: "seville-giralda-detail",
        alt: "Upper stonework of the Giralda bell tower in Seville",
        subject: "Premium monument detail",
      },
      {
        imageKey: "seville-old-town-street",
        alt: "Narrow historic street in Seville's old town",
        subject: "Santa Cruz / historic-quarter atmosphere",
      },
      {
        imageKey: "seville-plaza-espana-hero",
        alt: "Plaza de España in Seville",
        subject: "Wider Seville itinerary",
      },
    ],
    video: null,
    authorityLinks: [
      { label: "Seville from Cádiz cruise port", href: "/seville-from-cadiz-cruise-port" },
      { label: "One day in Cádiz from a cruise ship", href: "/one-day-in-cadiz-from-a-cruise-ship" },
      { label: "Cádiz cruise planner", href: "/cruise-planner" },
    ],
    ctaMicrocopy:
      "Have passport details ready for every guest, then share your cruise date so we can check this excursion for your call.",
    reviews: [],
  },
};

export function getProductExperience(slug: string): ProductExperience | undefined {
  const product = getBookableProduct(slug);
  const page = PAGES[slug];
  if (!product || !page) return undefined;
  return { ...product, ...page };
}
