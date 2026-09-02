import { imageManifest } from "@/data/image-manifest";

export type ImageRole = "hero" | "guide" | "card" | "thumbnail" | "og" | "gallery";

const SIZES: Record<ImageRole, string> = {
  hero: "100vw",
  guide: "100vw",
  gallery: "(max-width: 1024px) 100vw, 56vw",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  thumbnail: "(max-width: 640px) 45vw, 200px",
  og: "1200px",
};

const ROLE_MAX: Record<ImageRole, number> = {
  hero: 1920,
  guide: 1920,
  gallery: 1600,
  card: 800,
  thumbnail: 480,
  og: 1200,
};

function optPath(base: string, width: number, ext: string) {
  return `/images/opt/${base}-${width}w.${ext}`;
}

function widthsForRole(base: string, role: ImageRole): number[] {
  const entry = imageManifest[base as keyof typeof imageManifest];
  if (!entry) return [];
  const cap = ROLE_MAX[role];
  return [...entry.widths].filter((w) => w <= cap);
}

function buildSrcSet(base: string, role: ImageRole, ext: "avif" | "webp" | "jpg"): string {
  const widths = widthsForRole(base, role);
  if (widths.length === 0) return "";
  return widths.map((w) => `${optPath(base, w, ext)} ${w}w`).join(", ");
}

export interface ResponsiveSources {
  base: string;
  sizes: string;
  width: number;
  height: number;
  src: string;
  srcSetAvif: string;
  srcSetWebp: string;
  srcSetJpg: string;
  preloadAvif: string;
  preloadWebp: string;
}

export function getResponsiveSources(base: string, role: ImageRole): ResponsiveSources {
  const entry = imageManifest[base as keyof typeof imageManifest];
  const sizes = SIZES[role];
  const cap = ROLE_MAX[role];

  if (!entry) {
    return {
      base,
      sizes,
      width: 1200,
      height: 675,
      src: `/images/${base}.jpg`,
      srcSetAvif: "",
      srcSetWebp: "",
      srcSetJpg: "",
      preloadAvif: `/images/${base}.jpg`,
      preloadWebp: `/images/${base}.jpg`,
    };
  }

  const displayWidth = Math.min(entry.fallbackWidth, cap);
  const displayHeight = Math.round((entry.height / entry.width) * displayWidth);
  const widths = widthsForRole(base, role);
  const largest = widths[widths.length - 1] ?? displayWidth;

  return {
    base,
    sizes,
    width: displayWidth,
    height: displayHeight,
    src: `/images/${base}.jpg`,
    srcSetAvif: buildSrcSet(base, role, "avif"),
    srcSetWebp: buildSrcSet(base, role, "webp"),
    srcSetJpg: buildSrcSet(base, role, "jpg"),
    preloadAvif: optPath(base, largest, "avif"),
    preloadWebp: optPath(base, largest, "webp"),
  };
}

export function imageBaseFromSrc(src: string): string {
  const file = src.split("/").pop() ?? "";
  return file.replace(/\.(jpg|jpeg|png|webp|avif)$/i, "");
}
