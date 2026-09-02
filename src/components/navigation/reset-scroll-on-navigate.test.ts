import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("product page scroll reset", () => {
  it("wires NavigationScrollReset into the root layout", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    assert.match(layout, /NavigationScrollReset/);
  });

  it("uses remounting templates for hub and root navigations", () => {
    const rootTemplate = readFileSync("src/app/template.tsx", "utf8");
    const hubTemplate = readFileSync("src/app/shore-excursions/template.tsx", "utf8");
    assert.match(rootTemplate, /scheduleScrollReset/);
    assert.match(hubTemplate, /scheduleScrollReset/);
  });

  it("skips reset when the URL contains a hash fragment", () => {
    const source = readFileSync("src/components/navigation/NavigationScrollReset.tsx", "utf8");
    assert.match(source, /location\.hash/);
  });

  it("uses instant scroll so global smooth scrolling cannot delay the reset", () => {
    const source = readFileSync("src/components/navigation/NavigationScrollReset.tsx", "utf8");
    assert.match(source, /behavior:\s*["']instant["']/);
    assert.match(source, /useLayoutEffect/);
  });

  it("resets scroll after internal link clicks for static-export navigations", () => {
    const source = readFileSync("src/components/navigation/NavigationScrollReset.tsx", "utf8");
    assert.match(source, /addEventListener\("click"/);
    assert.match(source, /setInterval\(onRouteChange/);
    assert.match(source, /scheduleScrollReset/);
  });
});
