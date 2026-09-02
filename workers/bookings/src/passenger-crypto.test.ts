import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decryptPassengers,
  encryptPassengers,
  looksLikePassengerCiphertext,
} from "./passenger-crypto";
import type { BookingPassenger } from "../../../shared/world-booking/types";

/** Fixed 32 zero bytes, base64 — stable unit-test key only. */
const TEST_KEY = btoa(String.fromCharCode(...new Array(32).fill(0)));

const passengers: BookingPassenger[] = [
  {
    fullName: "Ada Lovelace",
    passportNumber: "AB1234567",
    dateOfBirth: "1815-12-10",
    nationality: "GB",
  },
  {
    fullName: "Charles Babbage",
    passportNumber: "CD9876543",
    dateOfBirth: "1791-12-26",
    nationality: "GB",
  },
];

test("encryptPassengers / decryptPassengers round-trips passenger records", async () => {
  const blob = await encryptPassengers(passengers, TEST_KEY);
  assert.ok(blob);
  assert.equal(blob.passengerCount, 2);
  assert.equal(blob.algorithm, "AES-GCM");
  assert.equal(blob.version, "w2pax1");

  const restored = await decryptPassengers(blob.ciphertext, TEST_KEY);
  assert.deepEqual(restored, passengers);
});

test("ciphertext does not contain passport number plaintext", async () => {
  const blob = await encryptPassengers(passengers, TEST_KEY);
  assert.ok(blob);
  assert.doesNotMatch(blob.ciphertext, /AB1234567/);
  assert.doesNotMatch(blob.ciphertext, /CD9876543/);
  assert.doesNotMatch(blob.ciphertext, /passportNumber/i);
  assert.doesNotMatch(blob.ciphertext, /Ada Lovelace/);
});

test("looksLikePassengerCiphertext detects package format", async () => {
  const blob = await encryptPassengers(passengers, TEST_KEY);
  assert.ok(blob);
  assert.equal(looksLikePassengerCiphertext(blob.ciphertext), true);
  assert.equal(looksLikePassengerCiphertext(null), false);
  assert.equal(looksLikePassengerCiphertext(""), false);
  assert.equal(looksLikePassengerCiphertext("not-a-blob"), false);
  assert.equal(looksLikePassengerCiphertext("w2pax1.only"), false);
  assert.equal(looksLikePassengerCiphertext("other.a.b"), false);
});
