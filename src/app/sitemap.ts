import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { absoluteUrl } from "@/lib/paths";
import { getAllExcursionSlugs } from "@/data/excursions";
import { getAllAttractionSlugs } from "@/data/attractions";
import { getAllGuideSlugs } from "@/data/guides";
import { getAllSchedulePortSlugs, getVerifiedMonthKeys } from "@/data/schedules";
import { SCHEDULE_YEARS, portYearPath, portMonthPath } from "@/lib/schedule-utils";

export const dynamic = "force-static";

const NOINDEX_PATHS = new Set(["/privacy", "/terms"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    "/",
    "/shore-excursions",
    "/cruise-port-guide",
    "/cruise-planner",
    "/ship-schedules",
    "/faq",
    "/enquire",
    "/about",
  ];

  const authorityPages = [
    ...getAllAttractionSlugs().map((s) => `/${s}`),
    ...getAllGuideSlugs().map((s) => `/${s}`),
  ];

  const dynamicPages = [
    ...getAllExcursionSlugs().map((s) => `/shore-excursions/${s}`),
    ...getAllSchedulePortSlugs().map((s) => `/ship-schedules/${s}`),
    ...getAllSchedulePortSlugs().flatMap((s) => SCHEDULE_YEARS.map((y) => portYearPath(s, y))),
    ...getAllSchedulePortSlugs().flatMap((s) => getVerifiedMonthKeys(s).map((mk) => portMonthPath(s, mk))),
  ];

  const all = [...staticPages, ...authorityPages, ...dynamicPages].filter(
    (path) => !NOINDEX_PATHS.has(path),
  );

  return all.map((path) => {
    const url = absoluteUrl(SITE.url, path).replace(/\/?$/, "/");
    return {
      url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    };
  });
}
