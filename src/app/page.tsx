import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { VisitorTypeSelector } from "@/components/VisitorTypeSelector";
import { FAQSection } from "@/components/FAQSection";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, travelGuideSchema } from "@/lib/schema";
import { coreSections, getHomepageFaqs } from "@/data/homepage";
import { getFeaturedExcursions } from "@/data/excursions";
import { siteImages, getExcursionImage } from "@/lib/images";

export const metadata = buildMetadata({
  title: "Cadiz Shore Excursions & Andalusia Cruise Planning",
  description:
    "The Cadiz cruise planning authority — shore excursions, port guide, Seville day trips, Jerez sherry, White Villages, Andalusian food and flamenco, plus a personalised cruise planner for Andalusia port days.",
  path: "/",
  keywords: ["Cadiz cruise port guide", "Seville from Cadiz cruise port", "Cadiz walking tour", "Jerez from Cadiz", "White Villages from Cadiz"],
});

export default function HomePage() {
  const faqs = getHomepageFaqs();
  const featured = getFeaturedExcursions().slice(0, 6);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }]),
          faqSchema(faqs),
          travelGuideSchema({
            title: "Cadiz Shore Excursions & Andalusia Cruise Planning",
            description: "The Cadiz cruise planning authority for Andalusia port days.",
            path: "/",
          }),
        ]}
      />

      <section className="home-hero">
        <img src={siteImages.hero.src} alt={siteImages.hero.alt} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container-wide relative z-10 px-4 sm:px-6 lg:px-8">
          <p className="section-eyebrow mb-2 text-coastal-100">Andalusia cruise gateway</p>
          <h1 className="home-hero-heading">Cadiz Shore Excursions &amp; Andalusia Cruise Planning</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            Cadiz is your gateway to Andalusia — walkable old town mornings, Seville on long port days, Jerez sherry tastings, White Villages and Atlantic beaches, all with return-to-ship confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shore-excursions" className="btn-accent">Find Shore Excursions</Link>
            <Link href="/cruise-planner" className="btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20">Use the Cruise Planner</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-2"><span aria-hidden="true">✓</span> Cruise-timed, return-to-ship friendly</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden="true">✓</span> Cadiz, Seville, Jerez &amp; villages</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden="true">✓</span> Independent passenger-first guidance</span>
          </div>
        </div>
      </section>

      <VisitorTypeSelector />

      <section className="section-padding bg-white">
        <div className="container-wide">
          <p className="section-eyebrow">Your Andalusia port day</p>
          <h2 className="section-title mt-2">The definitive Cadiz cruise planning hub</h2>
          <p className="section-subtitle">Choose between historic Cádiz on foot, a Seville day trip, Jerez sherry country or the White Villages — with realistic timing for every port window.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreSections.map((s) => (
              <Link key={s.slug} href={s.href} className="nav-card group flex h-full flex-col">
                <span className="font-display text-2xl font-bold text-coastal-200">{s.number}</span>
                <h3 className="mt-1 font-display text-lg font-bold text-gray-900 group-hover:text-coastal-800">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-gray-600">{s.description}</p>
                <span className="mt-3 text-sm font-semibold text-maple-600">{s.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-coastal-50">
        <div className="container-wide">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">Featured Shore Excursions</h2>
              <p className="section-subtitle">Premium, cruise-passenger-focused experiences — register interest as direct tours launch.</p>
            </div>
            <Link href="/shore-excursions" className="btn-secondary shrink-0">All Excursions</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => {
              const image = getExcursionImage(e.slug);
              return (
                <Link key={e.slug} href={`/shore-excursions/${e.slug}`} className="card-editorial group overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-coastal-900/55 via-transparent to-transparent" aria-hidden="true" />
                    <span className="absolute left-3 top-3 pill bg-white/90">{e.category}</span>
                    <span className="absolute right-3 top-3 pill-accent text-xs">{e.bestFor.split(" ").slice(0, 3).join(" ")}…</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-coastal-800">{e.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{e.tagline}</p>
                    <p className="mt-3 text-xs font-medium text-coastal-700">{e.duration} · {e.pace}</p>
                    <span className="mt-2 inline-block pill-accent">Register interest</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-wide grid gap-6 lg:grid-cols-2">
          <div className="card-feature">
            <h3 className="font-display text-xl font-bold text-gray-900">First time in Andalusia?</h3>
            <p className="mt-3 text-gray-700">Choose between walkable historic Cádiz and a Seville day trip — our guides explain drive times, what fits your port window and how to get back with confidence.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/best-cadiz-excursions-for-first-time-visitors" className="btn-secondary text-sm">First-timer guide</Link>
              <Link href="/cadiz-old-town-walking-guide" className="btn-secondary text-sm">Old Town guide</Link>
              <Link href="/cruise-port-guide" className="btn-secondary text-sm">Port Guide</Link>
            </div>
          </div>
          <div className="card-accent">
            <h3 className="font-display text-xl font-bold text-gray-900">Been to Seville before?</h3>
            <p className="mt-3 text-gray-700">Jerez sherry bodegas, White Villages like Vejer, flamenco shows and deep Andalusian food days — alternatives that reward repeat visitors.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/best-cadiz-excursions-for-repeat-visitors" className="btn-secondary text-sm">Repeat visitor picks</Link>
              <Link href="/jerez-from-cadiz-cruise-port" className="btn-secondary text-sm">Jerez guide</Link>
              <Link href="/white-villages-from-cadiz" className="btn-secondary text-sm">White Villages</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-coastal-900 text-white">
        <div className="container-wide max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Build your personalised Cadiz cruise plan</h2>
          <p className="mt-4 text-white/85">Enter your ship times, interests and mobility — get tailored excursion ideas with return-to-ship confidence for your Andalusia port day.</p>
          <Link href="/cruise-planner" className="btn-accent mt-8 inline-flex">Start the Cruise Planner</Link>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-wide max-w-4xl">
          <FAQSection faqs={faqs} title="Cadiz Cruise Planning FAQs" />
        </div>
      </section>
    </>
  );
}
