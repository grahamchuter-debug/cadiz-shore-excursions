/**
 * Cádiz destination booking core.
 * Product catalogue lives in src/data/booking-catalogue.ts so site pages
 * can join it with editorial product records.
 */
import type { DestinationBookingCore } from "../world-booking/types";

export const cadizBookingCore = {
  id: "cadiz",
  siteName: "Cadiz Shore Excursions",
  siteHostname: "cadizshoreexcursions.com",
  siteUrl: "https://cadizshoreexcursions.com",
  bookingEmail: "hello@cadizshoreexcursions.com",
  originatingSite: "cadizshoreexcursions.com",
  originatingPort: "Cadiz (Alfonso XIII)",
  bookingRefPrefix: "W2CDZ",
  sessionKeyPrefix: "w2-booking",
  sessionKeyVersion: 1,
  currencyCode: "EUR",
  bookableWindow: {
    start: "2026-04-01",
    end: "2028-12-31",
  },
  schedulePortSlug: "cadiz",
  customShipSlug: "not-listed",
  contactPath: "/enquire",
  termsPath: "/terms",
  privacyPath: "/privacy",
} as const satisfies DestinationBookingCore;
