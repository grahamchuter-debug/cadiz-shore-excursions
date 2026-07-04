import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const path = "/terms";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms of use for Cadiz Shore Excursions — the basis on which we provide our Cadiz cruise planning guides and information.",
  path,
  noindex: true,
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Terms of Use", path },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "Terms of Use", description: "Terms of use for Cadiz Shore Excursions.", path })]} />
      <PageHero title="Terms of Use" subtitle="The basis on which we provide this information." compact />
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <Breadcrumbs items={breadcrumbs} />
          <div className="prose-body">
            <p>Last updated: {new Date().getFullYear()}</p>
            <h2>Information only</h2>
            <p>{SITE.name} provides planning information and guidance for cruise passengers calling at Cadiz and Andalusia. It is offered in good faith for general guidance and does not constitute professional travel advice.</p>
            <h2>No guarantee of accuracy</h2>
            <p>Cruise schedules, terminal assignments, transfer times, prices and opening hours change frequently and can vary by operator and season. Ship schedules and timings shown are indicative. Always confirm critical details &mdash; especially all-aboard times &mdash; directly with your cruise line and service providers.</p>
            <h2>Third-party services</h2>
            <p>We link to independent providers of tours and tickets. We are not responsible for their services, availability or policies. Any booking is a contract between you and that provider.</p>
            <h2>Limitation of liability</h2>
            <p>To the fullest extent permitted by law, {SITE.name} is not liable for any loss arising from reliance on the information on this site, including missed sailings, transfers or connections.</p>
            <h2>Changes</h2>
            <p>We may update these terms at any time. Continued use of the site constitutes acceptance of the current terms.</p>
            <h2>Contact</h2>
            <p>Questions about these terms? Email {SITE.email}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
