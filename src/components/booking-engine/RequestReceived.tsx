"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { REQUEST_COPY, customerStatusLabel, partySize, usesFlatGuestPricing } from "@shared/world-booking";
import type {
  BookableProductConfig,
  BookingLifecycleStatus,
  BookingQuote,
  CreateBookingRequestInput,
} from "@shared/world-booking/types";
import { trackBookingEvent } from "@/platform/booking/analytics";
import { formatIsoDate } from "@/platform/booking/format";
import { getBookingRuntime, isTestPayments } from "@/platform/booking/runtime";
import { fetchBookingSession } from "@/platform/payments/client";
import { formatMajorMoney } from "@/lib/commerce/currency";

type PreviewRecord = {
  reference: string;
  payload: CreateBookingRequestInput;
  quote: BookingQuote;
};

function readPreviewRaw(reference: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(`w2.booking.preview.${reference}`);
  } catch {
    return null;
  }
}

function subscribePreviewStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

type ReceivedQuery = {
  reference: string;
  sessionId: string | null;
  previewFlag: boolean;
  simulation: string | null;
};

function readReceivedQuery(): ReceivedQuery {
  if (typeof window === "undefined") {
    return { reference: "", sessionId: null, previewFlag: false, simulation: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    reference: params.get("ref") || params.get("simRef") || "",
    sessionId: params.get("session_id"),
    previewFlag: params.get("preview") === "1",
    simulation: params.get("sim"),
  };
}

const EMPTY_QUERY: ReceivedQuery = {
  reference: "",
  sessionId: null,
  previewFlag: false,
  simulation: null,
};

let cachedSearch = "";
let cachedQuery: ReceivedQuery = EMPTY_QUERY;

function getClientQuery(): ReceivedQuery {
  const search = window.location.search;
  if (search === cachedSearch) return cachedQuery;
  cachedSearch = search;
  cachedQuery = readReceivedQuery();
  return cachedQuery;
}

function subscribeReceivedQuery(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

export function RequestReceived({ product }: { product: BookableProductConfig }) {
  const query = useSyncExternalStore(subscribeReceivedQuery, getClientQuery, () => EMPTY_QUERY);
  const reference = query.reference;
  const sessionId = query.sessionId;
  const preview = query.previewFlag || getBookingRuntime() !== "live";
  const simulation = query.simulation;
  const [remote, setRemote] = useState<Awaited<ReturnType<typeof fetchBookingSession>>>(null);

  const raw = useSyncExternalStore(
    subscribePreviewStore,
    () => (reference ? readPreviewRaw(reference) : null),
    () => null,
  );
  const record = useMemo((): PreviewRecord | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PreviewRecord;
    } catch {
      return null;
    }
  }, [raw]);

  useEffect(() => {
    if (!sessionId && !reference) return;
    let cancelled = false;
    async function poll() {
      try {
        const snapshot = await fetchBookingSession({ sessionId, reference });
        if (!cancelled) setRemote(snapshot);
      } catch {
        if (!cancelled) setRemote(null);
      }
    }
    void poll();
    const timer = window.setInterval(() => void poll(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId, reference]);

  const guests = record?.payload.guests ?? (remote?.guestCount ? { adults: remote.guestCount, children: 0, infants: 0 } : { adults: 0, children: 0, infants: 0 });
  const guestCount = remote?.guestCount ?? (record ? partySize(record.payload.guests) : null);
  const cruiseDate = remote?.cruiseDate || record?.payload.cruise.date || "";
  const shipName = remote?.shipName || record?.payload.cruise.shipName || "";
  const amountMajor =
    remote?.amountTotal != null
      ? Math.round(remote.amountTotal / 100)
      : record?.quote.amountMajor ?? null;
  const amountLabel = amountMajor != null ? formatMajorMoney(amountMajor, product.pricing.currency) : "To be confirmed";
  const lifecycle = (remote?.status as BookingLifecycleStatus | undefined) ?? undefined;
  const paid =
    remote?.payment_status === "paid" ||
    remote?.payment_status === "refunded" ||
    remote?.payment_status === "refund_pending" ||
    remote?.bookingFinalised;
  const waitingForRemote = Boolean((sessionId || reference) && !remote && !record);
  const preparing = Boolean(
    waitingForRemote ||
      (sessionId && remote && remote.stripePaid && !remote.bookingFinalised && lifecycle === "payment_pending"),
  );

  const trackedPayment = useRef(false);

  useEffect(() => {
    if (trackedPayment.current) return;
    if (remote?.bookingFinalised && remote.payment_status === "paid") {
      trackedPayment.current = true;
      trackBookingEvent("payment_succeeded", { productId: product.id, reference: remote.reference });
      trackBookingEvent("booking_request_submitted", { productId: product.id, preview: true });
    }
  }, [product.id, remote?.bookingFinalised, remote?.payment_status, remote?.reference]);

  useEffect(() => {
    if (getBookingRuntime() === "live") return;
    if (simulation === "confirmed") trackBookingEvent("supplier_confirmed", { productId: product.id, preview: true });
    if (simulation === "declined") trackBookingEvent("supplier_declined", { productId: product.id, preview: true });
    if (simulation === "refund") trackBookingEvent("refund_initiated", { productId: product.id, preview: true });
  }, [product.id, simulation]);

  const statusCopy = useMemo(() => {
    if (lifecycle === "payment_failed" || simulation === "payfail") {
      return {
        headline: "Payment unsuccessful",
        body: "No booking request was sent. You can return to the review step and try again. No extra charge was created.",
        badge: "Payment unsuccessful",
      };
    }
    if (lifecycle === "confirmed" || simulation === "confirmed") {
      return {
        headline: "Your Cadiz excursion is confirmed",
        body: "Your booking is now confirmed.",
        badge: "Confirmed",
      };
    }
    if (lifecycle === "supplier_declined" || lifecycle === "refunded" || simulation === "declined" || simulation === "refund") {
      return {
        headline: "Update on your Cadiz excursion request",
        body: `Our local partner could not confirm the excursion. A full refund of ${amountLabel} has been initiated.`,
        badge: customerStatusLabel(lifecycle === "refunded" ? "refunded" : "supplier_declined"),
      };
    }
    if (preparing) {
      return {
        headline: REQUEST_COPY.preparingHeadline,
        body: REQUEST_COPY.preparingBody,
        badge: "Payment received",
      };
    }
    return {
      headline: REQUEST_COPY.receivedHeadline,
      body: REQUEST_COPY.receivedBody,
      badge: REQUEST_COPY.awaitingConfirmationLabel,
    };
  }, [amountLabel, lifecycle, preparing, simulation]);

  const displayReference = reference || remote?.reference || "";
  const showPaymentSuccess = Boolean(paid || preparing || lifecycle === "requested" || lifecycle === "confirmed");

  if (!reference && !sessionId) {
    return <p className="text-sm text-gray-600">Loading your request…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {preview && (
        <p className="mb-5 rounded-2xl border border-autumn-400/50 bg-autumn-300/15 px-4 py-3 text-sm text-gray-800">
          {isTestPayments()
            ? "Stripe TEST environment — live cards cannot be charged. Customer and partner emails are not sent."
            : "Preview — no payment has been taken and no partner email has been sent."}
        </p>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coastal-800">{statusCopy.badge}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        {statusCopy.headline}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-gray-700">{statusCopy.body}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="rounded-2xl border border-coastal-100 bg-white px-4 py-3 text-sm">
          <span className="block text-xs uppercase tracking-[0.14em] text-gray-500">Payment</span>
          <span className="mt-1 block font-medium text-gray-900">
            {remote?.payment_status === "refunded"
              ? "Refunded"
              : remote?.payment_status === "refund_pending"
                ? "Refund in progress"
                : showPaymentSuccess
                  ? REQUEST_COPY.paymentSuccessfulLabel
                  : "Waiting for payment"}
          </span>
        </p>
        <p className="rounded-2xl border border-coastal-100 bg-white px-4 py-3 text-sm">
          <span className="block text-xs uppercase tracking-[0.14em] text-gray-500">Excursion</span>
          <span className="mt-1 block font-medium text-gray-900">
            {lifecycle === "confirmed"
              ? "Confirmed"
              : lifecycle === "supplier_declined" || lifecycle === "refunded"
                ? "Unable to confirm"
                : REQUEST_COPY.awaitingConfirmationLabel}
          </span>
        </p>
      </div>

      <p className="mt-6 rounded-3xl border border-coastal-100 bg-white px-5 py-4 font-display text-xl text-coastal-900">
        Reference {displayReference}
      </p>
      <ul className="mt-6 space-y-2 text-sm text-gray-700">
        <li>Excursion: {remote?.productName || product.name}</li>
        <li>Date: {cruiseDate ? formatIsoDate(cruiseDate) : "To be confirmed"}</li>
        <li>Ship: {shipName || "To be confirmed"}</li>
        <li>
          Guests:{" "}
          {guestCount == null
            ? "To be confirmed"
            : usesFlatGuestPricing(product)
              ? `${guestCount} guest${guestCount === 1 ? "" : "s"}`
              : `${guests.adults} adult${guests.adults === 1 ? "" : "s"}, ${guests.children} ${guests.children === 1 ? "child" : "children"}, ${guests.infants} infant${guests.infants === 1 ? "" : "s"}`}
        </li>
        <li>
          Amount paid: <span className="price-amount">{amountLabel}</span>
        </li>
        {lifecycle !== "supplier_declined" && lifecycle !== "refunded" && lifecycle !== "confirmed" ? (
          <li>{REQUEST_COPY.nextSteps}</li>
        ) : null}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={product.productPath} className="btn-primary">
          Back to the excursion
        </Link>
        <Link href="/enquire" className="btn-secondary">
          Contact us
        </Link>
      </div>
    </div>
  );
}
