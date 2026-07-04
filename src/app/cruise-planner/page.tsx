import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CadizCruisePlanner } from "@/components/CadizCruisePlanner";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { siteImages } from "@/lib/images";

const path = "/cruise-planner";

export const metadata = buildMetadata({
  title: "Cadiz Cruise Planner",
  description:
    "Build a personalised Cadiz cruise plan. Enter your ship arrival and departure times, interests and mobility — get tailored Andalusia excursion ideas with return-to-ship confidence.",
  path,
  keywords: ["Cadiz cruise planner", "Cadiz cruise day plan", "Seville from Cadiz planning"],
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Cruise Planner", path },
];

export default function CruisePlannerPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "Cadiz Cruise Planner", description: "Build a personalised Cadiz cruise plan.", path })]} />
      <PageHero
        title="Cadiz Cruise Planner"
        subtitle="Enter your ship times, party size and interests — get tailored shore excursion ideas for your Andalusia port day, with realistic timing and return-to-ship confidence."
        imageSrc={siteImages.hero.src}
        imageAlt={siteImages.hero.alt}
        compact
      />
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <Breadcrumbs items={breadcrumbs} />
          <CadizCruisePlanner />
          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
