import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "./index";
import { countEmailOutbox, eventAlreadyProcessed, getBookingByReference, updateBookingState } from "./db";
import { createMemoryD1 } from "./memory-d1";
import { looksLikePassengerCiphertext } from "./passenger-crypto";
import { setStripeFactoryForTests } from "./stripe";
import { assertStripeTestSecret, StripeModeError } from "./stripe-guard";
import type { StripeClient } from "./stripe";

const previewEnv = { PAYMENTS_MODE: "preview", CORS_ALLOWED_ORIGINS: "http://localhost:3000" } as unknown as Env;

/** Stable 32-byte key (all 0x07) as base64 — tests only; never a production secret. */
const TEST_PASSENGER_KEY = btoa(String.fromCharCode(...new Array(32).fill(7)));

function createTestEnv(overrides: Record<string, unknown> = {}): Env {
  return {
    PAYMENTS_MODE: "test",
    BOOKINGS_ENABLED: "true",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    PASSENGER_DATA_ENCRYPTION_KEY: TEST_PASSENGER_KEY,
    DB: createMemoryD1(),
    ...overrides,
  } as unknown as Env;
}

function payload(sessionId: string, guests = { adults: 2, children: 0, infants: 0 }, total = 17600) {
  return {
    productId: "seville-on-your-own",
    bookingSessionId: sessionId,
    guests,
    customer: { name: "Alex Traveller", email: "alex@example.com", phone: "+447700900123" },
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: false,
    },
    confirmationAcknowledged: true,
    clientDisplayedTotalCents: total,
  };
}

function jsonReq(url: string, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

test("preview Worker records a requested booking and is idempotent", async () => {
  const sessionId = `sess-${Date.now()}`;
  const first = await worker.fetch(jsonReq("http://bookings.test/api/bookings/request", payload(sessionId)), previewEnv);
  const firstJson = await first.json();
  assert.equal(firstJson.ok, true);
  assert.equal(firstJson.status, "requested");
  assert.equal(firstJson.preview, true);
  assert.match(firstJson.reference, /^W2CDZ-/);

  const second = await worker.fetch(jsonReq("http://bookings.test/api/bookings/request", payload(sessionId)), previewEnv);
  const secondJson = await second.json();
  assert.equal(secondJson.reference, firstJson.reference);
});

test("live payments stay blocked until human review", async () => {
  const response = await worker.fetch(jsonReq("http://bookings.test/api/bookings/request", payload("sess-live")), {
    ...previewEnv,
    PAYMENTS_MODE: "live",
  } as unknown as Env);
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.code, "LIVE_PAYMENTS_BLOCKED");
});

test("client price tampering is rejected", async () => {
  const tampered = payload("sess-tamper");
  tampered.clientDisplayedTotalCents = 1;
  const response = await worker.fetch(jsonReq("http://bookings.test/api/bookings/request", tampered), previewEnv);
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.code, "PRICE");
});

test("assertStripeTestSecret rejects live keys and unknown secrets", () => {
  assert.equal(assertStripeTestSecret("sk_test_abc123"), "sk_test_abc123");
  assert.throws(
    () => assertStripeTestSecret("sk_live_abc123"),
    (error: unknown) => error instanceof StripeModeError && error.code === "LIVE_KEY_REJECTED",
  );
  assert.throws(
    () => assertStripeTestSecret("rk_live_abc123"),
    (error: unknown) => error instanceof StripeModeError && error.code === "LIVE_KEY_REJECTED",
  );
  assert.throws(
    () => assertStripeTestSecret("pk_test_abc"),
    (error: unknown) => error instanceof StripeModeError && error.code === "MISSING_TEST_KEY",
  );
});

test("assertStripeLiveSecret rejects TEST keys and unknown secrets", async () => {
  const { assertStripeLiveSecret } = await import("./stripe-guard");
  assert.equal(assertStripeLiveSecret("sk_live_abc123"), "sk_live_abc123");
  assert.throws(
    () => assertStripeLiveSecret("sk_test_abc123"),
    (error: unknown) => error instanceof StripeModeError && error.code === "TEST_KEY_REJECTED",
  );
  assert.throws(
    () => assertStripeLiveSecret("pk_live_abc"),
    (error: unknown) => error instanceof StripeModeError && error.code === "MISSING_LIVE_KEY",
  );
});

