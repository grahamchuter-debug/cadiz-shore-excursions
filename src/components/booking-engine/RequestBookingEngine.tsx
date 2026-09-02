"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cadizBookingCore } from "@shared/destinations/cadiz";
import {
  REQUEST_COPY,
  bookingSessionStorageKey,
  calculateBookingQuote,
  createBookingSessionId,
  partySize,
  productRequiresPassengers,
  usesFlatGuestPricing,
  validateBookingDate,
  validateCruise,
  validateCustomer,
  validatePassengers,
} from "@shared/world-booking";
import type {
  BookableProductConfig,
  BookingCustomer,
  BookingPassenger,
  GuestCounts,
} from "@shared/world-booking/types";
import { trackBookingEvent, trackPlannerEvent } from "@/platform/booking/analytics";
import { formatIsoDate, formatPayRequestCta, formatQuoteTotal, formatUnitPrice } from "@/platform/booking/format";
import { getBookingRuntime } from "@/platform/booking/runtime";
import { submitBookingRequest } from "@/platform/payments/client";
import { DateField } from "./DateField";
import {
  customShipVisit,
  isCustomBookingShip,
  shipsForDate,
  type BookingShipVisit,
  type BookingShipsByDate,
} from "@/platform/booking/ships";

type StepId = "cruise" | "guests" | "details" | "pay";

type EngineState = {
  step: StepId;
  date: string;
  ship: BookingShipVisit | null;
  customShipName: string;
  unlistedShip: boolean;
  guests: GuestCounts;
  customer: BookingCustomer;
  passengers: BookingPassenger[];
  acknowledged: boolean;
  bookingSessionId: string;
  submitting: boolean;
  error: string | null;
};

function emptyPassenger(): BookingPassenger {
  return { fullName: "", passportNumber: "", dateOfBirth: "", nationality: "" };
}

function syncPassengerRows(count: number, existing: BookingPassenger[]): BookingPassenger[] {
  const next = existing.slice(0, count);
  while (next.length < count) next.push(emptyPassenger());
  return next;
}

const STEPS: { id: StepId; label: string }[] = [
  { id: "cruise", label: "Cruise" },
  { id: "guests", label: "Guests" },
  { id: "details", label: "Details" },
  { id: "pay", label: "Review" },
];

const fieldClass =
  "mt-1 w-full rounded-xl border border-coastal-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-coastal-500 focus:outline-none focus:ring-2 focus:ring-coastal-500/30";

const dateInputClass = fieldClass.replace(/^mt-1\s+/, "");

function isStepId(value: string | null): value is StepId {
  return value === "cruise" || value === "guests" || value === "details" || value === "pay";
}

function readPrefill(): { date: string; shipName: string; adults?: number; children?: number; fromPlanner?: boolean } {
  if (typeof window === "undefined") return { date: "", shipName: "" };
  const params = new URLSearchParams(window.location.search);
  const date = params.get("date")?.trim() ?? "";
  const shipName = params.get("ship")?.trim() ?? "";
  const adultsRaw = params.get("adults");
  const childrenRaw = params.get("children");
  const adults = adultsRaw ? Number(adultsRaw) : undefined;
  const children = childrenRaw ? Number(childrenRaw) : undefined;
  const fromPlanner = params.get("from") === "planner";
  try {
    const raw = window.sessionStorage.getItem("w2.cruiseContext.v1");
    if (raw) {
      const ctx = JSON.parse(raw) as { date?: string; shipName?: string; currentPort?: string };
      if (ctx.currentPort && ctx.currentPort !== "cadiz") {
        return { date: date || "", shipName, adults, children, fromPlanner };
      }
      return {
        date: date || ctx.date || "",
        shipName: shipName || ctx.shipName || "",
        adults,
        children,
        fromPlanner,
      };
    }
  } catch {
    /* ignore */
  }
  return { date, shipName, adults, children, fromPlanner };
}

