import assert from "node:assert/strict";
import { test } from "node:test";
import { recommendBookableProducts } from "./planner-recommendations";
import type { PlannerInput } from "./planner";

const base: PlannerInput = {
  arrivalTime: "08:00",
  departureTime: "18:00",
  adults: 2,
  children: 0,
  interests: ["seville"],
  mobility: "full",
  budget: "mid",
  style: "mix",
};

test("seville guided day prefers best-overall", () => {
  const result = recommendBookableProducts(
    { ...base, interests: ["seville", "history"], style: "guided" },
    "seville",
    10,
  );
  assert.ok(result.primary);
  assert.equal(result.primary!.productId, "best-overall");
});

test("independent-leaning seville prefers best-value", () => {
  const result = recommendBookableProducts({ ...base, style: "diy", budget: "budget" }, "seville", 10);
  assert.ok(result.primary);
  assert.equal(result.primary!.productId, "best-value");
});

test("short port day flags independent note for Seville", () => {
  const result = recommendBookableProducts(base, "seville", 5);
  assert.equal(result.independentDay, true);
  assert.match(result.independentNote ?? "", /long/i);
});
