import { SITE } from "./site";

export function absoluteUrl(base: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function siteUrl(path: string): string {
  return absoluteUrl(SITE.url, path);
}
