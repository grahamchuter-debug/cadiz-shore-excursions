-- Encrypted sensitive passenger details (passport etc).
-- Plaintext must never be stored. Ciphertext is AES-256-GCM (Worker secret key).
-- Independently redactable without deleting the booking/payment/audit record.

ALTER TABLE bookings ADD COLUMN passengers_encrypted TEXT;
ALTER TABLE bookings ADD COLUMN passengers_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN passengers_redacted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_passengers_pending
  ON bookings(passengers_redacted_at, cruise_date)
  WHERE passengers_encrypted IS NOT NULL;
