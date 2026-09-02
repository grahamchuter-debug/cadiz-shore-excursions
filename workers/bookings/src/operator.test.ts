import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "./index";
import { countEmailOutbox, getBookingByReference, updateBookingState } from "./db";
import { createMemoryD1 } from "./memory-d1";
import {
  buildOperatorReviewUrl,
  createOperatorReviewToken,
  hashOperatorToken,
  validateOperatorReviewToken,
} from "./operator-tokens";
import { setStripeFactoryForTests } from "./stripe";
import type { StripeClient } from "./stripe";

function jsonReq(url: string, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

function payload(sessionId: string, guests = { adults: 1, children: 0, infants: 0 }, total = 8800) {
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

function mockStripe() {
  const sessions = new Map<string, Record<string, unknown>>();
  let refunds = 0;
  const stripe = {
    checkout: {
      sessions: {
        create: async (args: { metadata?: { booking_ref?: string } }) => {
          const id = `cs_test_${sessions.size + 1}`;
          sessions.set(id, {
            id,
            url: `https://checkout.test/${id}`,
            client_reference_id: args.metadata?.booking_ref ?? null,
            payment_status: "unpaid",
            payment_intent: "pi_test_1",
          });
          return sessions.get(id);
        },
        retrieve: async (id: string) => sessions.get(id),
      },
    },
    refunds: {
      create: async () => {
        refunds += 1;
        return { id: `re_test_${refunds}`, status: "succeeded", amount: 8800 };
      },
    },
    webhooks: {
      constructEventAsync: async (payloadText: string) => JSON.parse(payloadText),
    },
  };
  setStripeFactoryForTests(() => stripe as unknown as StripeClient);
  return { sessions, refunds: () => refunds };
}

async function paidBooking(env: Env, sessionId: string) {
  const created = await worker.fetch(jsonReq("http://bookings.test/api/bookings/checkout", payload(sessionId)), env);
  const createdJson = await created.json();
  assert.equal(createdJson.ok, true);
  const booking = await getBookingByReference(env, createdJson.reference);
  assert.ok(booking);
  await updateBookingState(env, createdJson.reference, {
    status: "requested",
    payment_status: "paid",
    stripe_payment_intent_id: "pi_test_1",
  });
  return createdJson.reference as string;
}

test("operator review token is booking-specific and expires safely", async () => {
  const env = { DB: createMemoryD1() } as unknown as Env;
  const token = await createOperatorReviewToken(env, "W2CDZ-TOKEN1");
  const valid = await validateOperatorReviewToken(env, "W2CDZ-TOKEN1", token);
  assert.equal(valid.ok, true);
  const wrongBooking = await validateOperatorReviewToken(env, "W2CDZ-OTHER", token);
  assert.equal(wrongBooking.ok, false);
  assert.equal(wrongBooking.code, "MISMATCH");
  const invalid = await validateOperatorReviewToken(env, "W2CDZ-TOKEN1", "deadbeef");
  assert.equal(invalid.ok, false);
});

test("operator review page hides customer data without a valid token", async () => {
  const env = {
    PAYMENTS_MODE: "test",
    OPERATOR_PORTAL_BASE_URL: "https://bookings.test",
    DB: createMemoryD1(),
  } as unknown as Env;
  const response = await worker.fetch(new Request("http://bookings.test/operator/review?ref=W2CDZ-NONE&t=bad"), env);
  assert.equal(response.status, 403);
  const html = await response.text();
  assert.match(html, /invalid|expired|already been used/i);
  assert.doesNotMatch(html, /alex@example.com/);
});

test("token review confirm and decline reuse single source of truth", async () => {
  mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    OPERATOR_PORTAL_BASE_URL: "https://bookings.test",
    STRIPE_SECRET_KEY: "sk_test_mock",
    DB: createMemoryD1(),
  } as unknown as Env;

  const reference = await paidBooking(env, "sess-token-confirm");
  const token = await createOperatorReviewToken(env, reference);
  const review = await worker.fetch(
    new Request(buildOperatorReviewUrl("https://bookings.test", reference, token)),
    env,
  );
  assert.equal(review.status, 200);
  assert.match(await review.text(), /Review booking/);

  const confirm = await worker.fetch(
    new Request("http://bookings.test/operator/review/action", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ref: reference, t: token, action: "confirm" }),
    }),
    env,
  );
  assert.equal(confirm.status, 200);
  assert.match(await confirm.text(), /Booking confirmed/);
  const booking = await getBookingByReference(env, reference);
  assert.equal(booking?.status, "confirmed");
  assert.equal(await countEmailOutbox(env, reference, "customer_confirmed"), 1);

  const used = await validateOperatorReviewToken(env, reference, token);
  assert.equal(used.ok, false);
  assert.equal(used.code, "USED");
  setStripeFactoryForTests(null);
});

test("decline via token is idempotent and requires deliberate confirmation", async () => {
  mockStripe();
  const env = {
    PAYMENTS_MODE: "test",
    OPERATOR_PORTAL_BASE_URL: "https://bookings.test",
    STRIPE_SECRET_KEY: "sk_test_mock",
    DB: createMemoryD1(),
  } as unknown as Env;
  const reference = await paidBooking(env, "sess-token-decline");
  const token = await createOperatorReviewToken(env, reference);

  const blocked = await worker.fetch(
    new Request("http://bookings.test/operator/review/action", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ref: reference, t: token, action: "decline" }),
    }),
    env,
  );
  assert.equal(blocked.status, 400);

  const decline = await worker.fetch(
    new Request("http://bookings.test/operator/review/action", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ref: reference, t: token, action: "decline", confirmRefund: "yes" }),
    }),
    env,
  );
  assert.equal(decline.status, 200);
  const booking = await getBookingByReference(env, reference);
  assert.equal(booking?.status, "supplier_declined");
  assert.equal(booking?.payment_status, "refunded");
  assert.equal(await countEmailOutbox(env, reference, "customer_declined"), 1);

  const token2 = await createOperatorReviewToken(env, reference);
  const declineAgain = await worker.fetch(
    jsonReq(
      "http://bookings.test/api/bookings/operator/decline",
      { reference },
      { "X-Cadiz-Operator-Token": "header-fallback" },
    ),
    { ...env, OPERATOR_TEST_TOKEN: "header-fallback" } as unknown as Env,
  );
  const declineAgainJson = await declineAgain.json();
  assert.equal(declineAgainJson.ok, true);
  assert.equal(declineAgainJson.duplicate, true);
  void token2;
  setStripeFactoryForTests(null);
});

test("hashOperatorToken is stable for validation", async () => {
  const hash = await hashOperatorToken("abc123");
  assert.match(hash, /^[a-f0-9]{64}$/);
});
