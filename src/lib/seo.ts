import type { Metadata } from "next";
import { SITE } from "./site";
import { absoluteUrl } from "./paths";
import {
  siteImages,
  getExcursionImage,
  getAttractionImage,
  getGuideImage,
} from "./images";

export interface PageSEO {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
}

export function fullTitle(title: string, path: string): string {
  return path === "/" ? title : `${title} | ${SITE.name}`;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  imageAlt,
  noindex = false,
}: PageSEO): Metadata {
  const url = absoluteUrl(SITE.url, path);
  const ogTitle = fullTitle(title, path);
  const ogImage = image ?? siteImages.ogDefault.src;
  const ogImageAlt = imageAlt ?? siteImages.ogDefault.alt;

  return {
    title: path === "/" ? { absolute: ogTitle } : title,
    description,
    keywords: [
      "Cadiz shore excursions",
      "Cadiz cruise excursions",
      "Cadiz cruise port",
      "Andalusia shore excursions",
      "Seville from Cadiz cruise port",
      ...keywords,
    ],
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: ogTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export function excursionPageMetadata(slug: string, title: string, description: string) {
  const image = getExcursionImage(slug);
  return buildMetadata({
    title,
    description,
    path: `/shore-excursions/${slug}`,
    image: image?.src,
    imageAlt: image?.alt,
  });
}

export function attractionPageMetadata(slug: string, title: string, description: string) {
  const image = getAttractionImage(slug);
  return buildMetadata({
    title,
    description,
    path: `/${slug}`,
    image: image?.src,
    imageAlt: image?.alt,
  });
}

export function guidePageMetadata(slug: string, title: string, description: string) {
  const image = getGuideImage(slug);
  return buildMetadata({
    title,
    description,
    path: `/${slug}`,
    image: image?.src,
    imageAlt: image?.alt,
  });
}
