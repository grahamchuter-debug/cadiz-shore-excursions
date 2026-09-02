/**
 * World 2.0 sensitive passenger-data encryption (AES-256-GCM via Web Crypto).
 *
 * Plaintext passport payloads must never be written to D1, Stripe metadata,
 * analytics, emails, public APIs, or Worker logs.
 *
 * Key material: Worker secret PASSENGER_DATA_ENCRYPTION_KEY
 * (32-byte key, base64-encoded). Never commit or expose to the browser.
 */

import type { BookingPassenger } from "../../../shared/world-booking/types";

const ALGORITHM = "AES-GCM";
const IV_BYTES = 12;
const VERSION_PREFIX = "w2pax1";

export type EncryptedPassengerBlob = {
  /** Opaque ciphertext package: version.iv.ciphertext (base64url segments). */
  ciphertext: string;
  passengerCount: number;
  algorithm: typeof ALGORITHM;
  version: typeof VERSION_PREFIX;
};

function requireKeyMaterial(raw: string | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) {
    throw new PassengerCryptoError(
      "MISSING_PASSENGER_KEY",
      "PASSENGER_DATA_ENCRYPTION_KEY is not configured.",
    );
  }
  return value;
}

function decodeKeyBytes(raw: string): Uint8Array {
  try {
    const binary = atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    if (bytes.byteLength !== 32) {
      throw new Error("key must decode to 32 bytes");
    }
    return bytes;
  } catch {
    throw new PassengerCryptoError(
      "INVALID_PASSENGER_KEY",
      "PASSENGER_DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
    );
  }
}

async function importAesKey(rawSecret: string): Promise<CryptoKey> {
  const keyBytes = decodeKeyBytes(requireKeyMaterial(rawSecret));
  return crypto.subtle.importKey("raw", keyBytes, { name: ALGORITHM }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export class PassengerCryptoError extends Error {
  constructor(
    public readonly code: "MISSING_PASSENGER_KEY" | "INVALID_PASSENGER_KEY" | "DECRYPT_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "PassengerCryptoError";
  }
}

/**
 * Encrypt passenger records before persistence.
 * Returns null when there are no passengers to store.
 */
export async function encryptPassengers(
  passengers: BookingPassenger[] | undefined,
  encryptionKey: string | undefined,
): Promise<EncryptedPassengerBlob | null> {
  if (!passengers?.length) return null;
  const key = await importAesKey(encryptionKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(passengers));
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, plaintext);
  const ciphertext = new Uint8Array(encrypted);
  return {
    ciphertext: `${VERSION_PREFIX}.${toBase64Url(iv)}.${toBase64Url(ciphertext)}`,
    passengerCount: passengers.length,
    algorithm: ALGORITHM,
    version: VERSION_PREFIX,
  };
}

/** Decrypt passenger records for authenticated operator review only. */
export async function decryptPassengers(
  blob: string | null | undefined,
  encryptionKey: string | undefined,
): Promise<BookingPassenger[]> {
  if (!blob?.trim()) return [];
  const parts = blob.trim().split(".");
  if (parts.length !== 3 || parts[0] !== VERSION_PREFIX) {
    throw new PassengerCryptoError("DECRYPT_FAILED", "Unrecognised passenger ciphertext format.");
  }
  try {
    const key = await importAesKey(encryptionKey);
    const iv = fromBase64Url(parts[1]!);
    const data = fromBase64Url(parts[2]!);
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
    const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as BookingPassenger[];
    if (!Array.isArray(parsed)) {
      throw new Error("payload is not an array");
    }
    return parsed;
  } catch (error) {
    if (error instanceof PassengerCryptoError) throw error;
    throw new PassengerCryptoError("DECRYPT_FAILED", "Could not decrypt passenger details.");
  }
}

/** True when a string looks like our ciphertext package (never log/decrypt casually). */
export function looksLikePassengerCiphertext(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  return parts.length === 3 && parts[0] === VERSION_PREFIX;
}
