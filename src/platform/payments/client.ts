import type { BookableProductConfig, BookingQuote, CreateBookingRequestInput } from "@shared/world-booking/types";
import { isLivePayments, isTestPayments } from "@/platform/booking/runtime";

export type SubmitBookingResult =
  | {
      ok: true;
      reference: string;
      status: "requested" | "payment_pending";
      preview: boolean;
      receivedPath: string;
      checkoutUrl?: string;
      sessionId?: string;
    }
  | {
      ok: false;
      code: string;
      message: string;
    };

export type BookingSessionSnapshot = {
  ok: boolean;
  stripePaid?: boolean;
  bookingFinalised?: boolean;
  reference?: string | null;
  status?: string | null;
  payment_status?: string | null;
  productName?: string | null;
  cruiseDate?: string | null;
  shipName?: string | null;
  guestCount?: number | null;
  amountTotal?: number | null;
  currency?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
};

function bookingsApiUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_BOOKINGS_API_URL?.replace(/\/$/, "");
}

export async function submitBookingRequest(input: {
  product: BookableProductConfig;
  payload: CreateBookingRequestInput;
  quote: BookingQuote;
}): Promise<SubmitBookingResult> {
  const apiUrl = bookingsApiUrl();
  if (apiUrl && (isTestPayments() || isLivePayments())) {
    return postCheckout(`${apiUrl}/api/bookings/checkout`, input.payload);
  }
  if (apiUrl) {
    return postToWorker(`${apiUrl}/api/bookings/request`, input.payload);
  }

  return previewSubmit(input);
}

async function postCheckout(url: string, payload: CreateBookingRequestInput): Promise<SubmitBookingResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": payload.bookingSessionId },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => null)) as
    | (SubmitBookingResult & { url?: string; checkoutUrl?: string; sessionId?: string })
    | null;
  if (!data || typeof data !== "object") {
    return { ok: false, code: "NETWORK", message: "We couldn't start payment. Please try again." };
  }
  if (!data.ok) return data;
  const checkoutUrl = data.checkoutUrl || data.url;
  if (!checkoutUrl) {
    return { ok: false, code: "CHECKOUT", message: "Payment could not be started. Please try again." };
  }
  return {
    ok: true,
    reference: data.reference,
    status: "payment_pending",
    preview: true,
    receivedPath: "",
    checkoutUrl,
    sessionId: data.sessionId,
  };
}

async function postToWorker(url: string, payload: CreateBookingRequestInput): Promise<SubmitBookingResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": payload.bookingSessionId },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => null)) as SubmitBookingResult | null;
  if (!data || typeof data !== "object") {
    return { ok: false, code: "NETWORK", message: "We couldn't submit your request. Please try again." };
  }
  return data;
}

export async function fetchBookingSession(params: {
  sessionId?: string | null;
  reference?: string | null;
}): Promise<BookingSessionSnapshot | null> {
  const apiUrl = bookingsApiUrl();
  if (!apiUrl) return null;
  const search = new URLSearchParams();
  if (params.sessionId) search.set("session_id", params.sessionId);
  if (params.reference) search.set("ref", params.reference);
  try {
    const response = await fetch(`${apiUrl}/api/bookings/session?${search.toString()}`, { cache: "no-store" });
    const data = (await response.json().catch(() => null)) as BookingSessionSnapshot | null;
    if (!data || typeof data !== "object" || data.ok === false) return null;
    return data;
  } catch {
    return null;
  }
}

export async function postOperatorAction(
  action: "confirm" | "decline",
  reference: string,
): Promise<{ ok: boolean; status?: string; payment_status?: string; refunded?: boolean; message?: string; refundId?: string }> {
  const apiUrl = bookingsApiUrl();
  const token = process.env.NEXT_PUBLIC_BOOKING_OPERATOR_TOKEN;
  if (!apiUrl || !token) {
    return { ok: false, message: "Operator simulation is not configured." };
  }
  const response = await fetch(`${apiUrl}/api/bookings/operator/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cadiz-Operator-Token": token,
    },
    body: JSON.stringify({ reference }),
  });
  return ((await response.json().catch(() => null)) as {
    ok: boolean;
    status?: string;
    payment_status?: string;
    refunded?: boolean;
    message?: string;
    refundId?: string;
  } | null) ?? { ok: false, message: "Operator request failed." };
}

const PREVIEW_INDEX_KEY = "w2.booking.preview.index";

function previewSubmit(input: {
  product: BookableProductConfig;
  payload: CreateBookingRequestInput;
  quote: BookingQuote;
}): SubmitBookingResult {
  if (typeof window === "undefined") {
    return { ok: false, code: "SSR", message: "Booking can only be submitted in the browser during preview." };
  }

  const existing = window.sessionStorage.getItem(`w2.booking.session.${input.payload.bookingSessionId}`);
  if (existing) {
    const parsed = JSON.parse(existing) as { reference: string };
    return {
      ok: true,
      reference: parsed.reference,
      status: "requested",
      preview: true,
      receivedPath: `${input.product.receivedPath}?ref=${encodeURIComponent(parsed.reference)}&preview=1`,
    };
  }

  const stamp = input.payload.bookingSessionId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const reference = `W2CDZ-${stamp || "PREVIEW1"}`;
  const record = {
    reference,
    productId: input.product.id,
    payload: input.payload,
    quote: input.quote,
    status: "requested",
    createdAt: new Date().toISOString(),
    paymentSimulation: "charge_recorded",
  };
  window.sessionStorage.setItem(`w2.booking.preview.${reference}`, JSON.stringify(record));
  window.sessionStorage.setItem(`w2.booking.session.${input.payload.bookingSessionId}`, JSON.stringify({ reference }));
  const index = JSON.parse(window.sessionStorage.getItem(PREVIEW_INDEX_KEY) || "[]") as string[];
  window.sessionStorage.setItem(PREVIEW_INDEX_KEY, JSON.stringify([...index, reference]));

  return {
    ok: true,
    reference,
    status: "requested",
    preview: true,
    receivedPath: `${input.product.receivedPath}?ref=${encodeURIComponent(reference)}&preview=1`,
  };
}
