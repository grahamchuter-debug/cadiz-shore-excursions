import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";
import { EnquiryFormShell } from "@/components/EnquiryFormShell";

const path = "/enquire";

export const metadata = buildMetadata({
  title: "Enquire / Contact",
  description: "Get in touch about Cadiz shore excursions and Andalusia cruise planning — register interest for upcoming tours, private tour requests and cruise-day questions.",
  path,
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Enquire", path },
];

export default function EnquirePage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "Enquire / Contact", description: "Get in touch about Cadiz cruise planning.", path })]} />
      <PageHero title="Enquire / Contact" subtitle="Register interest for upcoming tours, request a private Andalusia excursion, or ask about your Cadiz port day." compact />
      <section className="section-padding">
        <div className="container-wide max-w-xl">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mb-6 card-feature">
            <p className="text-sm text-gray-700">Direct, shared and private Cadiz shore excursions are launching soon. Use this form to register interest, request a private tour quote, or ask planning questions. Future listings will include exclusive tours, food tours, sherry tours and White Village experiences.</p>
          </div>
          <EnquiryFormShell
            siteId="cadiz"
            fallbackEmail={SITE.email}
            className="space-y-4"
            submitClassName="btn-primary"
            submitLabel="Send Enquiry"
            successTitle="Thank you — we've received your enquiry"
            successBody="We'll reply by email, usually within one working day."
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">I&apos;m interested in</label>
              <select id="interest" name="interest" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm">
                <option>General cruise planning advice</option>
                <option>Register interest — shore excursion</option>
                <option>Private tour request</option>
                <option>Small-group / shared tour notification</option>
                <option>Seville day trip</option>
                <option>Cadiz walking tour</option>
                <option>Food &amp; tapas tour</option>
                <option>Sherry / wine tour (Jerez)</option>
                <option>White Villages tour</option>
                <option>Flamenco experience</option>
              </select>
            </div>
            <div>
              <label htmlFor="cruise" className="block text-sm font-medium text-gray-700 mb-1">Cruise date &amp; ship (optional)</label>
              <input id="cruise" name="cruise_date_and_ship" type="text" maxLength={200} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" placeholder="e.g. 15 June 2026, Celebrity Silhouette" />
            </div>
            <div>
              <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-1">Party size (optional)</label>
              <input id="party" name="party_size" type="text" maxLength={100} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" placeholder="e.g. 2 adults, 1 child" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" name="message" rows={5} required maxLength={5000} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" placeholder="Tell us about your Cadiz port day, ship times and which excursion interests you..." />
            </div>
          </EnquiryFormShell>
          <p className="mt-6 text-sm text-gray-600">Or email us directly at {SITE.email}</p>
          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
