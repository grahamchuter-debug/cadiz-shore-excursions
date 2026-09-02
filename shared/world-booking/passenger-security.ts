/**
 * Passenger / passport redaction helpers.
 *
 * Security rules for World 2.0:
 * - Never put passport numbers in Stripe metadata, analytics, URLs, or logs.
 * - Never expose passport details on public confirmation / session APIs.
 * - Do not include complete passport details in routine customer emails.
 * - Ops email may note that details were collected; numbers stay in D1 only.
 */

import type { BookingPassenger, CreateBookingRequestInput } from "./types";

const PASSPORT_KEYS = ["passportNumber", "passport_number", "passengers"] as const;

export function sanitizePassengersForStorage(
  passengers: BookingPassenger[] | undefined,
): BookingPassenger[] | undefined {
  if (!passengers?.length) return undefined;
  return passengers.map((p) => ({
    fullName: p.fullName.trim(),
    passportNumber: p.passportNumber.replace(/\s/g, "").toUpperCase(),
    dateOfBirth: p.dateOfBirth.trim(),
    nationality: p.nationality.trim(),
  }));
}

/** Strip passengers before any analytics / debug client payload. */
export function stripPassengersFromAnalyticsPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...payload };
  for (const key of PASSPORT_KEYS) {
    delete next[key];
  }
  if (next.customer && typeof next.customer === "object") {
    const customer = { ...(next.customer as Record<string, unknown>) };
    delete customer.passportNumber;
    next.customer = customer;
  }
  return next;
}

/**
 * Persistable booking body: keep passengers in D1 payload_json only.
 * Callers must never forward this object into Stripe metadata or logs.
 */
export function bookingPayloadForStorage(body: CreateBookingRequestInput): CreateBookingRequestInput {
  const passengers = sanitizePassengersForStorage(body.passengers);
  return passengers ? { ...body, passengers } : { ...body, passengers: undefined };
}

/**
 * Redact passenger PII from a parsed payload before logging or email preview.
 */
export function redactPassengersFromPayload(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactPassengersFromPayload);
  const obj = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(obj)) {
    if (key === "passengers" || key === "passportNumber" || key === "passport_number") {
      next[key] = Array.isArray(v) ? `[redacted:${v.length}]` : "[redacted]";
      continue;
    }
    next[key] = redactPassengersFromPayload(v);
  }
  return next;
}

export function passengersCollectedSummary(count: number): string {
  if (count <= 0) return "No passenger passport details required.";
  return `Passport details collected for ${count} guest${count === 1 ? "" : "s"} — view in operator portal only.`;
}
