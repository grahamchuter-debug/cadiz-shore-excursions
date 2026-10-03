import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// NEXT_PUBLIC_* values are inlined into the static export, so a local or test
// booking setting here ships to customers: a loopback URL fails with "Failed to
// fetch" (and triggers Chrome's local-network prompt); a test Worker or runtime
// cannot take real payments. Production builds refuse both.
const REQUIRED_BOOKING_ENV: string[] = ["NEXT_PUBLIC_BOOKINGS_API_URL", "NEXT_PUBLIC_BOOKING_RUNTIME"];
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

function assertProductionBookingEnv() {
  if (process.env.ALLOW_NON_PRODUCTION_BOOKING_BUILD === "1") return;
  const problems: string[] = [];
  for (const key of REQUIRED_BOOKING_ENV) {
    if (!process.env[key]?.trim()) problems.push(`${key} is not set`);
  }
  for (const [key, raw] of Object.entries(process.env)) {
    const value = raw?.trim();
    if (!key.startsWith("NEXT_PUBLIC_") || !value) continue;
    if (key.endsWith("_API_URL")) {
      let url: URL | null = null;
      try {
        url = new URL(value);
      } catch {
        url = null;
      }
      if (!url || url.protocol !== "https:" || LOOPBACK_HOSTS.has(url.hostname)) {
        problems.push(`${key}=${value} is not a public https URL`);
      } else if (key.includes("_TEST_") || /(^|[-.])(test|staging|sandbox)([-.]|$)/i.test(url.hostname)) {
        problems.push(`${key}=${value} points at a test Worker`);
      }
    } else if (/_(RUNTIME|BOOKING_UI)$/.test(key) && value !== "live" && value !== "off") {
      problems.push(`${key}=${value} (production builds must use live or off)`);
    } else if (/OPERATOR_TOKEN|SECRET/.test(key)) {
      problems.push(`${key} is set and would be published in the site bundle`);
    } else if (key.endsWith("_DEBUG_TOOLS") && !["0", "false", "off"].includes(value)) {
      problems.push(`${key}=${value} would ship booking debug tools`);
    }
  }
  if (problems.length) {
    throw new Error(
      `Refusing production build: non-production booking settings\n  - ${problems.join("\n  - ")}\n` +
        "Check .env.production, and that .env.local / .env.production.local do not override it " +
        "(keep local settings in .env.development.local). " +
        "For a deliberate local or test build only, set ALLOW_NON_PRODUCTION_BOOKING_BUILD=1.",
    );
  }
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) assertProductionBookingEnv();
  return {
    output: "export",
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  };
}
