import assert from "node:assert/strict";
import { test } from "node:test";
import { cadizBookingCore } from "../destinations/cadiz";
import { findCadizBookingProduct } from "../destinations/cadiz-products";
import {
  calculateBookingQuote,
  confirmedCustomerEmail,
  declinedCustomerEmail,
  destinationBrandFromCore,
  PricingError,
  renderCustomerBookingEmailHtml,
  renderOpsRequestEmailHtml,
  requestedCustomerEmail,
  supplierRequestEmail,
  usesFlatGuestPricing,
} from "./index";

const brand = destinationBrandFromCore(cadizBookingCore);
const past = findCadizBookingProduct("seville-on-your-own");
assert.ok(past);

test("customer email shell renders premium HTML without markdown artefacts", () => {
  const mail = requestedCustomerEmail({
    reference: "W2CDZ-MAILTEST",
    product: past,
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: true,
    },
    guests: { adults: 1, children: 0, infants: 0 },
    amountLabel: "€75",
    customerName: "Alex Traveller",
    brand,
  });
  const html = renderCustomerBookingEmailHtml(mail.shell);
  assert.match(html, /We've received your excursion request/);
  assert.match(html, /Payment received · Awaiting confirmation/);
  assert.match(html, /Alex/);
  assert.match(html, /Monday, 15 June 2026/);
  assert.match(html, /hello@cadizshoreexcursions.com/);
  assert.doesNotMatch(html, /###/);
  assert.doesNotMatch(html, /\*\*/);
});

test("ops email removes markdown headings and includes review link when provided", () => {
  const email = supplierRequestEmail({
    reference: "W2CDZ-OPSLINK",
    product: past,
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: true,
    },
    guests: { adults: 2, children: 0, infants: 0 },
    customer: { name: "Alex Traveller", email: "alex@example.com", phone: "+447700900123" },
    amountLabel: "€150",
    reviewUrl: "https://bookings.test/operator/review?ref=W2CDZ-OPSLINK&t=abc123",
  });
  const html = renderOpsRequestEmailHtml(email.shell);
  assert.match(email.subject, /ACTION REQUIRED — Cadiz booking request — W2CDZ-OPSLINK/);
  assert.match(html, /Review booking/);
  assert.match(html, /Paid · Supplier confirmation required/);
  assert.match(html, /Alex Traveller/);
  assert.doesNotMatch(email.body, /###/);
  assert.doesNotMatch(html, /###/);
});

test("confirmed and declined emails use status badges and refund wording", () => {
  const confirmed = confirmedCustomerEmail({
    reference: "W2CDZ-CONF",
    product: past,
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: true,
    },
    guests: { adults: 2, children: 0, infants: 0 },
    amountLabel: "€150",
    customerName: "Alex Traveller",
    brand,
  });
  const declined = declinedCustomerEmail({
    reference: "W2CDZ-DECL",
    product: past,
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: true,
    },
    guests: { adults: 2, children: 0, infants: 0 },
    amountLabel: "€150",
    customerName: "Alex Traveller",
    refundState: "refunded",
    brand,
  });
  assert.match(renderCustomerBookingEmailHtml(confirmed.shell), /Your Seville shore excursion is confirmed/);
  assert.match(renderCustomerBookingEmailHtml(declined.shell), /couldn't confirm your excursion/);
  assert.match(renderCustomerBookingEmailHtml(declined.shell), /Refunded/);
  assert.match(renderCustomerBookingEmailHtml(declined.shell), /refunded .* in full to your original payment method/i);
});

test("flat per-guest pricing still applies", () => {
  assert.equal(usesFlatGuestPricing(past), true);
  assert.equal(calculateBookingQuote(past, { adults: 4, children: 0, infants: 0 }).amountMajor, 352);
  assert.throws(
    () => calculateBookingQuote(past, { adults: 9, children: 0, infants: 0 }),
    (error: unknown) => error instanceof PricingError && error.code === "GUEST_LIMIT",
  );
});
