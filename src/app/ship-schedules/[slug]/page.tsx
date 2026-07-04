import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShipScheduleHubView } from "@/components/ShipScheduleHubView";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";
import { notFound } from "next/navigation";
import { getSchedulePortBySlug, getAllSchedulePortSlugs } from "@/data/schedules";
import { isScheduleYearSlug, portHubPath } from "@/lib/schedule-utils";

export function generateStaticParams() {
  return getAllSchedulePortSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (isScheduleYearSlug(slug)) return {};
  const port = getSchedulePortBySlug(slug);
  if (!port) return {};
  return buildMetadata({ title: port.seoTitle, description: port.metaDescription, path: portHubPath(slug) });
}

export default async function ShipSchedulePortPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (isScheduleYearSlug(slug)) notFound();
  const port = getSchedulePortBySlug(slug);
  if (!port) notFound();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Ship Schedules", path: "/ship-schedules" },
    { name: port.name, path: portHubPath(slug) },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: port.seoTitle, description: port.intro, path: portHubPath(slug) }), ...(port.faqs ? [faqSchema(port.faqs)] : [])]} />
      <PageHero title={`${port.name} Cruise Ship Schedule`} subtitle={port.description} compact />
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Breadcrumbs items={breadcrumbs} />
          <ShipScheduleHubView port={port} />
        </div>
      </section>
    </>
  );
}
