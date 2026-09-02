import { CADIZ_BOOKING_PRODUCTS, findCadizBookingProduct } from "@shared/destinations/cadiz-products";
import type { BookableProductConfig } from "@shared/world-booking/types";

export const BOOKING_CATALOGUE: readonly BookableProductConfig[] = CADIZ_BOOKING_PRODUCTS;

export function getBookingProduct(slugOrId: string): BookableProductConfig | undefined {
  return findCadizBookingProduct(slugOrId);
}

export function getRequestBookingSlugs(): string[] {
  return BOOKING_CATALOGUE.filter((item) => item.bookingMode === "request").map((item) => item.slug);
}

export const ALL_PENDING_COMMERCIAL_RULES = BOOKING_CATALOGUE.flatMap((item) =>
  item.pendingCommercialRules.map((rule) => ({ productId: item.id, rule })),
);
