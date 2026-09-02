import type {
  BookableProductConfig,
  BookableWindow,
  BookingCruiseContext,
  BookingCustomer,
  BookingPassenger,
  RequiredPassengerField,
} from "./types";
import { partySize } from "./pricing";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type DateValidation =
  | { ok: true; inSchedule: boolean; warning?: string }
  | { ok: false; code: "INVALID_DATE" | "PAST_DATE" | "OUTSIDE_WINDOW"; message: string };

export function todayIsoLocal(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateBookingDate(
  date: string,
  window: BookableWindow,
  scheduleDates: ReadonlySet<string>,
  now = new Date(),
): DateValidation {
  if (!ISO_DATE.test(date)) {
    return { ok: false, code: "INVALID_DATE", message: "Enter a valid date." };
  }
  const today = todayIsoLocal(now);
  if (date < today) {
    return { ok: false, code: "PAST_DATE", message: "Please choose today or a future cruise date." };
  }
  if (date < window.start || date > window.end) {
    return {
      ok: false,
      code: "OUTSIDE_WINDOW",
      message: `We can take requests between ${window.start} and ${window.end}.`,
    };
  }
  if (!scheduleDates.has(date)) {
    return {
      ok: true,
      inSchedule: false,
      warning:
        "We don't have a published ship call for this date yet. You can still send a request — tell us your ship so we can check with our local partner.",
    };
  }
  return { ok: true, inSchedule: true };
}

export function validateCustomer(customer: BookingCustomer): string | null {
  if (!customer.name.trim() || customer.name.trim().length < 2) {
    return "Please enter the lead passenger's name.";
  }
  if (!EMAIL.test(customer.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!customer.phone.trim() || customer.phone.replace(/\s/g, "").length < 8) {
    return "Please enter a mobile or WhatsApp number so we can reach you about this request.";
  }
  return null;
}

export function validateCruise(cruise: BookingCruiseContext): string | null {
  if (!ISO_DATE.test(cruise.date)) return "Choose your cruise date.";
  if (!cruise.shipName.trim()) return "Tell us which ship you are arriving on.";
  return null;
}

export function productRequiresPassengers(product: BookableProductConfig): boolean {
  return (product.requiredPassengerFields?.length ?? 0) > 0;
}

export function requiredPassengerFieldsFor(
  product: BookableProductConfig,
): readonly RequiredPassengerField[] {
  return product.requiredPassengerFields ?? [];
}

/**
 * Validates per-guest fields when the product requires them.
 * Product 1 (empty requiredPassengerFields) must not collect passport data.
 */
export function validatePassengers(
  product: BookableProductConfig,
  guests: { adults: number; children: number; infants: number },
  passengers: BookingPassenger[] | undefined,
): string | null {
  const fields = requiredPassengerFieldsFor(product);
  if (fields.length === 0) {
    if (passengers && passengers.length > 0) {
      return "This excursion does not require passenger passport details.";
    }
    return null;
  }

  const expected = partySize(guests);
  if (!passengers || passengers.length !== expected) {
    return `Please provide passport details for all ${expected} guest${expected === 1 ? "" : "s"}.`;
  }

  for (let i = 0; i < passengers.length; i += 1) {
    const p = passengers[i];
    const label = `Guest ${i + 1}`;
    if (fields.includes("fullName") && (!p.fullName.trim() || p.fullName.trim().length < 2)) {
      return `${label}: enter the full name as it appears on the passport.`;
    }
    if (fields.includes("passportNumber")) {
      const num = p.passportNumber.replace(/\s/g, "");
      if (num.length < 5) {
        return `${label}: enter a valid passport number.`;
      }
    }
    if (fields.includes("dateOfBirth") && !ISO_DATE.test(p.dateOfBirth.trim())) {
      return `${label}: enter date of birth as YYYY-MM-DD.`;
    }
    if (fields.includes("nationality") && p.nationality.trim().length < 2) {
      return `${label}: enter nationality.`;
    }
  }
  return null;
}

export function shipRequired(shipsForDate: number, scheduleMatched: boolean): boolean {
  if (!scheduleMatched) return true;
  return shipsForDate !== 1;
}

export function isProductRequestable(product: BookableProductConfig): boolean {
  return product.bookingMode === "request" && product.availability === "live";
}
