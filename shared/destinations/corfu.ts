/**
 * Corfu destination booking core.
 * Product catalogue lives in src/data/booking-catalogue.ts so site pages
 * can join it with editorial product records.
 */
import type { DestinationBookingCore } from "../world-booking/types";

export const corfuBookingCore = {
  id: "corfu",
  siteName: "Corfu Shore Excursions",
  siteHostname: "corfushoreexcursion.com",
  siteUrl: "https://corfushoreexcursion.com",
  bookingEmail: "hello@corfushoreexcursion.com",
  originatingSite: "corfushoreexcursion.com",
  originatingPort: "Corfu (Neo Limani)",
  bookingRefPrefix: "W2CSE",
  sessionKeyPrefix: "w2-booking",
  sessionKeyVersion: 3,
  currencyCode: "EUR",
  bookableWindow: {
    start: "2026-04-01",
    end: "2028-12-31",
  },
  schedulePortSlug: "corfu",
  customShipSlug: "not-listed",
  contactPath: "/enquire",
  termsPath: "/terms",
  privacyPath: "/privacy",
} as const satisfies DestinationBookingCore;
