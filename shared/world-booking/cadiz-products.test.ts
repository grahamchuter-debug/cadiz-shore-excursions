import assert from "node:assert/strict";
import { test } from "node:test";
import { CADIZ_BOOKING_PRODUCTS, findCadizBookingProduct } from "../destinations/cadiz-products";
import { cadizBookingCore } from "../destinations/cadiz";
import {
  assertClientTotalMatches,
  calculateBookingQuote,
  productRequiresPassengers,
  redactPassengersFromPayload,
  stripPassengersFromAnalyticsPayload,
  validatePassengers,
} from "./index";

test("cadiz catalogue has exactly two request products at authoritative EUR prices", () => {
  assert.equal(CADIZ_BOOKING_PRODUCTS.length, 2);
  const value = findCadizBookingProduct("seville-on-your-own");
  const overall = findCadizBookingProduct("small-group-seville");
  assert.ok(value);
  assert.ok(overall);
  assert.equal(value!.pricing.currency, "EUR");
  assert.equal(overall!.pricing.currency, "EUR");
  assert.equal(value!.pricing.pricePerGuest, 88);
  assert.equal(overall!.pricing.pricePerGuest, 229);
  assert.equal(cadizBookingCore.currencyCode, "EUR");
});

test("passport requirement is product-driven — only Product 2", () => {
  const value = findCadizBookingProduct("seville-on-your-own")!;
  const overall = findCadizBookingProduct("small-group-seville")!;
  assert.equal(productRequiresPassengers(value), false);
  assert.equal(productRequiresPassengers(overall), true);
  assert.deepEqual(overall.requiredPassengerFields, [
    "fullName",
    "passportNumber",
    "dateOfBirth",
    "nationality",
  ]);
  assert.equal(validatePassengers(value, { adults: 2, children: 0, infants: 0 }, undefined), null);
  assert.match(
    validatePassengers(value, { adults: 1, children: 0, infants: 0 }, [
      { fullName: "A", passportNumber: "X", dateOfBirth: "1990-01-01", nationality: "GB" },
    ]) ?? "",
    /does not require/,
  );
});

test("Product 2 validates per-guest passport fields", () => {
  const overall = findCadizBookingProduct("small-group-seville")!;
  const guests = { adults: 2, children: 0, infants: 0 };
  assert.match(validatePassengers(overall, guests, undefined) ?? "", /passport details/);
  assert.match(
    validatePassengers(overall, guests, [
      { fullName: "Ada Lovelace", passportNumber: "AB1234567", dateOfBirth: "1990-01-01", nationality: "GB" },
    ]) ?? "",
    /all 2/,
  );
  assert.equal(
    validatePassengers(overall, guests, [
      { fullName: "Ada Lovelace", passportNumber: "AB1234567", dateOfBirth: "1990-01-01", nationality: "GB" },
      { fullName: "Alan Turing", passportNumber: "CD9876543", dateOfBirth: "1991-02-02", nationality: "GB" },
    ]),
    null,
  );
});

test("price tamper rejection for both products", () => {
  for (const product of CADIZ_BOOKING_PRODUCTS) {
    const quote = calculateBookingQuote(product, { adults: 2, children: 0, infants: 0 });
    assert.equal(quote.currency, "EUR");
    assert.throws(() => assertClientTotalMatches(quote, quote.amountCents + 100));
    assert.doesNotThrow(() => assertClientTotalMatches(quote, quote.amountCents));
  }
});

test("passport fields never enter analytics payloads", () => {
  const stripped = stripPassengersFromAnalyticsPayload({
    productId: "small-group-seville",
    passengers: [{ passportNumber: "SECRET" }],
    passportNumber: "SECRET",
  });
  assert.equal("passengers" in stripped, false);
  assert.equal("passportNumber" in stripped, false);
  assert.equal(stripped.productId, "small-group-seville");
});

test("payload redaction hides passport numbers", () => {
  const redacted = redactPassengersFromPayload({
    passengers: [{ fullName: "Ada", passportNumber: "SECRET123", dateOfBirth: "1990-01-01", nationality: "GB" }],
  }) as { passengers: string };
  assert.equal(redacted.passengers, "[redacted:1]");
});
