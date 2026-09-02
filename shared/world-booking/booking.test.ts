import assert from "node:assert/strict";
import { test } from "node:test";
import { findCadizBookingProduct, CADIZ_BOOKING_PRODUCTS } from "../destinations/cadiz-products";
import {
  calculateBookingQuote,
  PricingError,
  statusAfterPaymentSuccess,
  isConfirmedStatus,
  paymentActionAfterDecline,
  supplierRequestEmail,
  supplierRoutingIsPlaceholder,
  canSendSupplierEmail,
  validateBookingDate,
  createIdempotencyKey,
  checkoutIdempotencyMaterial,
  customerStatusLabel,
  usesFlatGuestPricing,
  sellingPricePerGuest,
  requestedCustomerEmail,
  destinationBrandFromCore,
  productRequiresPassengers,
} from "./index";
import type { BookableProductConfig } from "./types";
import { cadizBookingCore } from "../destinations/cadiz";

const brand = destinationBrandFromCore(cadizBookingCore);

const overall = findCadizBookingProduct("small-group-seville");
const value = findCadizBookingProduct("seville-on-your-own");
assert.ok(overall);
assert.ok(value);

test("Cadiz Seville products use flat per-adult EUR pricing", () => {
  for (const product of CADIZ_BOOKING_PRODUCTS) {
    assert.equal(product.pricing.model, "flat_per_guest");
    assert.equal(usesFlatGuestPricing(product), true);
    assert.equal(product.pricing.currency, "EUR");
    assert.equal(product.capacity.maxGuestsPerBooking, 8);
    assert.equal(product.capacity.maxGuestsPerBookingSource, "approved");
    assert.equal(product.bookingMode, "request");
  }
  assert.equal(sellingPricePerGuest(value), 88);
  assert.equal(sellingPricePerGuest(overall), 229);
});

test("authoritative totals: 1 × 88, 2 × 229", () => {
  assert.equal(calculateBookingQuote(value, { adults: 1, children: 0, infants: 0 }).amountMajor, 88);
  assert.equal(calculateBookingQuote(value, { adults: 2, children: 0, infants: 0 }).amountMajor, 176);
  assert.equal(calculateBookingQuote(overall, { adults: 1, children: 0, infants: 0 }).amountMajor, 229);
  assert.equal(calculateBookingQuote(overall, { adults: 2, children: 0, infants: 0 }).amountMajor, 458);
});

test("party size uses product capacity", () => {
  assert.throws(
    () => calculateBookingQuote(value, { adults: 9, children: 0, infants: 0 }),
    (error: unknown) => error instanceof PricingError && error.code === "GUEST_LIMIT",
  );
});

test("requested is not confirmed", () => {
  const status = statusAfterPaymentSuccess("request");
  assert.equal(status, "requested");
  assert.equal(isConfirmedStatus(status), false);
  assert.match(customerStatusLabel(status), /awaiting confirmation/i);
});

test("decline payment action is refund", () => {
  assert.equal(paymentActionAfterDecline("charge_refund"), "refund");
});

test("supplier routing is production-ready for Wow A Tour ops mailbox", () => {
  assert.equal(supplierRoutingIsPlaceholder(value), false);
  assert.equal(canSendSupplierEmail(value, "live"), true);
  assert.equal(canSendSupplierEmail(value, "test"), false);
});

test("ops email never includes passport numbers even when product requires them", () => {
  assert.equal(productRequiresPassengers(overall), true);
  const email = supplierRequestEmail({
    reference: "W2CDZ-TEST",
    product: overall,
    cruise: {
      date: "2026-06-15",
      shipName: "Test Ship",
      shipSlug: "test-ship",
      cruiseLine: "Test",
      isCustomShip: false,
      scheduleMatched: true,
    },
    guests: { adults: 2, children: 0, infants: 0 },
    customer: { name: "Ada Lovelace", email: "ada@example.com", phone: "+441234567890" },
    amountLabel: "€458",
    passengerDetailsCount: 2,
  });
  assert.match(email.body, /Passenger details required/);
  assert.match(email.body, /Review booking/);
  assert.doesNotMatch(email.body, /AB1234567/);
  assert.doesNotMatch(email.body, /passportNumber/i);
});

test("customer requested email uses Cadiz brand", () => {
  const mail = requestedCustomerEmail({
    reference: "W2CDZ-TEST",
    product: value,
    cruise: {
      date: "2026-06-15",
      shipName: "Test Ship",
      shipSlug: "test-ship",
      cruiseLine: "Test",
      isCustomShip: false,
      scheduleMatched: true,
    },
    guests: { adults: 1, children: 0, infants: 0 },
    amountLabel: "€88",
    customerName: "Ada Lovelace",
    brand,
  });
  assert.match(mail.shell.eyebrow, /Cadiz/);
  assert.doesNotMatch(mail.shell.preheader + mail.bodyLines.join(" "), /passport/i);
});

test("booking date validation window", () => {
  const ok = validateBookingDate("2027-06-15", cadizBookingCore.bookableWindow, new Set(["2027-06-15"]));
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.inSchedule, true);
});

test("idempotency material is stable", () => {
  const material = checkoutIdempotencyMaterial({
    productId: value.id,
    date: "2026-06-15",
    shipSlug: "test-ship",
    adults: 2,
    children: 0,
    infants: 0,
    email: "ada@example.com",
    bookingSessionId: "session-1",
  });
  assert.equal(createIdempotencyKey(material), createIdempotencyKey(material));
});

test("child pricing remains needs_confirmation on catalogue", () => {
  for (const product of CADIZ_BOOKING_PRODUCTS) {
    assert.equal(product.pricing.childPricingStatus, "needs_confirmation");
    assert.equal(product.pricing.childAmount, null);
  }
});

test("typed product config still satisfies BookableProductConfig", () => {
  const sample: BookableProductConfig = value;
  assert.equal(sample.destinationId, "cadiz");
});
