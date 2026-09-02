"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  confirmedCustomerEmail,
  destinationBrandFromCore,
  requestedCustomerEmail,
  declinedCustomerEmail,
  supplierRequestEmail,
  supplierRoutingIsPlaceholder,
} from "@shared/world-booking";
import { cadizBookingCore } from "@shared/destinations/cadiz";
import type { BookableProductConfig, BookingQuote, CreateBookingRequestInput } from "@shared/world-booking/types";
import { trackBookingEvent } from "@/platform/booking/analytics";
import { isTestPayments } from "@/platform/booking/runtime";
import { fetchBookingSession, postOperatorAction } from "@/platform/payments/client";
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
};

function readReceivedQuery(): ReceivedQuery {
  if (typeof window === "undefined") return { reference: "", sessionId: null };
  const params = new URLSearchParams(window.location.search);
  return {
    reference: params.get("ref") || params.get("simRef") || "",
    sessionId: params.get("session_id"),
  };
}

const EMPTY_QUERY: ReceivedQuery = { reference: "", sessionId: null };

function EmailCard({ title, subject, heading, lines }: { title: string; subject: string; heading: string; lines: string[] }) {
  return (
    <article className="rounded-2xl border border-coastal-100 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coastal-700">{title}</p>
      <p className="mt-2 text-sm font-medium text-gray-900">Subject: {subject}</p>
      <h3 className="mt-3 font-display text-lg text-coastal-900">{heading}</h3>
      <ul className="mt-2 space-y-1 text-sm leading-relaxed text-gray-700">
        {lines.map((line, index) => (
          <li key={`${index}-${line}`}>{line}</li>
        ))}
      </ul>
    </article>
  );
}

