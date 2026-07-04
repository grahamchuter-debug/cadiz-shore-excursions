import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PhotoHeroBand } from "@/components/PhotoHeroBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQSection } from "@/components/FAQSection";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, articleSchema } from "@/lib/schema";
import { siteImages } from "@/lib/images";
import { terminals, portGuideSections, portGuideFaqs } from "@/data/port-guide";

const path = "/cruise-port-guide";
const image = siteImages.port;

export const metadata = buildMetadata({
  title: "Cadiz Cruise Port Guide",
  description:
    "The complete Cadiz cruise port guide — where ships dock at Alfonso XIII pier, walking distances to the old town, taxi options, Seville drive times and return-to-ship timing for Andalusia cruise passengers.",
  path,
  image: image.src,
  imageAlt: image.alt,
  keywords: ["Cadiz cruise port", "Cadiz cruise port guide", "Cadiz cruise terminal"],
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Cruise Port Guide", path },
];

export default function CruisePortGuidePage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), faqSchema(portGuideFaqs), articleSchema({ title: "Cadiz Cruise Port Guide", description: metadata.description as string, path, image: image.src })]} />
      <PhotoHeroBand image={image} eyebrow="Waterfront terminal guidance" title="Cadiz Cruise Port Guide" subtitle="Where ships dock, walking distances to the old town, transport to Seville and Jerez, and return-to-ship timing — everything for arrival day." compact />
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <Breadcrumbs items={breadcrumbs} />

          <h2 className="section-title text-2xl mb-4">Cadiz cruise terminals at a glance</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-coastal-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Terminal</th>
                  <th className="px-4 py-3 text-left font-semibold">Quay</th>
                  <th className="px-4 py-3 text-left font-semibold">Used by</th>
                  <th className="px-4 py-3 text-left font-semibold">City access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {terminals.map((t) => (
                  <tr key={t.name}>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.quay}</td>
                    <td className="px-4 py-3 text-gray-600">{t.usedBy}</td>
                    <td className="px-4 py-3 text-gray-600">{t.cityAccess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">Most berths are walkable to the old town — confirm your terminal assignment on arrival.</p>

          <div className="prose-body mt-4">
            {portGuideSections.map((s) => (
              <div key={s.heading}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Link href="/cadiz-old-town-walking-guide" className="nav-card"><h3 className="font-display text-base font-bold text-gray-900">Old Town walking</h3><p className="mt-1 text-sm text-gray-600">Routes and distances from the pier.</p></Link>
            <Link href="/one-day-in-cadiz-from-a-cruise-ship" className="nav-card"><h3 className="font-display text-base font-bold text-gray-900">One day in Cadiz</h3><p className="mt-1 text-sm text-gray-600">Plans built around your port window.</p></Link>
            <Link href="/ship-schedules" className="nav-card"><h3 className="font-display text-base font-bold text-gray-900">Ship schedules</h3><p className="mt-1 text-sm text-gray-600">See who&apos;s in port before you book.</p></Link>
          </div>

          <div className="mt-12"><FAQSection faqs={portGuideFaqs} title="Cadiz Cruise Port — FAQs" /></div>
          <div className="mt-12"><PlanningLinks /></div>
        </div>
      </section>
    </>
  );
}
