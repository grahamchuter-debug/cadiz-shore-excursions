/**
 * Internal booking debug tooling (operator simulations, email previews).
 *
 * Deliberately separate from PAYMENTS_MODE / isTestPayments(): production dress
 * rehearsal uses Stripe TEST but must still show a clean customer confirmation page.
 */
export function isBookingDebugToolsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS === "true") return true;
  return process.env.NODE_ENV === "development";
}
