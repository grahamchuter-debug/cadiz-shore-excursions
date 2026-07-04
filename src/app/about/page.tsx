import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const path = "/about";

export const metadata = buildMetadata({
  title: "About Cadiz Shore Excursions",
  description: "About Cadiz Shore Excursions — an independent Andalusia cruise planning authority for passengers calling at the Cadiz cruise port.",
  path,
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "About", path },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "About Cadiz Shore Excursions", description: "About Cadiz Shore Excursions.", path })]} />
      <PageHero title="About Cadiz Shore Excursions" subtitle="An independent planning authority for cruise passengers discovering Andalusia from Cadiz." compact />
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <Breadcrumbs items={breadcrumbs} />
          <div className="prose-body">
            <p>
              {SITE.name} is an independent planning resource for cruise passengers calling at Cadiz. Ships berth on the city waterfront, and our goal is to help you choose the right experience — historic Cádiz on foot, a Seville day trip, Jerez sherry country or the White Villages — based on your interests, previous visits and port window.
            </p>
            <p>
              We aim to be the definitive Cadiz cruise planning authority, not simply another excursion catalogue. We focus on practical decisions: whether Seville fits your hours ashore, how far Jerez really is, where to walk from the pier, and how repeat visitors can discover authentic Andalusia beyond the usual coach tour.
            </p>
            <p>
              Our guides are written for real cruise timings, not generic Spain tourism. We highlight realistic drive times, walking distances, return-to-ship buffers and honest advice on when a guided tour beats going it alone. Direct, shared and private tours are launching soon — register interest via our excursion pages or enquiry form.
            </p>
            <p>
              We are not affiliated with any cruise line or the Port of Cadiz. Ship schedules and travel times are indicative — always confirm all-aboard times with your cruise line.
            </p>
            <p>
              Have a question we haven&apos;t answered? <a href="/enquire">Get in touch</a> and we&apos;ll help you plan.
            </p>
          </div>
          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
