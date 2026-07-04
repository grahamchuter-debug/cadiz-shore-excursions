import Link from "next/link";
import type { AttractionPage } from "@/data/types";
import { PhotoHeroBand } from "@/components/PhotoHeroBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQSection } from "@/components/FAQSection";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, articleSchema } from "@/lib/schema";
import { getAttractionImage } from "@/lib/images";
import { attractions } from "@/data/attractions";
import { getExcursionBySlug } from "@/data/excursions";

export function AttractionArticle({ page }: { page: AttractionPage }) {
  const image = getAttractionImage(page.slug);
  const related = page.relatedAttractionSlugs.map((s) => attractions.find((a) => a.slug === s)).filter(Boolean);
  const relatedExcursion = page.relatedExcursionSlug ? getExcursionBySlug(page.relatedExcursionSlug) : undefined;

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: page.attractionName, path: `/${page.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          faqSchema(page.faqs),
          articleSchema({ title: page.seoTitle, description: page.metaDescription, path: `/${page.slug}`, image: image.src }),
        ]}
      />
      <PhotoHeroBand image={image} eyebrow="From the cruise port" title={page.title} subtitle={page.tagline} compact />

      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <div className="card-feature"><p className="text-xs font-semibold uppercase tracking-wide text-coastal-600">Distance</p><p className="mt-1 text-sm font-medium text-gray-900">{page.distanceFromPort}</p></div>
            <div className="card-feature"><p className="text-xs font-semibold uppercase tracking-wide text-coastal-600">Travel time</p><p className="mt-1 text-sm font-medium text-gray-900">{page.travelTime}</p></div>
            <div className="card-feature"><p className="text-xs font-semibold uppercase tracking-wide text-coastal-600">Time needed</p><p className="mt-1 text-sm font-medium text-gray-900">{page.timeNeeded}</p></div>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">{page.overview}</p>
          <div className="prose-body">
            {page.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <h2 className="section-title text-2xl mt-10 mb-4">How to get there</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-coastal-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Method</th>
                  <th className="px-4 py-3 text-left font-semibold">Detail</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {page.gettingThere.map((g) => (
                  <tr key={g.method}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{g.method}</td>
                    <td className="px-4 py-3 text-gray-600">{g.detail}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{g.time}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{g.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">Times and costs are indicative and vary with traffic and demand.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="card-feature">
              <h2 className="font-display text-xl font-bold text-gray-900">Highlights</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                {page.highlights.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div className="card-feature">
              <h2 className="font-display text-xl font-bold text-gray-900">Tips</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                {page.tips.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>

          {relatedExcursion && (
            <div className="mt-10 card-accent flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-maple-600">Prefer a guided tour?</p>
                <h2 className="mt-1 font-display text-xl font-bold text-gray-900">{relatedExcursion.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{relatedExcursion.tagline}</p>
              </div>
              <Link href={`/shore-excursions/${relatedExcursion.slug}`} className="btn-primary shrink-0">View excursion</Link>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="section-title text-2xl mb-6">More from the cruise port</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => r && (
                  <Link key={r.slug} href={`/${r.slug}`} className="nav-card">
                    <h3 className="font-display text-base font-bold text-gray-900">{r.attractionName}</h3>
                    <p className="mt-1 text-sm text-gray-600">{r.tagline}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <FAQSection faqs={page.faqs} title={`${page.attractionName} from the Cruise Port — FAQs`} />
          </div>

          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
