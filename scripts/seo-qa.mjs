#!/usr/bin/env node
/**
 * Post-implementation SEO QA for Cadiz Shore Excursions static export.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "out");
const SITE_URL = "https://cadizshoreexcursions.com";
const CANONICAL_HOST = "cadizshoreexcursions.com";

const results = [];
const pass = (msg) => results.push({ status: "PASS", msg });
const fail = (msg) => results.push({ status: "FAIL", msg });
const info = (msg) => results.push({ status: "INFO", msg });

function walkHtml(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, files);
    else if (name.endsWith(".html")) files.push(p);
  }
  return files;
}

function readText(path) {
  return readFileSync(path, "utf8");
}

// 1. Build output exists
if (!existsSync(OUT)) {
  fail("out/ directory missing — run npm run build first");
} else {
  pass("Production build output (out/) exists");
}

// 2. noindex on important pages
const htmlFiles = walkHtml(OUT);
const noindexPages = [];
const indexedPages = [];
for (const file of htmlFiles) {
  const rel = file.replace(OUT, "").replace(/\\/g, "/").replace(/\/index\.html$/, "/").replace(/\.html$/, "/");
  const html = readText(file);
  const isNoindex = /noindex/i.test(html) && /robots/i.test(html);
  const isLegal = rel.includes("/privacy") || rel.includes("/terms");
  const is404 = rel.includes("404") || rel.includes("_not-found");
  if (isNoindex) noindexPages.push(rel);
  else if (!is404) indexedPages.push(rel);
  if (isNoindex && !isLegal && !is404) {
    fail(`Unexpected noindex on public page: ${rel}`);
  }
}
if (noindexPages.filter((p) => p.includes("privacy") || p.includes("terms")).length >= 2) {
  pass("Privacy and Terms correctly use noindex");
}
const important = ["/", "/shore-excursions/", "/cruise-port-guide/", "/cruise-planner/", "/faq/", "/seville-from-cadiz-cruise-port/"];
for (const p of important) {
  if (indexedPages.some((ip) => ip === p || ip.endsWith(p))) pass(`Important page indexable: ${p}`);
  else fail(`Important page missing or noindex: ${p}`);
}

// 3. Canonical tags
let canonicalIssues = 0;
for (const file of htmlFiles.slice(0, 50)) {
  const html = readText(file);
  const canonMatch = html.match(/rel="canonical"[^>]*href="([^"]+)"/);
  if (canonMatch) {
    const url = canonMatch[1];
    if (!url.startsWith(SITE_URL)) {
      fail(`Non-preferred canonical: ${url} in ${file}`);
      canonicalIssues++;
    } else if (url.includes("www.")) {
      fail(`WWW in canonical: ${url}`);
      canonicalIssues++;
    }
  }
}
if (canonicalIssues === 0) pass("Canonical tags point to https://cadizshoreexcursions.com (non-www)");

// 4. Redirects file
const redirects = readText(join(ROOT, "public/_redirects"));
if (redirects.includes("www.cadizshoreexcursions.com") && redirects.includes("301")) {
  pass("WWW → non-WWW redirects configured in public/_redirects");
} else {
  fail("WWW → non-WWW redirects missing from public/_redirects");
}
if (redirects.includes("http://cadizshoreexcursions.com")) {
  pass("HTTP → HTTPS redirect fallback configured");
} else {
  info("HTTP → HTTPS handled by Cloudflare; defensive redirect present check optional");
}

// 5. Sitemap
const sitemapPath = join(OUT, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const sitemap = readText(sitemapPath);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const badUrls = urls.filter((u) => u.includes("www.") || !u.startsWith(SITE_URL));
  const hasPrivacy = urls.some((u) => u.includes("/privacy"));
  const hasTerms = urls.some((u) => u.includes("/terms"));
  if (badUrls.length === 0) pass(`Sitemap contains ${urls.length} canonical URLs`);
  else fail(`Sitemap has non-canonical URLs: ${badUrls.join(", ")}`);
  if (!hasPrivacy && !hasTerms) pass("Sitemap excludes noindex legal pages (privacy, terms)");
  else fail("Sitemap incorrectly includes privacy/terms");
} else {
  fail("sitemap.xml missing from out/");
}

// 6. robots.txt
const robotsPath = join(OUT, "robots.txt");
if (existsSync(robotsPath)) {
  const robots = readText(robotsPath);
  if (/Allow:\s*\//i.test(robots) || !/Disallow:\s*\//.test(robots)) {
    pass("robots.txt allows public pages to be crawled");
  } else {
    fail("robots.txt may block crawling");
  }
  if (robots.includes("sitemap")) pass("robots.txt references sitemap");
} else {
  fail("robots.txt missing from out/");
}

// 7. Duplicate titles
const titles = new Map();
for (const file of htmlFiles) {
  const html = readText(file);
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const t = titleMatch[1].trim();
    const rel = file.replace(OUT, "");
    if (!titles.has(t)) titles.set(t, []);
    titles.get(t).push(rel);
  }
}
const dupes = [...titles.entries()].filter(([t, files]) => files.length > 1 && !t.includes("404"));
if (dupes.length === 0) pass("No duplicate page titles detected");
else dupes.forEach(([t, files]) => fail(`Duplicate title "${t}": ${files.join(", ")}`));

// 8. JSON-LD validation (basic)
let jsonLdCount = 0;
let jsonLdErrors = 0;
for (const file of htmlFiles) {
  const html = readText(file);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const m of scripts) {
    jsonLdCount++;
    try {
      const data = JSON.parse(m[1]);
      if (!data["@context"] || !data["@type"]) jsonLdErrors++;
    } catch {
      jsonLdErrors++;
    }
  }
}
if (jsonLdErrors === 0) pass(`JSON-LD valid in ${jsonLdCount} blocks sampled across pages`);
else fail(`JSON-LD parse/structure errors: ${jsonLdErrors}`);

// 9. Open Graph basics on homepage
const homeHtml = existsSync(join(OUT, "index.html")) ? readText(join(OUT, "index.html")) : "";
if (homeHtml.includes('property="og:title"') && homeHtml.includes('property="og:url"')) {
  pass("Open Graph metadata present on homepage");
} else {
  fail("Open Graph metadata missing on homepage");
}

// 10. Intentional non-indexable
info("Intentional noindex pages: /privacy/, /terms/, 404/not-found");
info("Intentional redirects: www→non-www, http→https via Cloudflare + _redirects");

// Summary
console.log("\n=== SEO QA Report ===\n");
for (const r of results) {
  console.log(`[${r.status}] ${r.msg}`);
}
const failures = results.filter((r) => r.status === "FAIL");
console.log(`\n${results.filter((r) => r.status === "PASS").length} passed, ${failures.length} failed, ${results.filter((r) => r.status === "INFO").length} informational`);
process.exit(failures.length ? 1 : 0);
