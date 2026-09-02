/**
 * Booking runtime is a build-time flag for UI copy and preview tools.
 *
 * Live charging is a separate code unlock, not an environment flip.
 * Setting NEXT_PUBLIC_BOOKING_RUNTIME=live must never take card payments.
 * `test` talks to the Cadiz Worker in Stripe TEST mode only.
 */
export type BookingRuntime = "off" | "preview" | "test" | "live";

/** Flip only as an explicit production payment-integration change. */
const LIVE_PAYMENTS_CODE_ENABLED = false;

export function getBookingRuntime(): BookingRuntime {
  const value = process.env.NEXT_PUBLIC_BOOKING_RUNTIME;
  if (value === "off") return "off";
  if (value === "test") return "test";
  if (value === "live" && LIVE_PAYMENTS_CODE_ENABLED) return "live";
  return "preview";
}

export function bookingRequestsAreOpen(): boolean {
  return getBookingRuntime() !== "off";
}

export function isLivePayments(): boolean {
  return LIVE_PAYMENTS_CODE_ENABLED && getBookingRuntime() === "live";
}

export function isTestPayments(): boolean {
  return getBookingRuntime() === "test";
}
