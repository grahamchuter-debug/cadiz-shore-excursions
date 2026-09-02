import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PhotoHeroBand } from "@/components/PhotoHeroBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { excursions } from "@/data/excursions";
import { getPriorityProducts, isPriorityProductSlug } from "@/data/bookable-products";
import { excursionsHubImage, getExcursionImage } from "@/lib/images";
import { PriorityProductCard } from "@/components/PriorityProductCard";

export const metadata = buildMetadata({
  title: "Cadiz Shore Excursions",
  description:
    "Premium Cadiz shore excursions for cruise passengers — Seville day trips, historic Cadiz walking tours, Jerez sherry, White Villages, Andalusian food, flamenco and private Andalusia tours.",
  path: "/shore-excursions",
  image: excursionsHubImage.src,
  imageAlt: excursionsHubImage.alt,
  keywords: ["Cadiz cruise excursions", "Seville from Cadiz cruise port", "Cadiz walking tour", "Jerez sherry tour Cadiz"],
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Shore Excursions", path: "/shore-excursions" },
];

const AVAILABILITY_BADGES = {
  "coming-soon": { label: "Coming soon", className: "pill bg-coastal-100" },
  "register-interest": { label: "Register interest", className: "pill-accent" },
  available: { label: "Available", className: "pill bg-coastal-800 text-white" },
};

export default function ShoreExcursionsPage() {
  const recommended = getPriorityProducts();
  const moreWays = excursions.filter((e) => !isPriorityProductSlug(e.slug));

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "Cadiz Shore Excursions", description: "Premium Cadiz shore excursions for cruise passengers.", path: "/shore-excursions" })]} />
      <PhotoHeroBand
        image={excursionsHubImage}
        eyebrow="Andalusia tours"
        title="Cadiz Shore Excursions"
        subtitle="Premium, passenger-first tours built around your Cadiz port day — Seville, historic Cádiz, Jerez sherry, White Villages and Andalusian culture, with reliable return-to-ship timing."
        compact
      />
      <section className="section-padding">
        <div className="container-wide">
          <Breadcrumbs items={breadcrumbs} />

          <div className="max-w-3xl">
            <p className="section-eyebrow">Recommended</p>
            <h2 className="section-title mt-2">Bookable Seville from Cádiz</h2>
            <p className="section-subtitle">
              Two priority products for a long Cadiz call: Best Value free time, or Best Overall with Cathedral and Real Alcázar included.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {recommended.map((product) => (
              <PriorityProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-20 max-w-3xl">
            <p className="section-eyebrow">More ways to experience Andalusia</p>
            <h2 className="section-title mt-2">Planning guides &amp; upcoming tours</h2>
            <p className="section-subtitle">
              Editorial excursion ideas and register-interest pages — useful for choosing a Cadiz day beyond the two bookable Seville products above.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moreWays.map((e) => {
              const image = getExcursionImage(e.slug);
              const badge = e.availability ? AVAILABILITY_BADGES[e.availability] : AVAILABILITY_BADGES["register-interest"];
              return (
                <Link key={e.slug} href={`/shore-excursions/${e.slug}`} className="card-editorial group overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-coastal-900/55 via-transparent to-transparent" aria-hidden="true" />
                    <span className="absolute left-3 top-3 pill bg-white/90">{e.category}</span>
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-lg font-bold text-gray-900 group-hover:text-coastal-800">{e.title}</h2>
                    <p className="mt-2 text-sm text-gray-600">{e.tagline}</p>
                    <p className="mt-3 text-xs font-medium text-coastal-700">{e.duration} · {e.pace}</p>
                    <span className={`mt-2 inline-block ${badge.className}`}>{badge.label}</span>
                    <p className="mt-2 text-xs text-gray-500">Best for: {e.bestFor}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