test("checkout fails closed when a live Stripe secret is supplied", async () => {
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_live_should_never_work",
    DB: createMemoryD1(),
  } as unknown as Env;
  const response = await worker.fetch(
    jsonReq("http://bookings.test/api/bookings/checkout", payload("sess-live-key", { adults: 4, children: 0, infants: 0 }, 35200)),
    env,
  );
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.code, "LIVE_KEY_REJECTED");
});

function mockStripe(options?: { paid?: boolean; refundStatus?: string }) {
  const paid = options?.paid ?? false;
  const sessions = new Map<string, { id: string; url: string; payment_status: string; payment_intent: string; client_reference_id: string }>();
  let created = 0;
  let refunds = 0;
  const stripe = {
    checkout: {
      sessions: {
        create: async () => {
          created += 1;
          const id = `cs_test_${created}`;
          const session = {
            id,
            url: `https://checkout.stripe.com/c/pay/${id}`,
            status: "open",
            payment_status: paid ? "paid" : "unpaid",
            payment_intent: `pi_test_${created}`,
            client_reference_id: "pending",
          };
          sessions.set(id, session);
          return session;
        },
        retrieve: async (id: string) => {
          const session = sessions.get(id);
          if (!session) throw new Error("unknown session");
          return session;
        },
      },
    },
    refunds: {
      create: async () => {
        refunds += 1;
        return {
          id: `re_test_${refunds}`,
          status: options?.refundStatus ?? "succeeded",
          amount: 35200,
        };
      },
    },
    webhooks: {
      constructEventAsync: async (payloadText: string) => JSON.parse(payloadText),
    },
  };
  setStripeFactoryForTests(() => stripe as unknown as StripeClient);
  return { stripe, sessions, created: () => created, refunds: () => refunds };
}

test("Stripe TEST checkout uses server price and is idempotent", async () => {
  const mock = mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    OPERATOR_TEST_TOKEN: "op-test",
    DB: createMemoryD1(),
  } as unknown as Env;
  const body = payload("sess-checkout-1", { adults: 4, children: 0, infants: 0 }, 35200);
  const first = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const firstJson = await first.json();
  assert.equal(firstJson.ok, true);
  assert.ok(firstJson.checkoutUrl);
  assert.match(firstJson.reference, /^W2CDZ-/);
  assert.equal(firstJson.status, "payment_pending");

  const second = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const secondJson = await second.json();
  assert.equal(secondJson.reference, firstJson.reference);
  assert.equal(secondJson.checkoutUrl, firstJson.checkoutUrl);
  assert.equal(mock.created(), 1);
  setStripeFactoryForTests(null);
});

test("checkout rejects a tampered client total", async () => {
  mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    DB: createMemoryD1(),
  } as unknown as Env;
  const body = payload("sess-tamper-co", { adults: 4, children: 0, infants: 0 }, 1);
  const response = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.code, "PRICE");
  setStripeFactoryForTests(null);
});

