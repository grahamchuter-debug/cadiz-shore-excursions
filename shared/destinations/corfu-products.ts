import { corfuBookingCore } from "./corfu";
import type { AgeBand, BookableProductConfig, ProductCapacity, ProductPricing } from "../world-booking/types";

/**
 * V1 operational routing: Wow A Tour booking mailbox, not the local operator.
 * Kept product-configurable so a later supplier can use a different address.
 */
const OPERATIONS = {
  id: "wow-a-tour-operations",
  displayName: "Wow A Tour",
  notificationEmail: "info@wowatour.com",
  routingStatus: "production_ready",
} as const;

const REQUEST_SETTLEMENT = "charge_refund" as const;

/**
 * Approved Corfu trial online party cap — configured per product, not a
 * global engine ceiling.
 */
const CORFU_TRIAL_CAPACITY: ProductCapacity = {
  minGuests: 1,
  maxGuestsPerBooking: 8,
  maxGuestsPerBookingSource: "approved",
  supplierGroupSize: null,
  maxGuestsPerGuide: null,
};

/**
 * Age-band metadata is retained on the product so the reusable engine can
 * still render adult/child/infant selectors for other destinations.
 * Corfu trial checkout uses `pricing.model: flat_per_guest` and a single
 * guest quantity — these bands are not shown to customers.
 */
const CORFU_AGE_BANDS: readonly AgeBand[] = [
  { id: "adult", label: "Adults", minAge: null, maxAge: null, pricingStatus: "priced" },
  { id: "child", label: "Children", minAge: null, maxAge: null, pricingStatus: "priced" },
  { id: "infant", label: "Infants", minAge: null, maxAge: null, pricingStatus: "priced" },
];

function flatPerGuest(pricePerGuest: number): ProductPricing {
  return {
    model: "flat_per_guest",
    currency: "EUR",
    pricePerGuest,
    adultAmount: pricePerGuest,
    childAmount: pricePerGuest,
    childPricingStatus: "priced",
    infantAmount: pricePerGuest,
    infantPricingStatus: "priced",
    pricingNeedsConfirmation: false,
  };
}

const SHARED_PENDING = [
  "Operational requests go to Wow A Tour. Wow A Tour confirms availability with the local supplier.",
] as const;

const GLYFADA_SUPPLIER_NOTES = [
  "Not part of current selling rules: supplier information previously indicated ages 4 and under may be free. The Corfu trial charges every guest the same per-person selling price.",
] as const;

export const CORFU_BOOKING_PRODUCTS: readonly BookableProductConfig[] = [
  {
    id: "corfu-highlights",
    destinationId: corfuBookingCore.id,
    slug: "corfu-highlights",
    name: "Paleokastritsa, Mon Repos & Corfu Town",
    durationLabel: "5 hours",
    bookingMode: "request",
    availability: "live",
    bookingPath: "/book/corfu-highlights",
    receivedPath: "/book/corfu-highlights/received",
    confirmedPath: "/book/corfu-highlights/received",
    productPath: "/shore-excursions/corfu-highlights",
    pricing: flatPerGuest(143),
    ageBands: CORFU_AGE_BANDS,
    capacity: CORFU_TRIAL_CAPACITY,
    requiredCustomerFields: ["name", "email", "phone"],
    supplier: OPERATIONS,
    paymentSettlement: REQUEST_SETTLEMENT,
    schedulePortSlug: "corfu",
    pendingCommercialRules: [...SHARED_PENDING],
  },
  {
    id: "glyfada-beach-escape",
    destinationId: corfuBookingCore.id,
    slug: "glyfada-beach-escape",
    name: "Glyfada Beach Escape",
    durationLabel: "4 hours 30 minutes",
    bookingMode: "request",
    availability: "live",
    bookingPath: "/book/glyfada-beach-escape",
    receivedPath: "/book/glyfada-beach-escape/received",
    confirmedPath: "/book/glyfada-beach-escape/received",
    productPath: "/shore-excursions/glyfada-beach-escape",
    pricing: flatPerGuest(134),
    ageBands: CORFU_AGE_BANDS,
    capacity: CORFU_TRIAL_CAPACITY,
    requiredCustomerFields: ["name", "email", "phone"],
    supplier: OPERATIONS,
    paymentSettlement: REQUEST_SETTLEMENT,
    schedulePortSlug: "corfu",
    pendingCommercialRules: [...SHARED_PENDING],
    supplierReferenceNotes: GLYFADA_SUPPLIER_NOTES,
  },
  {
    id: "corfu-past-and-present",
    destinationId: corfuBookingCore.id,
    slug: "corfu-past-and-present",
    name: "Corfu Past & Present",
    durationLabel: "4 hours 30 minutes",
    bookingMode: "request",
    availability: "live",
    bookingPath: "/book/corfu-past-and-present",
    receivedPath: "/book/corfu-past-and-present/received",
    confirmedPath: "/book/corfu-past-and-present/received",
    productPath: "/shore-excursions/corfu-past-and-present",
    pricing: flatPerGuest(75),
    ageBands: CORFU_AGE_BANDS,
    capacity: CORFU_TRIAL_CAPACITY,
    requiredCustomerFields: ["name", "email", "phone"],
    supplier: OPERATIONS,
    paymentSettlement: REQUEST_SETTLEMENT,
    schedulePortSlug: "corfu",
    pendingCommercialRules: [...SHARED_PENDING],
  },
];

export function findCorfuBookingProduct(slugOrId: string): BookableProductConfig | undefined {
  const key = slugOrId.trim();
  return CORFU_BOOKING_PRODUCTS.find((item) => item.slug === key || item.id === key);
}
