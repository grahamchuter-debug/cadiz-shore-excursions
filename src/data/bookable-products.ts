/**
 * Phase-one bookable products for Cádiz / Seville.
 *
 * Only these two receive top-level monetisation. Do not add the full
 * Shore Excursions Group catalogue here.
 *
 * Prices: verified EUR selling prices in CADIZ_PRODUCT_PRICES.
 * Customer-facing UI omits a price rather than inventing one.
 */

import type { DestinationCurrencyCode } from "@/lib/commerce/currency";
import { SITE_CURRENCY } from "@/lib/commerce/currency";
import type { BookingStatus } from "@/lib/booking-status";
import type { BookingMode } from "@shared/world-booking";

export type ProductBadgeKind = "editors-choice" | "beach-favourite" | "best-value" | "best-overall";

export type BookableProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  badge: string;
  badgeKind: ProductBadgeKind;
  positioning: string;
  benefit: string;
  path: string;
  ctaLabel: string;
  imageKey: string;
  imageAlt: string;
  priceAmount: number | null;
  priceCurrency: DestinationCurrencyCode;
  bookingStatus: BookingStatus;
  bookingMode: BookingMode;
  bookingPath?: string;
  supplierName: string;
  supplierProductName: string;
  supplierUrl: string;
};

/**
 * Verified Euro selling prices. Do not FX-convert a USD catalogue price.
 */
export const CADIZ_PRODUCT_PRICES: Record<string, number | null> = {
  "seville-on-your-own": 88,
  "small-group-seville": 229,
};

export const BOOKABLE_PRODUCTS: readonly BookableProduct[] = [
  {
    id: "best-value",
    slug: "seville-on-your-own",
    name: "Seville On Your Own — Plaza de España & Free Time",
    shortName: "Best Value",
    badge: "BEST VALUE",
    badgeKind: "best-value",
    positioning: "Freedom and value for independent travellers who want Seville on their own terms.",
    benefit:
      "A flexible Seville day — return transport from the ship, Plaza de España, and around 3–4 hours free in the historic centre.",
    path: "/shore-excursions/seville-on-your-own",
    ctaLabel: "View excursion",
    imageKey: "seville-plaza-espana-hero",
    imageAlt: "Plaza de España in Seville",
    priceAmount: CADIZ_PRODUCT_PRICES["seville-on-your-own"],
    priceCurrency: SITE_CURRENCY,
    bookingStatus: "live",
    bookingMode: "request",
    bookingPath: "/book/seville-on-your-own",
    supplierName: "Shore Excursions Group",
    supplierProductName: "Seville Shuttle from Cadiz with Plaza Espana and Free Time",
    supplierUrl: "https://www.shoreexcursionsgroup.com/",
  },
  {
    id: "best-overall",
    slug: "small-group-seville",
    name: "Small-Group Seville — Cathedral & Real Alcázar",
    shortName: "Best Overall",
    badge: "BEST OVERALL",
    badgeKind: "best-overall",
    positioning: "Guided Seville with the headline monuments included — for travellers who want the day organised.",
    benefit:
      "A smaller group, guided historic centre, and skip-the-line admission to the Cathedral and Real Alcázar.",
    path: "/shore-excursions/small-group-seville",
    ctaLabel: "View excursion",
    imageKey: "seville-alcazar-hero",
    imageAlt: "Courtyard at the Real Alcázar of Seville",
    priceAmount: CADIZ_PRODUCT_PRICES["small-group-seville"],
    priceCurrency: SITE_CURRENCY,
    bookingStatus: "live",
    bookingMode: "request",
    bookingPath: "/book/small-group-seville",
    supplierName: "Shore Excursions Group",
    supplierProductName: "Wonders of Seville",
    supplierUrl: "https://www.shoreexcursionsgroup.com/",
  },
];

export function getBookableProduct(slugOrId: string): BookableProduct | undefined {
  const key = slugOrId.trim();
  return BOOKABLE_PRODUCTS.find((p) => p.slug === key || p.id === key);
}

export function getPriorityProducts(): readonly BookableProduct[] {
  return BOOKABLE_PRODUCTS;
}

export function isPriorityProductSlug(slug: string): boolean {
  return BOOKABLE_PRODUCTS.some((p) => p.slug === slug);
}