test("webhook payment success marks requested, never confirmed", async () => {
  mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
    DB: createMemoryD1(),
  } as unknown as Env;
  const body = payload("sess-hook", { adults: 1, children: 0, infants: 0 }, 8800);
  const created = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const createdJson = await created.json();
  const event = {
    id: "evt_test_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: createdJson.sessionId,
        payment_status: "paid",
        payment_intent: "pi_test_1",
        client_reference_id: createdJson.reference,
        metadata: { booking_ref: createdJson.reference },
        customer_details: {},
      },
    },
  };
  const webhook = await worker.fetch(
    new Request("http://bookings.test/api/stripe/webhook", {
      method: "POST",
      headers: { "Stripe-Signature": "test", "content-type": "application/json" },
      body: JSON.stringify(event),
    }),
    env,
  );
  const webhookJson = await webhook.json();
  assert.equal(webhookJson.ok, true);
  assert.equal(await eventAlreadyProcessed(env, "evt_test_1"), true);
  assert.equal(await countEmailOutbox(env, createdJson.reference, "customer_requested"), 1);
  // Cadiz ops routing is production_ready (info@wowatour.com) — ops email is queued.
  assert.equal(await countEmailOutbox(env, createdJson.reference, "ops_request"), 1);

  const session = await worker.fetch(
    new Request(`http://bookings.test/api/bookings/session?ref=${createdJson.reference}`),
    env,
  );
  const sessionJson = await session.json();
  assert.equal(sessionJson.status, "requested");
  assert.equal(sessionJson.payment_status, "paid");
  assert.notEqual(sessionJson.status, "confirmed");

  const duplicate = await worker.fetch(
    new Request("http://bookings.test/api/stripe/webhook", {
      method: "POST",
      headers: { "Stripe-Signature": "test", "content-type": "application/json" },
      body: JSON.stringify(event),
    }),
    env,
  );
  const duplicateJson = await duplicate.json();
  assert.equal(duplicateJson.duplicate, true);
  assert.equal(await countEmailOutbox(env, createdJson.reference, "customer_requested"), 1);
  assert.equal(await countEmailOutbox(env, createdJson.reference, "ops_request"), 1);
  assert.equal(await countEmailOutbox(env, createdJson.reference), 2);
  setStripeFactoryForTests(null);
});

test("GET session does not fulfil a paid Stripe session", async () => {
  mockStripe({ paid: true });
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    DB: createMemoryD1(),
  } as unknown as Env;
  const body = payload("sess-get-paid", { adults: 2, children: 0, infants: 0 }, 17600);
  const created = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const createdJson = await created.json();
  const session = await worker.fetch(
    new Request(`http://bookings.test/api/bookings/session?session_id=${createdJson.sessionId}&ref=${createdJson.reference}`),
    env,
  );
  const sessionJson = await session.json();
  assert.equal(sessionJson.ok, true);
  assert.equal(sessionJson.stripePaid, true);
  assert.equal(sessionJson.status, "payment_pending");
  assert.equal(sessionJson.payment_status, "unpaid");
  assert.equal(sessionJson.bookingFinalised, false);
  assert.equal(await countEmailOutbox(env, createdJson.reference), 0);
  setStripeFactoryForTests(null);
});

test("operator confirm does not refund; operator decline refunds the TEST payment", async () => {
  const mock = mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
    OPERATOR_TEST_TOKEN: "op-test",
    DB: createMemoryD1(),
  } as unknown as Env;
  const body = payload("sess-op", { adults: 4, children: 0, infants: 0 }, 35200);
  const created = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const createdJson = await created.json();
  assert.equal(createdJson.ok, true);
  const stored = mock.sessions.get(createdJson.sessionId);
  assert.ok(stored);
  stored.payment_status = "paid";
  stored.client_reference_id = createdJson.reference;
  await updateBookingState(env, createdJson.reference, {
    status: "requested",
    payment_status: "paid",
    stripe_payment_intent_id: "pi_test_1",
  });

  const confirm = await worker.fetch(
    jsonReq(
      "http://bookings.test/api/bookings/operator/confirm",
      { reference: createdJson.reference },
      { "X-Cadiz-Operator-Token": "op-test" },
    ),
    env,
  );
  const confirmJson = await confirm.json();
  assert.equal(confirmJson.ok, true);
  assert.equal(confirmJson.status, "confirmed");
  assert.equal(confirmJson.refunded, false);

  const declineEnv = {
    ...env,
    DB: createMemoryD1(),
  } as unknown as Env;
  const created2 = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", payload("sess-op-2", { adults: 4, children: 0, infants: 0 }, 35200)), declineEnv);
  const created2Json = await created2.json();
  const stored2 = mock.sessions.get(created2Json.sessionId);
  assert.ok(stored2);
  stored2.payment_status = "paid";
  stored2.client_reference_id = created2Json.reference;
  await updateBookingState(declineEnv, created2Json.reference, {
    status: "requested",
    payment_status: "paid",
    stripe_payment_intent_id: "pi_test_1",
  });

  const decline = await worker.fetch(
    jsonReq(
      "http://bookings.test/api/bookings/operator/decline",
      { reference: created2Json.reference },
      { "X-Cadiz-Operator-Token": "op-test" },
    ),
    declineEnv,
  );
  const declineJson = await decline.json();
  assert.equal(declineJson.ok, true);
  assert.equal(declineJson.status, "supplier_declined");
  assert.equal(declineJson.refunded, true);
  assert.equal(declineJson.refundId, "re_test_1");

  const declineAgain = await worker.fetch(
    jsonReq(
      "http://bookings.test/api/bookings/operator/decline",
      { reference: created2Json.reference },
      { "X-Cadiz-Operator-Token": "op-test" },
    ),
    declineEnv,
  );
  const declineAgainJson = await declineAgain.json();
  assert.equal(declineAgainJson.ok, true);
  assert.equal(declineAgainJson.duplicate, true);
  assert.equal(mock.refunds(), 1);
  setStripeFactoryForTests(null);
});

