import { formatMajorMoney } from "@/lib/commerce/currency";
import { payAndRequestCtaLabel } from "@shared/world-booking";
import type { BookingQuote } from "@shared/world-booking/types";

export function formatQuoteTotal(quote: BookingQuote): string {
  return formatMajorMoney(quote.amountMajor, quote.currency);
}

export function formatPayRequestCta(quote: BookingQuote): string {
  return payAndRequestCtaLabel(formatQuoteTotal(quote));
}

export function formatUnitPrice(unitMajor: number | null, currency: BookingQuote["currency"]): string {
  if (unitMajor == null) return "To be confirmed";
  return formatMajorMoney(unitMajor, currency);
}

export function formatIsoDate(date: string, locale = "en-GB"): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
