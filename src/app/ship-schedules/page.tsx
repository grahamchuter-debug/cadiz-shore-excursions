import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { schedulePorts, getScheduleEntryCount } from "@/data/schedules";
import { SCHEDULE_YEARS, portYearPath, portHubPath } from "@/lib/schedule-utils";

const path = "/ship-schedules";

export const metadata = buildMetadata({
  title: "Cadiz Cruise Ship Schedules",
  description:
    "Cadiz cruise ship schedules by year and month. See which ships are scheduled before booking Seville, Jerez and Cadiz shore excursions.",
  path,
  keywords: ["Cadiz cruise ship schedule", "Cadiz cruise calendar"],
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Ship Schedules", path },
];

export default function ShipSchedulesPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), webPageSchema({ title: "Cadiz Cruise Ship Schedules", description: "Cadiz cruise ship schedules by year and month.", path })]} />
      <PageHero title="Cadiz Cruise Ship Schedules" subtitle="See which ships are scheduled at Cadiz before you book excursions. Times are indicative — always confirm with your cruise line. Ready for CSV imports as schedules are published." compact />
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Breadcrumbs items={breadcrumbs} />
          {schedulePorts.map((port) => {
            const count = getScheduleEntryCount(port.slug);
            return (
              <div key={port.slug} className="card-editorial p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900">{port.name}</h2>
                    <p className="mt-2 text-gray-600">{port.scheduleOverview}</p>
                  </div>
                  {count > 0 ? (
                    <span className="pill">{count} entries</span>
                  ) : (
                    <span className="pill-accent">CSV import ready</span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={portHubPath(port.slug)} className="btn-primary text-sm">Full schedule hub</Link>
                  {SCHEDULE_YEARS.map((y) => (
                    <Link key={y} href={portYearPath(port.slug, y)} className="btn-secondary text-sm">{y}</Link>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="mt-12">
            <PlanningLinks />
          </div>
        </div>
      </section>
    </>
  );
}
