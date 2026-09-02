import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("DateField World 2.0 standard", () => {
  it("uses the shared openNativeDatePicker helper", () => {
    const source = readFileSync("src/components/booking-engine/DateField.tsx", "utf8");
    assert.match(source, /openNativeDatePicker/);
    assert.match(source, /type="date"/);
    assert.match(source, /htmlFor=\{id\}/);
  });

  it("is wired into the request booking engine cruise step", () => {
    const engine = readFileSync("src/components/booking-engine/RequestBookingEngine.tsx", "utf8");
    assert.match(engine, /DateField/);
    assert.match(engine, /id="cruise-date"/);
  });
});
