#!/usr/bin/env node
/** Verify public/images contains only Cadiz-site image assets. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIR = join(ROOT, "public/images");

const ALLOWED = new Set([
  "logo-mark.svg",
  "hero-home.jpg",
  "og-default.jpg",
  "cruise-port.jpg",
  "seville.jpg",
  "old-town.jpg",
  "cathedral.jpg",
  "la-caleta.jpg",
  "sherry.jpg",
  "white-villages.jpg",
  "vejer.jpg",
  "tapas.jpg",
  "markets.jpg",
  "flamenco.jpg",
  "city-highlights.jpg",
  "private-tour.jpg",
  "family.jpg",
]);

const FORBIDDEN_PREFIXES = [
  "guggenheim", "bilbao", "barcelona", "pintxos", "txakoli", "gaudi",
  "sagrada", "montjuic", "ramblas", "gaztelugatxe", "gernika", "rioja",
  "san-sebastian", "park-guell", "gothic-quarter", "hop-on-hop-off",
  "airport", "hotel", "luggage", "transfer", "transport", "beaches",
  "coast", "favicon",
];

let ok = true;
for (const name of readdirSync(DIR)) {
  if (statSync(join(DIR, name)).isDirectory()) continue;
  const lower = name.toLowerCase();
  if (FORBIDDEN_PREFIXES.some((p) => lower.includes(p))) {
    console.error(`FORBIDDEN leftover: ${name}`);
    ok = false;
  }
  if (!ALLOWED.has(name)) {
    console.error(`Unexpected file: ${name}`);
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

const svg = readFileSync(join(DIR, "logo-mark.svg"), "utf8");
if (/bilbao|barcelona|basque country/i.test(svg)) {
  console.error("logo-mark.svg still references another port brand");
  ok = false;
}

if (ok) {
  console.log(`Image audit passed — ${ALLOWED.size} Cadiz/Andalusia assets only.`);
} else {
  process.exit(1);
}