test("anonymous operator actions are forbidden", async () => {
  const env = {
    PAYMENTS_MODE: "test",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    OPERATOR_TEST_TOKEN: "op-test",
    DB: createMemoryD1(),
  } as unknown as Env;
  const response = await worker.fetch(
    jsonReq("http://bookings.test/api/bookings/operator/confirm", { reference: "W2CDZ-NONE" }),
    env,
  );
  const data = await response.json();
  assert.equal(response.status, 403);
  assert.equal(data.code, "OPERATOR_FORBIDDEN");
});

test("BOOKINGS_ENABLED=false stops Checkout", async () => {
  mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    BOOKINGS_ENABLED: "false",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    DB: createMemoryD1(),
  } as unknown as Env;
  const response = await worker.fetch(
    jsonReq("http://bookings.test/api/bookings/checkout", payload("sess-kill", { adults: 2, children: 0, infants: 0 }, 17600)),
    env,
  );
  const data = await response.json();
  assert.equal(data.ok, false);
  assert.equal(data.code, "BOOKINGS_DISABLED");
  setStripeFactoryForTests(null);
});

test("live Checkout passes when cutover gates are satisfied", async () => {
  const { liveCheckoutBlock, liveReadinessGaps, LIVE_PAYMENTS_CODE_ENABLED } = await import("./live-gate");
  const { findCadizBookingProduct } = await import("../../../shared/destinations/cadiz-products");
  assert.equal(LIVE_PAYMENTS_CODE_ENABLED, true);
  const product = findCadizBookingProduct("seville-on-your-own");
  assert.ok(product);

  const readyEnv = {
    PAYMENTS_MODE: "live",
    LIVE_PAYMENTS_UNLOCK: "CADIZ_LIVE_UNLOCK",
    BOOKINGS_ENABLED: "true",
    STRIPE_SECRET_KEY: "sk_live_fake",
    STRIPE_WEBHOOK_SECRET: "whsec_fake",
    SITE_BASE_URL: "https://cadizshoreexcursions.com",
    DB: createMemoryD1(),
  } as unknown as Env;

  assert.equal(liveCheckoutBlock(readyEnv, product), null);

  const gaps = liveReadinessGaps(readyEnv, product);
  assert.ok(!gaps.includes("live_code_flag"));
  assert.ok(!gaps.includes("supplier_routing"));
});

test("live Checkout is blocked by Cadiz code gate even when unlock is missing", async () => {
  mockStripe();
  const env = {
    PAYMENTS_MODE: "live",
    LIVE_PAYMENTS_UNLOCK: "",
    BOOKINGS_ENABLED: "true",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    SITE_BASE_URL: "https://cadizshoreexcursions.com",
    STRIPE_SECRET_KEY: "sk_live_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
    DB: createMemoryD1(),
  } as unknown as Env;
  const response = await worker.fetch(
    jsonReq("http://bookings.test/api/bookings/checkout", payload("sess-live-block", { adults: 1, children: 0, infants: 0 }, 8800)),
    env,
  );
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.code, "LIVE_UNLOCK_REQUIRED");
  setStripeFactoryForTests(null);
});

