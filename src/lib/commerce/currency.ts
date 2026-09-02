/**
 * World 2.0 commerce currency helpers.
 *
 * Network principle (no live FX conversion of supplier list prices):
 * - Eurozone → EUR €
 * - United Kingdom → GBP £
 * - Caribbean → USD $
 * - USA / Hawaii → USD $
 *
 * Cadiz displays the supplied Euro selling prices directly.
 */

export type DestinationCurrencyCode = "EUR" | "USD" | "GBP";

export const DESTINATION_CURRENCY_DEFAULTS = {
  europe: "EUR",
  caribbean: "USD",
  alaska: "USD",
  usa: "USD",
  "british-isles": "GBP",
} as const satisfies Record<string, DestinationCurrencyCode>;

export const CURRENCY_SYMBOL: Record<DestinationCurrencyCode, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

/** Lazy import to avoid circular init with destination config. */
export function getSiteCurrency(): DestinationCurrencyCode {
  return "EUR";
}

export const SITE_CURRENCY: DestinationCurrencyCode = "EUR";

export function formatMajorMoney(
  amount: number,
  currency: DestinationCurrencyCode = SITE_CURRENCY,
  locale = "en-GB",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${CURRENCY_SYMBOL[currency]}${amount}`;
  }
}

export function formatPricePerPerson(
  amount: number | null | undefined,
  currency: DestinationCurrencyCode = SITE_CURRENCY,
): string | null {
  if (amount == null) return null;
  return `${formatMajorMoney(amount, currency)} per person`;
}

export function formatCompactPricePerPerson(
  amount: number | null | undefined,
  currency: DestinationCurrencyCode = SITE_CURRENCY,
): string | null {
  if (amount == null) return null;
  return `${formatMajorMoney(amount, currency)} pp`;
}
