#!/usr/bin/env node
/**
 * Verify public/images commercial assets + provenance registry.
 * Legacy unknown-provenance files may live only under public/images/deprecated/.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const ROOT = join(import.meta.dirname, "..");
const DIR = join(ROOT, "public/images");
const DEPRECATED = join(DIR, "deprecated");

const ALLOWED = new Set([
  "logo-mark.svg",
  "seville-plaza-espana-hero.jpg",
  "seville-plaza-espana-canal.jpg",
  "seville-old-town-street.jpg",
  "seville-street-cafe.jpg",
  "seville-torre-del-oro.jpg",
  "seville-cathedral-giralda.jpg",
  "seville-giralda-detail.jpg",
  "seville-alcazar-hero.jpg",
  "seville-alcazar-gardens.jpg",
  "seville-alcazar-garden-view.jpg",
  "cadiz-cathedral-waterfront.jpg",
  "cadiz-cathedral-coast.jpg",
  "andalusia-vejer-white-village.jpg",
  "andalusia-vejer-street.jpg",
  "seville-flamenco.jpg",
  "seville-tapas-bar.jpg",
]);

const FORBIDDEN_PREFIXES = [
  "guggenheim",
  "bilbao",
  "barcelona",
  "pintxos",
  "txakoli",
  "gaudi",
  "sagrada",
  "montjuic",
  "ramblas",
  "gaztelugatxe",
  "gernika",
  "rioja",
  "san-sebastian",
  "park-guell",
  "gothic-quarter",
  "hop-on-hop-off",
  "favicon",
];

let ok = true;

for (const name of readdirSync(DIR)) {
  const full = join(DIR, name);
  if (statSync(full).isDirectory()) continue;
  const lower = name.toLowerCase();
  if (FORBIDDEN_PREFIXES.some((p) => lower.includes(p))) {
    console.error(`FORBIDDEN leftover: ${name}`);
    ok = false;
  }
  if (!ALLOWED.has(name)) {
    console.error(`Unexpected file in public/images: ${name}`);
    ok = false;
  }
}

for (const name of ALLOWED) {
  try {
    statSync(join(DIR, name));
  } catch {
    console.error(`Missing required image: ${name}`);
    ok = false;
  }
}

// Provenance: every commercial JPG must have an IMAGE_CREDITS entry
const require = createRequire(import.meta.url);
let creditsKeys = [];
try {
  // Dynamic import of TS via reading keys from file text (avoid build dependency)
  const creditsSrc = readFileSync(join(ROOT, "src/data/image-credits.ts"), "utf8");
  const keys = [...creditsSrc.matchAll(/imageKey:\s*"([^"]+)"/g)].map((m) => m[1]);
  creditsKeys = keys;
} catch (err) {
  console.error("Could not read image-credits.ts", err);
  ok = false;
}

for (const name of ALLOWED) {
  if (!name.endsWith(".jpg")) continue;
  const key = name.replace(/\.jpg$/, "");
  if (!creditsKeys.includes(key)) {
    console.error(`Missing IMAGE_CREDITS entry for commercial asset: ${key}`);
    ok = false;
  }
}

const svg = readFileSync(join(DIR, "logo-mark.svg"), "utf8");
if (/bilbao|barcelona|basque country/i.test(svg)) {
  console.error("logo-mark.svg still references another port brand");
  ok = false;
}

if (existsSync(DEPRECATED)) {
  const legacy = readdirSync(DEPRECATED).filter((n) => /\.jpe?g$/i.test(n));
  console.log(`Deprecated legacy images retained (not public-mapped): ${legacy.length}`);
}

if (ok) {
  console.log(`Image audit passed — ${ALLOWED.size} approved Cadiz World 2.0 assets + provenance.`);
} else {
  process.exit(1);
}
