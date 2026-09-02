import { cadizBookingCore } from "./cadiz";
import type { AgeBand, BookableProductConfig, ProductCapacity, ProductPricing } from "../world-booking/types";

/**
 * V1 operational routing: Wow A Tour booking mailbox (same model as Corfu).
 * Automated ACTION REQUIRED emails go to Wow A Tour — not directly to SEG.
 */
const OPERATIONS = {
  id: "wow-a-tour-operations",
  displayName: "Wow A Tour",
  notificationEmail: "info@wowatour.com",
  routingStatus: "production_ready" as const,
};

const REQUEST_SETTLEMENT = "charge_refund" as const;

/**
 * Online party cap for Cádiz Seville money-page trial.
 * Distinct from supplier coach size / max guests per guide.
 */
const CADIZ_TRIAL_CAPACITY: ProductCapacity = {
  minGuests: 1,
  maxGuestsPerBooking: 8,
  maxGuestsPerBookingSource: "approved",
  supplierGroupSize: null,
  maxGuestsPerGuide: null,
};

const SMALL_GROUP_CAPACITY: ProductCapacity = {
  minGuests: 1,
  maxGuestsPerBooking: 8,
  maxGuestsPerBookingSource: "approved",
  supplierGroupSize: null,
  maxGuestsPerGuide: 20,
};

/**
 * Child / infant rates are NOT commercially confirmed for these SEG products.
 * Online checkout sells adult places only (flat_per_guest with children/infants
 * forced to 0 in the booking UI). Do not invent child prices.
 */
const CADIZ_AGE_BANDS: readonly AgeBand[] = [
  { id: "adult", label: "Adults", minAge: null, maxAge: null, pricingStatus: "priced" },
  { id: "child", label: "Children", minAge: null, maxAge: null, pricingStatus: "needs_confirmation" },
  { id: "infant", label: "Infants", minAge: null, maxAge: null, pricingStatus: "needs_confirmation" },
];

function flatPerAdult(pricePerGuest: number): ProductPricing {
  return {
    model: "flat_per_guest",
    currency: "EUR",
    pricePerGuest,
    adultAmount: pricePerGuest,
    childAmount: null,
    childPricingStatus: "needs_confirmation",
    infantAmount: null,
    infantPricingStatus: "needs_confirmation",
    pricingNeedsConfirmation: false,
  };
}

const SHARED_PENDING = [
  "Operational requests go to Wow A Tour (info@wowatour.com). Wow A Tour confirms availability with the local supplier — do not auto-email SEG.",
  "Child and infant pricing not commercially confirmed — online booking sells adult places only at the verified adult EUR price.",
  "Operational confirmation still happens with the local partner after payment (request-to-book).",
] as const;

export const CADIZ_BOOKING_PRODUCTS: readonly BookableProductConfig[] = [
  {
    id: "seville-on-your-own",
    destinationId: cadizBookingCore.id,
    slug: "seville-on-your-own",
    name: "Seville On Your Own — Plaza de España & Free Time",
    durationLabel: "Approximately 8 hours",
    bookingMode: "request",
    availability: "live",
    bookingPath: "/book/seville-on-your-own",
    receivedPath: "/book/seville-on-your-own/received",
    confirmedPath: "/book/seville-on-your-own/received",
    productPath: "/shore-excursions/seville-on-your-own",
    pricing: flatPerAdult(88),
    ageBands: CADIZ_AGE_BANDS,
    capacity: CADIZ_TRIAL_CAPACITY,
    requiredCustomerFields: ["name", "email", "phone"],
    requiredPassengerFields: [],
    supplier: OPERATIONS,
    paymentSettlement: REQUEST_SETTLEMENT,
    schedulePortSlug: "cadiz",
    pendingCommercialRules: [...SHARED_PENDING],
    supplierReferenceNotes: [
      "SEG source: Seville Shuttle from Cadiz with Plaza Espana and Free Time.",
      "Internal confidence only — supplier displays ~4.9/5 from 11 ratings. Do not publish as first-party Cadiz Shore Excursions reviews without attribution approval.",
    ],
  },
  {
    id: "small-group-seville",
    destinationId: cadizBookingCore.id,
    slug: "small-group-seville",
    name: "Small-Group Seville — Cathedral & Real Alcázar",
    durationLabel: "Approximately 8 hours",
    bookingMode: "request",
    availability: "live",
    bookingPath: "/book/small-group-seville",
    receivedPath: "/book/small-group-seville/received",
    confirmedPath: "/book/small-group-seville/received",
    productPath: "/shore-excursions/small-group-seville",
    pricing: flatPerAdult(229),
    ageBands: CADIZ_AGE_BANDS,
    capacity: SMALL_GROUP_CAPACITY,
    requiredCustomerFields: ["name", "email", "phone"],
    requiredPassengerFields: ["fullName", "passportNumber", "dateOfBirth", "nationality"],
    supplier: OPERATIONS,
    paymentSettlement: REQUEST_SETTLEMENT,
    schedulePortSlug: "cadiz",
    pendingCommercialRules: [
      ...SHARED_PENDING,
      "Passport details required for every guest (supplier requirement for Cathedral / Real Alcázar).",
    ],
    supplierReferenceNotes: [
      "SEG source: Wonders of Seville.",
      "Internal confidence only — supplier displays ~4.8/5 from 21 ratings. Do not publish as first-party reviews without attribution approval.",
      "Each guest must carry a valid passport on the tour.",
    ],
  },
];

export function findCadizBookingProduct(slugOrId: string): BookableProductConfig | undefined {
  const key = slugOrId.trim();
  return CADIZ_BOOKING_PRODUCTS.find((p) => p.slug === key || p.id === key);
}