test("Product 2 checkout requires passenger passport details", async () => {
  mockStripe();
  const env = createTestEnv();
  const body = {
    productId: "small-group-seville",
    bookingSessionId: "sess-passport",
    guests: { adults: 1, children: 0, infants: 0 },
    customer: { name: "Alex Traveller", email: "alex@example.com", phone: "+447700900123" },
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: false,
    },
    confirmationAcknowledged: true,
    clientDisplayedTotalCents: 22900,
  };
  const missing = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const missingJson = await missing.json();
  assert.equal(missingJson.ok, false);
  assert.equal(missingJson.code, "PASSENGERS");

  const withPassengers = {
    ...body,
    bookingSessionId: "sess-passport-ok",
    passengers: [
      {
        fullName: "Alex Traveller",
        passportNumber: "AB1234567",
        dateOfBirth: "1990-01-01",
        nationality: "GB",
      },
    ],
  };
  const ok = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", withPassengers), env);
  const okJson = await ok.json();
  assert.equal(okJson.ok, true);
  assert.match(okJson.reference, /^W2CDZ-/);
  setStripeFactoryForTests(null);
});

test("Product 2 checkout encrypts passengers and never stores passport in payload_json", async () => {
  mockStripe();
  const env = createTestEnv();
  const passportNumber = "XY9988776";
  const body = {
    productId: "small-group-seville",
    bookingSessionId: "sess-pax-encrypt",
    guests: { adults: 1, children: 0, infants: 0 },
    customer: { name: "Alex Traveller", email: "alex@example.com", phone: "+447700900123" },
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: false,
    },
    confirmationAcknowledged: true,
    clientDisplayedTotalCents: 22900,
    passengers: [
      {
        fullName: "Alex Traveller",
        passportNumber,
        dateOfBirth: "1990-01-01",
        nationality: "GB",
      },
    ],
  };
  const created = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const createdJson = await created.json();
  assert.equal(createdJson.ok, true);

  const booking = await getBookingByReference(env, createdJson.reference);
  assert.ok(booking);
  assert.doesNotMatch(booking.payload_json, new RegExp(passportNumber));
  assert.equal(booking.passengers_count, 1);
  assert.ok(looksLikePassengerCiphertext(booking.passengers_encrypted));
  assert.doesNotMatch(booking.passengers_encrypted ?? "", new RegExp(passportNumber));
  assert.equal(booking.passengers_redacted_at, null);

  const session = await worker.fetch(
    new Request(`http://bookings.test/api/bookings/session?ref=${encodeURIComponent(createdJson.reference)}`),
    env,
  );
  const sessionJson = await session.json();
  const serialised = JSON.stringify(sessionJson);
  assert.doesNotMatch(serialised, new RegExp(passportNumber));
  assert.doesNotMatch(serialised, /passport/i);
  setStripeFactoryForTests(null);
});

test("session snapshot never returns passport details", async () => {
  mockStripe();
  const env = createTestEnv();
  const body = {
    productId: "small-group-seville",
    bookingSessionId: "sess-session-redact",
    guests: { adults: 1, children: 0, infants: 0 },
    customer: { name: "Alex Traveller", email: "alex@example.com", phone: "+447700900123" },
    cruise: {
      date: "2026-06-15",
      shipName: "Celebrity Ascent",
      shipSlug: "celebrity-ascent",
      cruiseLine: "Celebrity Cruises",
      isCustomShip: false,
      scheduleMatched: false,
    },
    confirmationAcknowledged: true,
    clientDisplayedTotalCents: 22900,
    passengers: [
      {
        fullName: "Alex Traveller",
        passportNumber: "SECRET999",
        dateOfBirth: "1990-01-01",
        nationality: "GB",
      },
    ],
  };
  const created = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", body), env);
  const createdJson = await created.json();
  assert.equal(createdJson.ok, true);
  const session = await worker.fetch(
    new Request(`http://bookings.test/api/bookings/session?ref=${encodeURIComponent(createdJson.reference)}`),
    env,
  );
  const sessionJson = await session.json();
  const serialised = JSON.stringify(sessionJson);
  assert.doesNotMatch(serialised, /SECRET999/);
  assert.doesNotMatch(serialised, /passport/i);
  setStripeFactoryForTests(null);
});
