import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScheduleTable } from "@/components/ScheduleTable";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import {
  getSchedulePortBySlug,
  getAllSchedulePortSlugs,
  getScheduleEntriesForYear,
  getScheduleEntriesForMonth,
  getVerifiedMonthKeys,
} from "@/data/schedules";
import {
  parseScheduleYear,
  parseMonthSlug,
  portHubPath,
  portYearPath,
  portMonthPath,
  formatMonthLabel,
  monthKeyToSlug,
  getMonthsWithEntries,
  parseMonthKey,
  isValidScheduleYear,
  SCHEDULE_YEARS,
} from "@/lib/schedule-utils";

export function generateStaticParams() {
  const params: { slug: string; segment: string }[] = [];
  for (const slug of getAllSchedulePortSlugs()) {
    for (const year of SCHEDULE_YEARS) {
      params.push({ slug, segment: String(year) });
    }
    for (const monthKey of getVerifiedMonthKeys(slug)) {
      params.push({ slug, segment: monthKeyToSlug(monthKey) });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; segment: string }>;
}) {
  const { slug, segment } = await params;
  const port = getSchedulePortBySlug(slug);
  if (!port) return {};

  const year = parseScheduleYear(segment);
  if (year) {
    return buildMetadata({
      title: `${port.name} Cruise Ship Schedule ${year}`,
      description: `${port.name} cruise ship arrivals and departures for ${year}. Plan shore excursions around published port times.`,
      path: portYearPath(slug, year),
    });
  }

  const monthKey = parseMonthSlug(segment);
  if (monthKey) {
    const label = formatMonthLabel(monthKey);
    return buildMetadata({
      title: `${port.name} Cruise Ship Schedule — ${label}`,
      description: `${port.name} cruise ship schedule for ${label}. Verified arrival and departure times for port-day planning.`,
      path: portMonthPath(slug, monthKey),
    });
  }

  return {};
}

export default async function ShipScheduleSegmentPage({
  params,
}: {
  params: Promise<{ slug: string; segment: string }>;
}) {
  const { slug, segment } = await params;
  const port = getSchedulePortBySlug(slug);
  if (!port) notFound();

  const year = parseScheduleYear(segment);
  const monthKey = parseMonthSlug(segment);
  if (!year && !monthKey) notFound();

  if (year) {
    const entries = getScheduleEntriesForYear(slug, year);
    const monthKeys = getMonthsWithEntries(entries);

    const breadcrumbs = [
      { name: "Home", path: "/" },
      { name: "Ship Schedules", path: "/ship-schedules" },
      { name: port.name, path: portHubPath(slug) },
      { name: String(year), path: portYearPath(slug, year) },
    ];

    return (
      <>
        <JsonLd
          data={[
            breadcrumbSchema(breadcrumbs),
            webPageSchema({
              title: `${port.name} Cruise Ship Schedule ${year}`,
              description: port.intro,
              path: portYearPath(slug, year),
            }),
          ]}
        />
        <PageHero
          title={`${port.name} — ${year} Cruise Schedule`}
          subtitle={`Ship calls at ${port.name} throughout ${year}. Browse by month or view the full year.`}
          compact
        />
        <section className="section-padding">
          <div className="container-wide max-w-5xl">
            <Breadcrumbs items={breadcrumbs} />

            {entries.length === 0 && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
                <p className="font-medium text-amber-950">Schedule data coming soon</p>
                <p className="mt-2 text-sm text-amber-900">
                  We are importing verified {year} ship calls for {port.name}. Check back soon or confirm
                  times with your cruise line before booking excursions.
                </p>
              </div>
            )}

            {monthKeys.length > 0 && (
              <section className="mt-8">
                <h2 className="section-title text-2xl mb-4">Browse by Month</h2>
                <div className="flex flex-wrap gap-3">
                  {monthKeys.map((mk) => (
                    <Link
                      key={mk}
                      href={portMonthPath(slug, mk)}
                      className="btn-secondary text-sm"
                    >
                      {formatMonthLabel(mk)}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <h2 className="section-title text-2xl mb-4">
                {year} Schedule{entries.length > 0 ? ` (${entries.length} calls)` : ""}
              </h2>
              <ScheduleTable entries={entries} portName={port.name} />
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={portHubPath(slug)} className="btn-primary text-sm">
                {port.name} Schedule Hub
              </Link>
              {SCHEDULE_YEARS.filter((y) => y !== year).map((y) => (
                <Link key={y} href={portYearPath(slug, y)} className="btn-secondary text-sm">
                  {y} Schedule
                </Link>
              ))}
              <Link href="/cruise-port-guide" className="btn-secondary text-sm">
                Cruise Port Guide
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Month view
  const entries = getScheduleEntriesForMonth(slug, monthKey!);
  const label = formatMonthLabel(monthKey!);
  const { year: monthYear } = parseMonthKey(monthKey!);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Ship Schedules", path: "/ship-schedules" },
    { name: port.name, path: portHubPath(slug) },
    ...(isValidScheduleYear(monthYear)
      ? [{ name: String(monthYear), path: portYearPath(slug, monthYear) }]
      : []),
    { name: label, path: portMonthPath(slug, monthKey!) },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          webPageSchema({
            title: `${port.name} Cruise Ship Schedule — ${label}`,
            description: port.intro,
            path: portMonthPath(slug, monthKey!),
          }),
        ]}
      />
      <PageHero
        title={`${port.name} — ${label}`}
        subtitle={`Verified cruise ship calls for ${label}. Confirm all-aboard times with your cruise line.`}
        compact
      />
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Breadcrumbs items={breadcrumbs} />

          <section className="mt-6">
            <h2 className="section-title text-2xl mb-4">
              Ship Calls ({entries.length})
            </h2>
            <ScheduleTable entries={entries} portName={port.name} />
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            {isValidScheduleYear(monthYear) && (
              <Link href={portYearPath(slug, monthYear)} className="btn-primary text-sm">
                {monthYear} Overview
              </Link>
            )}
            <Link href={portHubPath(slug)} className="btn-secondary text-sm">
              {port.name} Schedule Hub
            </Link>
            <Link href="/cruise-port-guide" className="btn-secondary text-sm">
              Cruise Port Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
