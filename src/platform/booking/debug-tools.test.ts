import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { isBookingDebugToolsEnabled } from "./debug-tools.ts";

const ROOT = join(import.meta.dirname, "../../..");

describe("isBookingDebugToolsEnabled", () => {
  it("is false in production without explicit flag", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalFlag = process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS;
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS;
    assert.equal(isBookingDebugToolsEnabled(), false);
    process.env.NODE_ENV = originalNodeEnv;
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS;
    else process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS = originalFlag;
  });

  it("is true when NEXT_PUBLIC_BOOKING_DEBUG_TOOLS=true", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalFlag = process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS;
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS = "true";
    assert.equal(isBookingDebugToolsEnabled(), true);
    process.env.NODE_ENV = originalNodeEnv;
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS;
    else process.env.NEXT_PUBLIC_BOOKING_DEBUG_TOOLS = originalFlag;
  });
});

describe("RequestReceived public page", () => {
  const source = readFileSync(
    join(ROOT, "src/components/booking-engine/RequestReceived.tsx"),
    "utf8",
  );

  it("does not render internal debug panels", () => {
    assert.doesNotMatch(source, /Test operator simulations/);
    assert.doesNotMatch(source, /Customer emails \(preview only\)/);
    assert.doesNotMatch(source, /Supplier notification \(preview only\)/);
    assert.doesNotMatch(source, /postOperatorAction/);
  });

  it("keeps Stripe TEST banner via runtime check", () => {
    assert.match(source, /isTestPayments\(\)/);
    assert.match(source, /Stripe TEST environment/);
  });
});

describe("BookingReceivedDebug isolation", () => {
  const debugSource = readFileSync(
    join(ROOT, "src/components/booking-engine/BookingReceivedDebug.tsx"),
    "utf8",
  );
  const pageSource = readFileSync(
    join(ROOT, "src/app/book/[slug]/received/debug/page.tsx"),
    "utf8",
  );

  it("hosts operator simulations and email previews", () => {
    assert.match(debugSource, /Test operator simulations/);
    assert.match(debugSource, /Customer emails \(preview only\)/);
    assert.match(debugSource, /Supplier notification \(preview only\)/);
  });

  it("debug route is gated and not indexed", () => {
    assert.match(pageSource, /isBookingDebugToolsEnabled/);
    assert.match(pageSource, /noindex:\s*true/);
    assert.match(pageSource, /notFound\(\)/);
  });
});

describe("price-amount typography", () => {
  const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

  it("uses sans-serif tabular nums for currency strings", () => {
    assert.match(css, /\.price-amount/);
    assert.match(css, /font-family: var\(--font-sans\)/);
    assert.match(css, /tabular-nums/);
  });
});
