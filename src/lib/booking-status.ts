import { ENQUIRE_COPY, INSTANT_COPY, REQUEST_COPY, type BookingMode } from "@shared/world-booking";
import { bookingRequestsAreOpen } from "@/platform/booking/runtime";

export type BookingStatus = "comingSoon" | "enquiryOnly" | "live" | "soldOut" | "seasonal";

export type BookingCapable = {
  bookingStatus?: BookingStatus;
  bookingMode?: BookingMode;
  bookingPath?: string;
  priceAmount?: number | null;
};

export function resolveBookingStatus(product: BookingCapable): BookingStatus {
  return product.bookingStatus ?? "enquiryOnly";
}

export function resolveBookingMode(product: BookingCapable): BookingMode {
  return product.bookingMode ?? "enquire";
}

export function shouldShowPublicPrice(product: BookingCapable): boolean {
  const status = resolveBookingStatus(product);
  if (status === "comingSoon") return false;
  if (product.priceAmount == null) return false;
  return status === "live" || status === "seasonal" || status === "soldOut" || status === "enquiryOnly";
}

export function bookingPrimaryCta(product: BookingCapable): {
  href: string;
  label: string;
  kind: "book" | "request" | "enquire";
} {
  const status = resolveBookingStatus(product);
  const mode = resolveBookingMode(product);
  const canTransact =
    (status === "live" || status === "seasonal") &&
    Boolean(product.bookingPath) &&
    bookingRequestsAreOpen();

  if (canTransact && mode === "instant") {
    return { href: product.bookingPath as string, label: INSTANT_COPY.primaryCta, kind: "book" };
  }
  if (canTransact && mode === "request") {
    return { href: product.bookingPath as string, label: REQUEST_COPY.primaryCta, kind: "request" };
  }
  return { href: "/enquire", label: ENQUIRE_COPY.primaryCta, kind: "enquire" };
}

export function bookingSecondaryCta(): { href: string; label: string } {
  return { href: "/enquire", label: ENQUIRE_COPY.primaryCta };
}

export function bookingSupportingCopy(product: BookingCapable): string {
  const mode = resolveBookingMode(product);
  if (mode === "request") return REQUEST_COPY.supporting;
  if (mode === "instant") return INSTANT_COPY.supporting;
  return ENQUIRE_COPY.supporting;
}
