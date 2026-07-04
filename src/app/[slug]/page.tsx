import { notFound } from "next/navigation";
import { getAttractionBySlug, getAllAttractionSlugs } from "@/data/attractions";
import { getGuideBySlug, getAllGuideSlugs } from "@/data/guides";
import { AttractionArticle } from "@/components/AttractionArticle";
import { GuideArticle } from "@/components/GuideArticle";
import { attractionPageMetadata, guidePageMetadata } from "@/lib/seo";

const RESERVED = new Set([
  "shore-excursions", "cruise-port-guide", "cruise-planner", "ship-schedules",
  "faq", "enquire", "about", "privacy", "terms",
]);

export function generateStaticParams() {
  return [
    ...getAllAttractionSlugs().map((slug) => ({ slug })),
    ...getAllGuideSlugs().map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};

  const attraction = getAttractionBySlug(slug);
  if (attraction) return attractionPageMetadata(slug, attraction.seoTitle, attraction.metaDescription);

  const guide = getGuideBySlug(slug);
  if (guide) return guidePageMetadata(slug, guide.seoTitle, guide.metaDescription);

  return {};
}

export default async function DynamicAuthorityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const attraction = getAttractionBySlug(slug);
  if (attraction) return <AttractionArticle page={attraction} />;

  const guide = getGuideBySlug(slug);
  if (guide) return <GuideArticle page={guide} />;

  notFound();
}
