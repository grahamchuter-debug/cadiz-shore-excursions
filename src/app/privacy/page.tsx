import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const path = "/privacy";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for Cadiz Shore Excursions — how we handle information submitted through our enquiry form and site analytics.",
  path,
  noindex: true,
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Privacy Policy", path },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "Privacy Policy", description: "Privacy policy for Cadiz Shore Excursions.", path })]} />
      <PageHero title="Privacy Policy" subtitle="How we handle your information." compact />
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <Breadcrumbs items={breadcrumbs} />
          <div className="prose-body">
            <p>Last updated: {new Date().getFullYear()}</p>
            <h2>Who we are</h2>
            <p>{SITE.name} ({SITE.url}) is an independent Cadiz cruise planning resource. This policy explains what information we collect and how we use it.</p>
            <h2>Information we collect</h2>
            <p>If you contact us through our enquiry form, we collect the name, email address and any details you choose to provide so we can respond. We may use privacy-respecting analytics to understand how the site is used in aggregate.</p>
            <h2>How we use information</h2>
            <p>We use enquiry details solely to reply to you. We do not sell your personal information. Aggregate analytics help us improve our guides.</p>
            <h2>Cookies</h2>
            <p>We use only the cookies necessary to operate the site and, where enabled, anonymous analytics. You can control cookies through your browser settings.</p>
            <h2>Third-party links</h2>
            <p>Our guides link to third-party providers (tours, ticketing). Their handling of your data is governed by their own privacy policies.</p>
            <h2>Your rights</h2>
            <p>You may request access to, correction of, or deletion of any personal information you have shared with us by contacting us at {SITE.email}.</p>
            <h2>Contact</h2>
            <p>Questions about this policy? Email {SITE.email}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
