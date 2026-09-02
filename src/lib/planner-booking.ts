import type { BookableProduct } from "@/data/bookable-products";

export function buildPlannerBookingHref(
  product: BookableProduct,
  guests: { adults: number; children: number },
): string {
  const base = product.bookingPath ?? `/book/${product.slug}`;
  const params = new URLSearchParams();
  if (guests.adults > 0) params.set("adults", String(guests.adults));
  if (guests.children > 0) params.set("children", String(guests.children));
  params.set("from", "planner");
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
