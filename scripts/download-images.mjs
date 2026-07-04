// Downloads Cadiz / Andalusia imagery from Wikimedia Commons into public/images.
import { writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { join } from "path";

const OUT = "public/images";
const FORCE = process.argv.includes("--force");
mkdirSync(OUT, { recursive: true });
const WIDTH = 1600;
const UA = "cadiz-shore-excursions/1.0 (image fetch; contact webmaster)";

/** Only images referenced by src/lib/images.ts (+ favicon) */
const targets = {
  "seville.jpg": ["Plaza de España Seville Spain", "Seville Alcazar Spain"],
  "old-town.jpg": ["Cadiz old town Spain street", "Plaza de las Flores Cadiz"],
  "cathedral.jpg": ["Catedral de Cádiz", "Cadiz cathedral golden dome"],
  "la-caleta.jpg": ["Playa de la Caleta Cadiz", "Castillo de Santa Catalina Cadiz beach"],
  "sherry.jpg": ["Bodegas Gonzalez Byass Jerez", "sherry barrels Jerez bodega"],
  "white-villages.jpg": ["Arcos de la Frontera Andalusia", "pueblo blanco Andalucia"],
  "vejer.jpg": ["Vejer de la Frontera Cadiz", "Vejer white village Spain"],
  "tapas.jpg": ["tapas Cadiz Mercado", "Andalusian seafood tapas Spain"],
  "markets.jpg": ["Mercado Central de Abastos Cadiz", "Lonja Cadiz market"],
  "flamenco.jpg": ["flamenco Jerez Andalusia", "bailaora flamenco Spain"],
  "city-highlights.jpg": ["Cadiz promenade Atlantic", "Cadiz waterfront Spain"],
  "private-tour.jpg": ["Cadiz guided tour", "Andalusia tour group Spain"],
  "family.jpg": ["La Caleta beach Cadiz family", "Cadiz beach promenade"],
  "cruise-port.jpg": ["Port of Cadiz cruise ship", "Cadiz Alfonso XIII pier"],
  "hero-home.jpg": ["Cadiz cathedral sea view", "Cadiz Atlantic waterfront panorama"],
  "og-default.jpg": ["Cadiz skyline cathedral", "Cadiz Andalusia coast aerial"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchThumb(term) {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo" +
    "&generator=search&gsrnamespace=6&gsrlimit=12" +
    `&gsrsearch=${encodeURIComponent(term)}` +
    `&iiprop=url|mime|size&iiurlwidth=${WIDTH}`;
  let res;
  for (let attempt = 0; attempt < 4; attempt++) {
    await sleep(600 + attempt * 800);
    try {
      res = await fetch(api, { headers: { "User-Agent": UA } });
      if (res.ok) break;
    } catch {}
    res = null;
  }
  if (!res || !res.ok) return [];
  const data = await res.json();
  const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
  pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  const landscape = [];
  const other = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/jpe?g/i.test(ii.mime || "")) continue;
    const url = ii.thumburl || ii.url;
    if ((ii.width || 0) >= (ii.height || 0)) landscape.push(url);
    else other.push(url);
  }
  return [...landscape, ...other];
}

async function grab(candidates) {
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 25000) continue;
      return { buf, url };
    } catch {}
  }
  return null;
}

async function main() {
  const kept = Object.keys(targets);
  console.log(`Cadiz image set: ${kept.length} files${FORCE ? " (force re-download)" : ""}`);

  for (const [file, terms] of Object.entries(targets)) {
    const dest = join(OUT, file);
    if (!FORCE && existsSync(dest) && statSync(dest).size > 25000) {
      console.log(`skip ${file} (exists)`);
      continue;
    }
    let candidates = [];
    for (const term of terms) {
      candidates.push(...(await searchThumb(term)));
      if (candidates.length >= 5) break;
    }
    candidates = [...new Set(candidates)];
    const got = await grab(candidates);
    if (got) {
      writeFileSync(dest, got.buf);
      console.log(`saved ${file}`);
    } else {
      console.warn(`FAILED ${file}`);
    }
  }
}

main();
