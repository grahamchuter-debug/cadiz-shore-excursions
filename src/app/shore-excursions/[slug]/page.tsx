import Link from "next/link";
import { notFound } from "next/navigation";
import { excursionPageMetadata } from "@/lib/seo";
import { PhotoHeroBand } from "@/components/PhotoHeroBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQSection } from "@/components/FAQSection";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, articleSchema } from "@/lib/schema";
import { getExcursionBySlug, getAllExcursionSlugs, excursions } from "@/data/excursions";
import { getExcursionImage } from "@/lib/images";

export function generateStaticParams() {
  return getAllExcursionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getExcursionBySlug(slug);
  if (!e) return {};
  return excursionPageMetadata(slug, e.seoTitle, e.metaDescription);
}

export default async function ExcursionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getExcursionBySlug(slug);
  if (!e) notFound();
  const image = getExcursionImage(slug);
  const related = e.relatedExcursionSlugs.map((s) => excursions.find((x) => x.slug === s)).filter(Boolean);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Shore Excursions", path: "/shore-excursions" },
    { name: e.title, path: `/shore-excursions/${slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          faqSchema(e.faqs),
          articleSchema({ title: e.seoTitle, description: e.metaDescription, path: `/shore-excursions/${slug}`, image: image.src }),
        ]}
      />
      <PhotoHeroBand image={image} eyebrow={e.category} title={e.title} subtitle={e.tagline} compact />

      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8 flex flex-wrap gap-2">
            <span className="pill">Duration: {e.duration}</span>
            <span className="pill">Pace: {e.pace}</span>
            <span className="pill-accent">Best for: {e.bestFor}</span>
            {e.availability === "register-interest" && <span className="pill-accent">Register interest</span>}
            {e.availability === "coming-soon" && <span className="pill">Coming soon</span>}
          </div>

          <p className="text-lg leading-relaxed text-gray-700">{e.overview}</p>

          <div className="prose-body">
            {e.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="card-feature">
              <h2 className="font-display text-xl font-bold text-gray-900">Highlights</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                {e.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div className="card-feature">
              <h2 className="font-display text-xl font-bold text-gray-900">What a good tour includes</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                {e.included.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-8 card-accent">
            <h2 className="font-display text-xl font-bold text-gray-900">Getting there from the cruise port</h2>
            <p className="mt-3 text-gray-700">{e.portLogistics}</p>
          </div>

          <div className="mt-8">
            <h2 className="section-title text-2xl mb-4">Tips for cruise passengers</h2>
            <ul className="list-disc space-y-2 pl-5 text-gray-700">
              {e.tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cruise-planner" className="btn-primary">Build my cruise plan</Link>
            <Link href="/enquire" className="btn-secondary">Register interest / enquire</Link>
          </div>

          {e.availability !== "available" && (
            <div className="mt-8 placeholder-widget">
              <p className="placeholder-widget-label">Direct tours coming soon</p>
              <p className="mt-2 text-sm text-gray-600">This excursion is not yet bookable directly. Register your interest and we will notify you when small-group and private tours launch — or use our guides to compare cruise-line options in the meantime.</p>
              <Link href="/enquire" className="btn-accent mt-4 inline-flex text-sm">Register interest</Link>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="section-title text-2xl mb-6">Related excursions</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {related.map((r) => r && (
                  <Link key={r.slug} href={`/shore-excursions/${r.slug}`} className="card-editorial group overflow-hidden">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={getExcursionImage(r.slug).src} alt={getExcursionImage(r.slug).alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-base font-bold text-gray-900 group-hover:text-coastal-800">{r.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{r.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <FAQSection faqs={e.faqs} title={`${e.title} — FAQs`} />
          </div>

          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
