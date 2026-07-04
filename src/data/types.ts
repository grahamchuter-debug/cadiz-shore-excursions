export interface FAQ {
  question: string;
  answer: string;
}

export type Pace = "Relaxed" | "Moderate" | "Active";

export interface ExcursionPage {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  category: string;
  tagline: string;
  duration: string;
  pace: Pace;
  bestFor: string;
  overview: string;
  body: string[];
  highlights: string[];
  included: string[];
  portLogistics: string;
  tips: string[];
  faqs: FAQ[];
  relatedExcursionSlugs: string[];
  featured?: boolean;
  availability?: "coming-soon" | "register-interest" | "available";
}

export interface TransferOption {
  name: string;
  description: string;
  duration: string;
  priceEstimate: string;
  bestFor: string;
}

export interface TransferPage {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  category: string;
  tagline: string;
  overview: string;
  body: string[];
  options: TransferOption[];
  timing: string[];
  tips: string[];
  faqs: FAQ[];
  relatedTransferSlugs: string[];
  featured?: boolean;
}

export interface HotelArea {
  name: string;
  description: string;
  bestFor: string;
}

export interface HotelPick {
  name: string;
  description: string;
  distance: string;
}

export interface HotelPage {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  category: string;
  tagline: string;
  overview: string;
  body: string[];
  areas: HotelArea[];
  picks: HotelPick[];
  tips: string[];
  faqs: FAQ[];
  relatedHotelSlugs: string[];
  featured?: boolean;
}

export interface GettingThereStep {
  method: string;
  detail: string;
  time: string;
  cost: string;
}

export interface AttractionPage {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  attractionName: string;
  tagline: string;
  overview: string;
  body: string[];
  distanceFromPort: string;
  travelTime: string;
  timeNeeded: string;
  gettingThere: GettingThereStep[];
  highlights: string[];
  tips: string[];
  faqs: FAQ[];
  relatedAttractionSlugs: string[];
  relatedExcursionSlug?: string;
}

export interface ScheduleEntry {
  date: string;
  ship: string;
  cruiseLine: string;
  arrival: string;
  departure: string;
  timeInPort?: string;
  terminal?: string;
  callType?: string;
  notes?: string;
}

export interface ShipSchedulePort {
  slug: string;
  name: string;
  country: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
  intro: string;
  scheduleOverview: string;
  planningTips?: string[];
  faqs?: FAQ[];
}

export interface VisitorType {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  cta: string;
}

export interface GuideRecommendation {
  title: string;
  description: string;
  excursionSlug?: string;
  guideSlug?: string;
  bestFor?: string;
}

export interface GuidePage {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  eyebrow: string;
  tagline: string;
  overview: string;
  body: string[];
  sections?: { heading: string; paragraphs: string[] }[];
  highlights?: string[];
  tips?: string[];
  recommendations?: GuideRecommendation[];
  faqs: FAQ[];
  relatedGuideSlugs: string[];
  relatedExcursionSlugs?: string[];
  imageKey?: string;
}