function GuestStepper({
  label,
  hint,
  value,
  onChange,
  min,
  canIncrease,
  valueLabel,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  canIncrease: boolean;
  valueLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-coastal-100 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-coastal-200 text-lg text-coastal-900 disabled:opacity-40"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={`Fewer ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="min-w-[4.5rem] text-center font-display text-lg font-semibold text-coastal-900">
          {valueLabel ?? value}
        </span>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-coastal-200 text-lg text-coastal-900 disabled:opacity-40"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          aria-label={`More ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function RequestBookingEngine({
  product,
  shipsByDate,
}: {
  product: BookableProductConfig;
  shipsByDate: BookingShipsByDate;
}) {
  const storageKey = bookingSessionStorageKey(cadizBookingCore, product.id);
  const scheduleDates = useMemo(() => new Set(Object.keys(shipsByDate)), [shipsByDate]);
  const runtime = getBookingRuntime();
  const [state, setState] = useState<EngineState>(() => ({
    step: "cruise",
    date: "",
    ship: null,
    customShipName: "",
    unlistedShip: false,
    guests: { adults: Math.max(1, product.capacity.minGuests), children: 0, infants: 0 },
    customer: { name: "", email: "", phone: "", operationalNotes: "" },
    passengers: [],
    acknowledged: false,
    bookingSessionId: "",
    submitting: false,
    error: null,
  }));
  const hydrated = useRef(false);
  const skipNextPush = useRef(true);
  const submitLock = useRef(false);
  const persistReady = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    trackBookingEvent("booking_started", { productId: product.id });
    const prefill = readPrefill();
    if (prefill.fromPlanner) {
      trackPlannerEvent("planner_booking_started", { productId: product.id, source: "planner_landing" });
    }
    const urlStep = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("step") : null;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EngineState>;
        const guests = parsed.guests && typeof parsed.guests === "object" ? parsed.guests : undefined;
        setState((current) => ({
          ...current,
          ...parsed,
          guests: guests ?? current.guests,
          submitting: false,
          error: null,
          bookingSessionId: parsed.bookingSessionId || createBookingSessionId(),
          step: isStepId(urlStep) ? urlStep : parsed.step || current.step,
        }));
        persistReady.current = true;
        return;
      }
    } catch {
      /* ignore */
    }
    const newSessionId = createBookingSessionId();
    const guestPrefill =
      prefill.adults || prefill.children
        ? {
            // Adult places only until child pricing is commercially confirmed.
            adults: Math.max(1, ((prefill.adults ?? 0) + (prefill.children ?? 0)) || product.capacity.minGuests),
            children: 0,
            infants: 0,
          }
        : null;
    if (prefill.date || prefill.shipName) {
      const ships = shipsForDate(shipsByDate, prefill.date);
      const matched = ships.find((item) => item.name.toLowerCase() === prefill.shipName.toLowerCase()) ?? null;
      setState((current) => ({
        ...current,
        date: prefill.date,
        ship: matched,
        customShipName: matched ? "" : prefill.shipName,
        unlistedShip: Boolean(prefill.shipName) && !matched,
        guests: guestPrefill ?? current.guests,
        step: isStepId(urlStep) ? urlStep : current.step,
        bookingSessionId: newSessionId,
      }));
    } else if (guestPrefill) {
      setState((current) => ({
        ...current,
        guests: guestPrefill,
        step: isStepId(urlStep) ? urlStep : current.step,
        bookingSessionId: newSessionId,
      }));
    } else if (isStepId(urlStep)) {
      setState((current) => ({ ...current, step: urlStep, bookingSessionId: newSessionId }));
    } else {
      setState((current) => ({ ...current, bookingSessionId: newSessionId }));
    }
    persistReady.current = true;
  }, [product, shipsByDate, storageKey]);

  useEffect(() => {
    if (!hydrated.current || !persistReady.current || typeof window === "undefined") return;
    const { submitting, error, ...persistable } = state;
    void submitting;
    void error;
    window.sessionStorage.setItem(storageKey, JSON.stringify(persistable));
  }, [state, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const step = new URLSearchParams(window.location.search).get("step");
      if (isStepId(step)) {
        skipNextPush.current = true;
        setState((current) => ({ ...current, step, error: null }));
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      const url = new URL(window.location.href);
      if (url.searchParams.get("step") !== state.step) {
        url.searchParams.set("step", state.step);
        window.history.replaceState({ step: state.step }, "", url);
      }
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("step") === state.step) return;
    url.searchParams.set("step", state.step);
    window.history.pushState({ step: state.step }, "", url);
  }, [state.step]);

  const ships = shipsForDate(shipsByDate, state.date);
  const dateCheck = state.date
    ? validateBookingDate(state.date, cadizBookingCore.bookableWindow, scheduleDates)
    : null;

  const resolvedShip: BookingShipVisit | null = (() => {
    if (state.unlistedShip && state.customShipName.trim()) return customShipVisit(state.customShipName);
    if (state.date) {
      if (ships.length === 1 && dateCheck?.ok && dateCheck.inSchedule && !state.unlistedShip) return ships[0];
      if (state.ship && ships.some((item) => item.slug === state.ship?.slug && item.name === state.ship?.name)) {
        return state.ship;
      }
    }
    if (state.ship) return state.ship;
    if (state.customShipName.trim()) return customShipVisit(state.customShipName);
    return null;
  })();

  const quote = calculateBookingQuote(product, state.guests);
  const remainingCapacity = product.capacity.maxGuestsPerBooking - partySize(state.guests);

  function go(step: StepId) {
    setState((current) => ({ ...current, step, error: null }));
  }

  function continueFromCruise() {
    if (!dateCheck || !dateCheck.ok) {
      setState((current) => ({
        ...current,
        error: dateCheck && !dateCheck.ok ? dateCheck.message : "Choose your cruise date.",
      }));
      return;
    }
    if (ships.length > 1 && !state.unlistedShip && !state.ship) {
      setState((current) => ({ ...current, error: "Please choose the ship you are arriving on." }));
      return;
    }
    const ship = resolvedShip;
    const cruiseError = validateCruise({
      date: state.date,
      shipName: ship?.name ?? "",
      shipSlug: ship?.slug ?? "",
      cruiseLine: ship?.cruiseLine ?? "",
      isCustomShip: ship ? isCustomBookingShip(ship) : true,
      scheduleMatched: dateCheck.inSchedule,
    });
    if (cruiseError) {
      setState((current) => ({ ...current, error: cruiseError }));
      return;
    }
    trackBookingEvent("cruise_selected", { productId: product.id, date: state.date });
    go("guests");
  }

  function continueFromGuests() {
    try {
      calculateBookingQuote(product, state.guests);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Please check your guest numbers.",
      }));
      return;
    }
    trackBookingEvent("guests_selected", {
      productId: product.id,
      guests: partySize(state.guests),
      adults: state.guests.adults,
      children: state.guests.children,
      infants: state.guests.infants,
    });
    setState((current) => ({
      ...current,
      passengers: productRequiresPassengers(product)
        ? syncPassengerRows(partySize(current.guests), current.passengers)
        : [],
    }));
    go("details");
  }

  function continueFromDetails() {
    const message = validateCustomer(state.customer);
    if (message) {
      setState((current) => ({ ...current, error: message }));
      return;
    }
    const passengerError = validatePassengers(product, state.guests, state.passengers);
    if (passengerError) {
      setState((current) => ({ ...current, error: passengerError }));
      return;
    }
    // Never put passport fields into analytics.
    trackBookingEvent("details_completed", {
      productId: product.id,
      passengersRequired: productRequiresPassengers(product),
      passengerCount: productRequiresPassengers(product) ? partySize(state.guests) : 0,
    });
    trackBookingEvent("checkout_started", { productId: product.id });
    go("pay");
  }

  async function submit() {
    if (state.submitting || submitLock.current) return;
    submitLock.current = true;
    if (!state.acknowledged) {
      submitLock.current = false;
      setState((current) => ({
        ...current,
        error: "Please confirm you understand this is a request, not a confirmed booking.",
      }));
      return;
    }
    if (!resolvedShip || !dateCheck?.ok) {
      submitLock.current = false;
      setState((current) => ({ ...current, error: "Please complete your cruise details." }));
      return;
    }
    setState((current) => ({ ...current, submitting: true, error: null }));
    if (getBookingRuntime() === "preview" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("sim") === "payfail") {
      setState((current) => ({
        ...current,
        submitting: false,
        error: "Payment was unsuccessful. No booking request was sent and no money was taken.",
      }));
      submitLock.current = false;
      return;
    }
    const result = await submitBookingRequest({
      product,
      quote,
      payload: {
        productId: product.id,
        bookingSessionId: state.bookingSessionId,
        guests: state.guests,
        customer: state.customer,
        passengers: productRequiresPassengers(product) ? state.passengers : undefined,
        cruise: {
          date: state.date,
          shipName: resolvedShip.name,
          shipSlug: resolvedShip.slug,
          cruiseLine: resolvedShip.cruiseLine,
          isCustomShip: isCustomBookingShip(resolvedShip),
          arrival: resolvedShip.arrival,
          departure: resolvedShip.departure,
          scheduleMatched: Boolean(dateCheck.inSchedule),
        },
        confirmationAcknowledged: true,
        clientDisplayedTotalCents: quote.amountCents,
      },
    });
    if (!result.ok) {
      submitLock.current = false;
      setState((current) => ({ ...current, submitting: false, error: result.message }));
      return;
    }
    if (result.checkoutUrl) {
      trackBookingEvent("stripe_checkout_created", {
        productId: product.id,
        reference: result.reference,
        sessionId: result.sessionId,
      });
      window.location.assign(result.checkoutUrl);
      return;
    }
    trackBookingEvent("booking_request_submitted", { productId: product.id, preview: result.preview });
    window.location.assign(result.receivedPath);
  }

  const stepIndex = STEPS.findIndex((item) => item.id === state.step);
  const adultBand = product.ageBands.find((band) => band.id === "adult");
  const childBand = product.ageBands.find((band) => band.id === "child");
  const infantBand = product.ageBands.find((band) => band.id === "infant");
  const flatGuests = usesFlatGuestPricing(product);
  const atMaxGuests = remainingCapacity <= 0;
  const runtimeBanner =
    runtime === "test"
      ? "Stripe TEST mode — live cards cannot be charged. This is a booking request, not a confirmed excursion."
      : runtime !== "live"
        ? "Preview booking environment — no payment is taken and requests are not sent to the local partner."
        : null;

  return (
    <div className="mx-auto max-w-2xl">
      {runtimeBanner && (
        <p className="mb-5 rounded-2xl border border-autumn-400/50 bg-autumn-300/15 px-4 py-3 text-sm leading-relaxed text-gray-800">
          {runtimeBanner}
        </p>
      )}

      <p className="text-sm text-gray-600">
        <Link href={product.productPath} className="text-coastal-800 hover:underline">
          ← {product.name}
        </Link>
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        {REQUEST_COPY.bookingEngineHeading}
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-gray-600">{REQUEST_COPY.supporting}</p>
      <p className="mt-2 font-display text-lg text-coastal-900">{product.name}</p>

      <ol className="mt-8 grid grid-cols-4 gap-2">
        {STEPS.map((item, index) => (
          <li key={item.id} className="min-w-0">
            <p
              className={`rounded-full px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] ${
                index <= stepIndex ? "bg-coastal-800 text-white" : "bg-coastal-50 text-coastal-800"
              }`}
            >
              {item.label}
            </p>
          </li>
        ))}
      </ol>

      {state.error && (
        <p className="mt-5 rounded-xl border border-maple-500/30 bg-maple-500/5 px-4 py-3 text-sm text-maple-600" role="alert">
          {state.error}
        </p>
      )}

      {state.step === "cruise" && (
        <section className="mt-8 space-y-5">
          <div className="rounded-3xl border border-coastal-100 bg-white p-5 shadow-sm sm:p-6">
            <DateField
              id="cruise-date"
              label="Cruise date"
              inputClassName={dateInputClass}
              min={cadizBookingCore.bookableWindow.start}
              max={cadizBookingCore.bookableWindow.end}
              value={state.date}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  date: event.target.value,
                  ship: null,
                  unlistedShip: false,
                  error: null,
                }))
              }
            />
            {dateCheck && !dateCheck.ok && <p className="mt-2 text-sm text-maple-600">{dateCheck.message}</p>}
            {dateCheck?.ok && dateCheck.warning && <p className="mt-2 text-sm text-gray-600">{dateCheck.warning}</p>}
          </div>

          {state.date && dateCheck?.ok && ships.length === 1 && dateCheck.inSchedule && !state.unlistedShip && (
            <div className="rounded-3xl border border-coastal-100 bg-coastal-50/80 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coastal-700">Your ship</p>
              <p className="mt-1 font-display text-xl text-coastal-900">{ships[0].name}</p>
              <p className="mt-1 text-sm text-gray-600">
                {ships[0].cruiseLine}
                {ships[0].arrival && ships[0].departure ? ` · in port ${ships[0].arrival}–${ships[0].departure}` : ""}
              </p>
            </div>
          )}

          {state.date && dateCheck?.ok && ships.length > 1 && !state.unlistedShip && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-800">Which ship are you arriving on?</legend>
              {ships.map((ship) => (
                <label
                  key={`${ship.slug}-${ship.name}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    state.ship?.slug === ship.slug && state.ship?.name === ship.name
                      ? "border-coastal-800 bg-coastal-50"
                      : "border-coastal-100 bg-white hover:border-coastal-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="ship"
                    className="mt-1"
                    checked={state.ship?.slug === ship.slug && state.ship?.name === ship.name}
                    onChange={() =>
                      setState((current) => ({ ...current, ship, customShipName: "", unlistedShip: false, error: null }))
                    }
                  />
                  <span>
                    <span className="block font-medium text-gray-900">{ship.name}</span>
                    <span className="block text-xs text-gray-500">
                      {ship.cruiseLine}
                      {ship.arrival && ship.departure ? ` · ${ship.arrival}–${ship.departure}` : ""}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {state.date && dateCheck?.ok && (
            <div className="rounded-3xl border border-dashed border-coastal-200 bg-white p-5">
              <label className="flex items-start gap-3 text-sm text-gray-800">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={state.unlistedShip || (ships.length === 0 && dateCheck.inSchedule === false)}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      unlistedShip: event.target.checked,
                      ship: event.target.checked ? null : current.ship,
                      error: null,
                    }))
                  }
                />
                <span>
                  <span className="font-medium">My ship isn&apos;t listed</span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                    You can still send a request. Tell us the ship name so we can check with our local partner.
                  </span>
                </span>
              </label>
              {(state.unlistedShip || ships.length === 0) && (
                <div className="mt-4">
                  <label htmlFor="custom-ship" className="block text-sm font-medium text-gray-800">
                    Cruise ship name
                  </label>
                  <input
                    id="custom-ship"
                    className={fieldClass}
                    value={state.customShipName}
                    placeholder="e.g. Celebrity Ascent"
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        customShipName: event.target.value,
                        unlistedShip: true,
                        ship: null,
                        error: null,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          )}

          <button type="button" className="btn-primary w-full sm:w-auto" onClick={continueFromCruise}>
            Continue
          </button>
        </section>
      )}

      {state.step === "guests" && (
        <section className="mt-8 space-y-4">
          {state.date && resolvedShip && (
            <p className="text-sm text-gray-600">
              {formatIsoDate(state.date)} · {resolvedShip.name}
            </p>
          )}
          {flatGuests ? (
            <>
              <h2 className="font-display text-2xl font-semibold text-gray-900">{REQUEST_COPY.guestsHeading}</h2>
              <GuestStepper
                label="Adults"
                hint={`Adult places · child pricing not yet confirmed · ${formatUnitPrice(product.pricing.pricePerGuest ?? product.pricing.adultAmount, product.pricing.currency)} each`}
                value={state.guests.adults}
                valueLabel={`${state.guests.adults} adult${state.guests.adults === 1 ? "" : "s"}`}
                min={product.capacity.minGuests}
                canIncrease={!atMaxGuests}
                onChange={(adults) =>
                  setState((current) => ({
                    ...current,
                    guests: { adults, children: 0, infants: 0 },
                    error: null,
                  }))
                }
              />
              {atMaxGuests && (
                <div className="rounded-3xl border border-coastal-100 bg-coastal-50/80 px-5 py-5">
                  <h3 className="font-display text-lg font-semibold text-gray-900">
                    {REQUEST_COPY.groupOverMaxTitle(product.capacity.maxGuestsPerBooking)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{REQUEST_COPY.groupOverMaxBody}</p>
                  <Link
                    href={`/enquire?excursion=${encodeURIComponent(product.name)}`}
                    className="btn-secondary mt-4 inline-flex"
                  >
                    {REQUEST_COPY.groupOverMaxCta}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <GuestStepper
                label={adultBand?.label ?? "Adults"}
                hint={
                  adultBand?.minAge != null
                    ? `Ages ${adultBand.minAge}${adultBand.maxAge != null ? `–${adultBand.maxAge}` : "+"} · ${formatUnitPrice(product.pricing.adultAmount, product.pricing.currency)} each`
                    : `${formatUnitPrice(product.pricing.adultAmount, product.pricing.currency)} each`
                }
                value={state.guests.adults}
                min={1}
                canIncrease={!atMaxGuests}
                onChange={(adults) =>
                  setState((current) => ({ ...current, guests: { ...current.guests, adults }, error: null }))
                }
              />
              <GuestStepper
                label={childBand?.label ?? "Children"}
                hint="Price to be confirmed — not charged as an adult"
                value={state.guests.children}
                min={0}
                canIncrease={!atMaxGuests}
                onChange={(children) =>
                  setState((current) => ({ ...current, guests: { ...current.guests, children }, error: null }))
                }
              />
              <GuestStepper
                label={infantBand?.label ?? "Infants"}
                hint="Price to be confirmed — not charged as an adult"
                value={state.guests.infants}
                min={0}
                canIncrease={!atMaxGuests}
                onChange={(infants) =>
                  setState((current) => ({ ...current, guests: { ...current.guests, infants }, error: null }))
                }
              />
              <p className="text-sm leading-relaxed text-gray-600">{REQUEST_COPY.childPricingNote}</p>
            </>
          )}
          <p className="price-amount text-2xl font-semibold text-coastal-900">{formatQuoteTotal(quote)}</p>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => go("cruise")}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={continueFromGuests}>
              Continue
            </button>
          </div>
        </section>
      )}

      {state.step === "details" && (
        <section className="mt-8 space-y-4">
          <div>
            <label htmlFor="lead-name" className="block text-sm font-medium text-gray-800">
              Lead passenger name
            </label>
            <input
              id="lead-name"
              className={fieldClass}
              autoComplete="name"
              value={state.customer.name}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  customer: { ...current.customer, name: event.target.value },
                  error: null,
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="lead-email" className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              className={fieldClass}
              autoComplete="email"
              value={state.customer.email}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  customer: { ...current.customer, email: event.target.value },
                  error: null,
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-800">
              Mobile / WhatsApp
            </label>
            <input
              id="lead-phone"
              type="tel"
              className={fieldClass}
              autoComplete="tel"
              value={state.customer.phone}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  customer: { ...current.customer, phone: event.target.value },
                  error: null,
                }))
              }
            />
          </div>

          {productRequiresPassengers(product) && (
            <div className="space-y-4 rounded-2xl border border-coastal-100 bg-coastal-50/60 p-4 sm:rounded-3xl sm:p-5">
              <div>
                <h3 className="font-display text-base font-semibold text-gray-900 sm:text-lg">Passport details for every guest</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Required for Cathedral and Real Alcázar admission. Enter details exactly as on each passport. Every guest must carry a valid passport on the day.
                </p>
              </div>
              {state.passengers.map((passenger, index) => (
                <fieldset key={index} className="space-y-3 rounded-xl border border-coastal-100 bg-white p-3 sm:rounded-2xl sm:p-4">
                  <legend className="px-1 text-sm font-semibold text-gray-900">Guest {index + 1}</legend>
                  <div>
                    <label className="block text-sm font-medium text-gray-800" htmlFor={`pax-name-${index}`}>Full name</label>
                    <input
                      id={`pax-name-${index}`}
                      className={fieldClass}
                      autoComplete="off"
                      value={passenger.fullName}
                      onChange={(event) =>
                        setState((current) => {
                          const passengers = [...current.passengers];
                          passengers[index] = { ...passengers[index], fullName: event.target.value };
                          return { ...current, passengers, error: null };
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800" htmlFor={`pax-pass-${index}`}>Passport number</label>
                    <input
                      id={`pax-pass-${index}`}
                      className={fieldClass}
                      autoComplete="off"
                      value={passenger.passportNumber}
                      onChange={(event) =>
                        setState((current) => {
                          const passengers = [...current.passengers];
                          passengers[index] = { ...passengers[index], passportNumber: event.target.value };
                          return { ...current, passengers, error: null };
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-800" htmlFor={`pax-dob-${index}`}>Date of birth</label>
                      <input
                        id={`pax-dob-${index}`}
                        type="date"
                        className={fieldClass}
                        autoComplete="off"
                        value={passenger.dateOfBirth}
                        onChange={(event) =>
                          setState((current) => {
                            const passengers = [...current.passengers];
                            passengers[index] = { ...passengers[index], dateOfBirth: event.target.value };
                            return { ...current, passengers, error: null };
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800" htmlFor={`pax-nat-${index}`}>Nationality</label>
                      <input
                        id={`pax-nat-${index}`}
                        className={fieldClass}
                        autoComplete="off"
                        value={passenger.nationality}
                        onChange={(event) =>
                          setState((current) => {
                            const passengers = [...current.passengers];
                            passengers[index] = { ...passengers[index], nationality: event.target.value };
                            return { ...current, passengers, error: null };
                          })
                        }
                      />
                    </div>
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="ops-notes" className="block text-sm font-medium text-gray-800">
              Accessibility or operational notes <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              id="ops-notes"
              className={`${fieldClass} min-h-24`}
              value={state.customer.operationalNotes ?? ""}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  customer: { ...current.customer, operationalNotes: event.target.value },
                  error: null,
                }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">Shared with the local partner only where it helps operate the tour.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => go("guests")}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={continueFromDetails}>
              Continue
            </button>
          </div>
        </section>
      )}

      {state.step === "pay" && !resolvedShip && (
        <section className="mt-8 space-y-4">
          <p className="text-sm text-maple-700">Please complete your cruise date and ship before paying.</p>
          <button type="button" className="btn-secondary" onClick={() => go("cruise")}>
            Back to cruise details
          </button>
        </section>
      )}

      {state.step === "pay" && resolvedShip && (
        <section className="mt-8 space-y-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {REQUEST_COPY.reviewHeading}
          </h2>
          <dl className="overflow-hidden divide-y divide-coastal-100 rounded-3xl border border-coastal-100 bg-white text-sm shadow-sm">
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-gray-500">Excursion</dt>
              <dd className="text-right font-medium text-gray-900">{product.name}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-gray-500">Date</dt>
              <dd className="text-right font-medium text-gray-900">{formatIsoDate(state.date)}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-gray-500">Ship</dt>
              <dd className="text-right font-medium text-gray-900">{resolvedShip.name}</dd>
            </div>
            <div className="px-5 py-4">
              <dt className="text-gray-500">Guests</dt>
              <dd className="mt-2 space-y-1 text-gray-900">
                {flatGuests ? (
                  <p className="flex justify-between gap-4">
                    <span>
                      {quote.partySize} guest{quote.partySize === 1 ? "" : "s"}
                    </span>
                    <span className="price-amount">{formatUnitPrice(quote.breakdown.adults.unitMajor, quote.currency)} each</span>
                  </p>
                ) : (
                  <>
                    <p className="flex justify-between gap-4">
                      <span>
                        {state.guests.adults} adult{state.guests.adults === 1 ? "" : "s"}
                      </span>
                      <span className="price-amount">{formatUnitPrice(quote.breakdown.adults.unitMajor, quote.currency)} each</span>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>
                        {state.guests.children} child{state.guests.children === 1 ? "" : "ren"}
                      </span>
                      <span className="price-amount">{formatUnitPrice(quote.breakdown.children.unitMajor, quote.currency)}</span>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>
                        {state.guests.infants} infant{state.guests.infants === 1 ? "" : "s"}
                      </span>
                      <span className="price-amount">{formatUnitPrice(quote.breakdown.infants.unitMajor, quote.currency)}</span>
                    </p>
                  </>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-gray-500">Lead passenger</dt>
              <dd className="text-right font-medium text-gray-900">{state.customer.name}</dd>
            </div>
            {productRequiresPassengers(product) && (
              <div className="flex justify-between gap-4 px-5 py-4">
                <dt className="text-gray-500">Passport details</dt>
                <dd className="text-right font-medium text-gray-900">
                  Collected for {partySize(state.guests)} guest{partySize(state.guests) === 1 ? "" : "s"}
                </dd>
              </div>
            )}

            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-gray-500">Mobile</dt>
              <dd className="text-right font-medium text-gray-900">{state.customer.phone}</dd>
            </div>
            <div className="flex justify-between gap-4 bg-coastal-50/70 px-5 py-4">
              <dt className="font-medium text-gray-700">Total</dt>
              <dd className="price-amount text-right text-2xl font-semibold text-coastal-900">{formatQuoteTotal(quote)}</dd>
            </div>
          </dl>
          {quote.pricingNeedsConfirmation && (
            <p className="text-sm leading-relaxed text-gray-600">{REQUEST_COPY.childPricingNote}</p>
          )}

          <div className="rounded-3xl border border-coastal-100 bg-coastal-50/80 px-5 py-5">
            <h3 className="font-display text-xl font-semibold text-gray-900">{REQUEST_COPY.subjectToConfirmationTitle}</h3>
            <div className="mt-2 space-y-2">
              {REQUEST_COPY.subjectToConfirmationParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <label className="flex gap-3 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={state.acknowledged}
              onChange={(event) => setState((current) => ({ ...current, acknowledged: event.target.checked, error: null }))}
            />
            <span>{REQUEST_COPY.consentLabel}</span>
          </label>

          {runtime === "test" ? (
            <p className="text-xs text-gray-500">You will continue to Stripe hosted Checkout in TEST mode. Live cards cannot be charged.</p>
          ) : (
            <p className="text-xs text-gray-500">
              Preview payment: a successful charge is simulated here. No card is requested and no Stripe key is used.
            </p>
          )}

          {runtime === "preview" && (
            <p className="text-xs text-gray-500">
              To preview a failed payment, add <code>?sim=payfail</code> to this page URL.
            </p>
          )}

          <div className="hidden flex-col gap-3 sm:flex sm:flex-row">
            <button type="button" className="btn-secondary" onClick={() => go("details")} disabled={state.submitting}>
              Back
            </button>
            <button type="button" className="btn-primary sm:flex-1" onClick={() => void submit()} disabled={state.submitting}>
              {state.submitting ? "Starting payment…" : formatPayRequestCta(quote)}
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:hidden">
            <button type="button" className="btn-secondary" onClick={() => go("details")} disabled={state.submitting}>
              Back
            </button>
          </div>
          <div className="sticky bottom-3 z-20 sm:hidden">
            <button
              type="button"
              className="btn-primary w-full shadow-lg"
              onClick={() => void submit()}
              disabled={state.submitting}
            >
              {state.submitting ? "Starting payment…" : formatPayRequestCta(quote)}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