export function BookingReceivedDebug({ product }: { product: BookableProductConfig }) {
  const query = useSyncExternalStore(
    () => () => {},
    readReceivedQuery,
    () => EMPTY_QUERY,
  );
  const reference = query.reference;
  const sessionId = query.sessionId;
  const [remote, setRemote] = useState<Awaited<ReturnType<typeof fetchBookingSession>>>(null);
  const [operatorBusy, setOperatorBusy] = useState<"confirm" | "decline" | null>(null);
  const [operatorMessage, setOperatorMessage] = useState<string | null>(null);

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
  const cruiseDate = remote?.cruiseDate || record?.payload.cruise.date || "";
  const shipName = remote?.shipName || record?.payload.cruise.shipName || "";
  const cruise = record?.payload.cruise ?? {
    date: cruiseDate,
    shipName: shipName || "Cruise ship to be confirmed",
    shipSlug: "not-listed",
    cruiseLine: "",
    isCustomShip: true,
    scheduleMatched: false,
  };
  const amountMajor =
    remote?.amountTotal != null
      ? Math.round(remote.amountTotal / 100)
      : record?.quote.amountMajor ?? null;
  const amountLabel = amountMajor != null ? formatMajorMoney(amountMajor, product.pricing.currency) : "To be confirmed";
  const displayReference = reference || remote?.reference || "";

  const destinationBrand = destinationBrandFromCore(cadizBookingCore);
  const requested = requestedCustomerEmail({
    reference: reference || remote?.reference || "W2CDZ-PREVIEW",
    product,
    cruise,
    guests,
    amountLabel,
    brand: destinationBrand,
  });
  const confirmed = confirmedCustomerEmail({
    reference: reference || remote?.reference || "W2CDZ-PREVIEW",
    product,
    cruise,
    guests,
    amountLabel,
    brand: destinationBrand,
  });
  const declined = declinedCustomerEmail({
    reference: reference || remote?.reference || "W2CDZ-PREVIEW",
    product,
    cruise,
    guests,
    amountLabel,
    brand: destinationBrand,
  });
  const supplier = supplierRequestEmail({
    reference: reference || remote?.reference || "W2CDZ-PREVIEW",
    product,
    cruise,
    guests,
    customer: record?.payload.customer
      ? {
          name: record.payload.customer.name,
          email: record.payload.customer.email,
          phone: record.payload.customer.phone,
        }
      : remote?.customerName
        ? {
            name: remote.customerName,
            email: remote.customerEmail || "",
            phone: "",
          }
        : undefined,
    amountLabel,
    operationalNotes: record?.payload.customer.operationalNotes,
  });

  async function runOperator(action: "confirm" | "decline") {
    const ref = reference || remote?.reference;
    if (!ref) return;
    setOperatorBusy(action);
    setOperatorMessage(null);
    const result = await postOperatorAction(action, ref);
    if (action === "confirm") trackBookingEvent("supplier_confirmed", { productId: product.id, preview: true });
    if (action === "decline") {
      trackBookingEvent("supplier_declined", { productId: product.id, preview: true });
      trackBookingEvent("refund_initiated", { productId: product.id, preview: true });
      if (result.refunded) trackBookingEvent("refund_completed", { productId: product.id, refundId: result.refundId });
    }
    setOperatorBusy(null);
    if (!result.ok) {
      setOperatorMessage(result.message || "Operator action failed.");
      return;
    }
    const snapshot = await fetchBookingSession({ sessionId, reference: ref });
    setRemote(snapshot);
  }

  if (!reference && !sessionId) {
    return <p className="text-sm text-gray-600">Add ?ref= or ?session_id= to preview debug tools for a booking.</p>;
  }

  return (
    <div className="mt-10 space-y-6 border-t border-dashed border-coastal-200 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maple-600">Internal debug tools</p>
      <p className="text-sm text-gray-600">
        Not linked from the public site. Available in local development or when{" "}
        <code className="rounded bg-coastal-50 px-1">NEXT_PUBLIC_BOOKING_DEBUG_TOOLS=true</code> is set at build time.
      </p>

      {isTestPayments() && (
        <div className="rounded-3xl border border-dashed border-coastal-200 p-5 text-sm text-gray-600">
          <p className="font-display text-lg text-gray-900">Test operator simulations</p>
          <p className="mt-1 text-xs leading-relaxed">
            TEST only. Confirm does not refund. Decline issues a real Stripe TEST refund. Production must never use a public page token.
          </p>
          {operatorMessage && <p className="mt-2 text-sm text-maple-600">{operatorMessage}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              className="rounded-full bg-coastal-50 px-3 py-1.5 text-coastal-900 disabled:opacity-40"
              disabled={operatorBusy !== null || !displayReference}
              onClick={() => void runOperator("confirm")}
            >
              {operatorBusy === "confirm" ? "Confirming…" : "Supplier confirmed"}
            </button>
            <button
              type="button"
              className="rounded-full bg-coastal-50 px-3 py-1.5 text-coastal-900 disabled:opacity-40"
              disabled={operatorBusy !== null || !displayReference}
              onClick={() => void runOperator("decline")}
            >
              {operatorBusy === "decline" ? "Declining…" : "Supplier declined (TEST refund)"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-coastal-100 bg-coastal-50/50 p-5">
        <p className="font-display text-lg text-gray-900">Customer emails (preview only)</p>
        <p className="mt-1 text-xs text-gray-500">Not sent. Inspect wording before production email integration.</p>
        <div className="mt-4 grid gap-4">
          <EmailCard
            title="Request received"
            subject={requested.subject}
            heading={requested.customerHeading}
            lines={requested.bodyLines}
          />
          <EmailCard
            title="Booking confirmed"
            subject={confirmed.subject}
            heading={confirmed.customerHeading}
            lines={confirmed.bodyLines}
          />
          <EmailCard
            title="Unable to confirm / refund"
            subject={declined.subject}
            heading={declined.customerHeading}
            lines={declined.bodyLines}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-maple-500/30 bg-white p-5">
        <p className="font-display text-lg text-gray-900">Supplier notification (preview only)</p>
        <p className="mt-1 text-xs text-gray-600">
          Routing:{" "}
          {supplierRoutingIsPlaceholder(product)
            ? "preview placeholder — no external email"
            : `${product.supplier.displayName} operations (product-configured mailbox)`}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Destination address is not shown on this page. Payment/card data is never included. Operator secrets are never placed in email URLs.
        </p>
        <p className="mt-3 text-sm font-medium text-gray-900">Subject: {supplier.subject}</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-coastal-50 p-4 text-xs leading-relaxed text-gray-800">
          {supplier.body}
        </pre>
      </div>
    </div>
  );
}
