#!/usr/bin/env node
/**
 * Validate internal href paths against static routes and known dynamic slugs.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "out") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?|mjs)$/.test(name)) files.push(p);
  }
  return files;
}

const appDir = join(ROOT, "src/app");
const validPaths = new Set(["/"]);

function collectRoutes(dir, base = "") {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name.startsWith("_") || name === "api") continue;
      const segment = name.startsWith("(") ? "" : name.startsWith("[") ? "" : `/${name}`;
      collectRoutes(p, `${base}${segment}`);
    } else if (name === "page.tsx" || name === "page.ts") {
      validPaths.add(base || "/");
    }
  }
}

collectRoutes(appDir);

function loadSlugsFromTs(relativePath, arrayName) {
  const text = readFileSync(join(ROOT, relativePath), "utf8");
  const slugMatches = [...text.matchAll(/slug:\s*"([^"]+)"/g)];
  return [...new Set(slugMatches.map((m) => m[1]))];
}

const excursionSlugs = loadSlugsFromTs("src/data/excursions.ts", "excursions");
const attractionSlugs = loadSlugsFromTs("src/data/attractions.ts", "attractions");
const guideSlugs = loadSlugsFromTs("src/data/guides.ts", "guides");
const schedulePortSlugs = loadSlugsFromTs("src/data/schedules.ts", "schedulePorts");

const dynamicPatterns = [
  /^\/shore-excursions\/[\w-]+$/,
  /^\/ship-schedules\/[\w-]+$/,
  /^\/ship-schedules\/[\w-]+\/(2026|2027)$/,
  /^\/ship-schedules\/[\w-]+\/(january|february|march|april|may|june|july|august|september|october|november|december)-20(26|27)$/,
];

for (const slug of excursionSlugs) validPaths.add(`/shore-excursions/${slug}`);
for (const slug of attractionSlugs) validPaths.add(`/${slug}`);
for (const slug of guideSlugs) validPaths.add(`/${slug}`);
for (const slug of schedulePortSlugs) {
  validPaths.add(`/ship-schedules/${slug}`);
  for (const year of ["2026", "2027"]) {
    validPaths.add(`/ship-schedules/${slug}/${year}`);
  }
}

function isValidPath(path) {
  if (validPaths.has(path)) return true;
  return dynamicPatterns.some((re) => re.test(path));
}

const srcFiles = walk(join(ROOT, "src"));
const hrefPattern = /href=["'](\/[^"'#?]*)/g;
const failures = [];

for (const file of srcFiles) {
  const text = readFileSync(file, "utf8");
  const rel = file.replace(ROOT + "/", "");
  let match;
  while ((match = hrefPattern.exec(text)) !== null) {
    let path = match[1];
    if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
    if (!isValidPath(path)) {
      failures.push(`${rel}: broken internal link ${path}`);
    }
  }
}

if (failures.length) {
  console.error("Link check FAILED:\n");
  [...new Set(failures)].forEach((f) => console.error("  -", f));
  process.exit(1);
}

console.log(
  `Link check passed (${validPaths.size} known routes, ${srcFiles.length} files scanned).`,
);
