import { REQUEST_COPY } from "@shared/world-booking";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RequestBookingEngine } from "@/components/booking-engine/RequestBookingEngine";
import { getBookingProduct, getRequestBookingSlugs } from "@/data/booking-catalogue";
import { getScheduleEntries } from "@/data/schedules";
import { buildMetadata } from "@/lib/seo";
import { buildShipsByDate } from "@/platform/booking/ships";
import { notFound } from "next/navigation";
import { cadizBookingCore } from "@shared/destinations/cadiz";

export function generateStaticParams() {
  return getRequestBookingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBookingProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: `${REQUEST_COPY.bookingEngineHeading} — ${product.name}`,
    description: `Book ${product.name} for your Cadiz cruise call. We'll confirm your places with our local partner.`,
    path: product.bookingPath,
    noindex: true,
  });
}

export default async function BookRequestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBookingProduct(slug);
  if (!product || product.bookingMode !== "request") notFound();
  const shipsByDate = buildShipsByDate(getScheduleEntries(cadizBookingCore.schedulePortSlug));

  return (
    <section className="section-padding pt-8 sm:pt-10">
      <div className="container-wide">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: product.name, path: product.productPath },
            { name: REQUEST_COPY.bookingEngineHeading, path: product.bookingPath },
          ]}
        />
        <RequestBookingEngine product={product} shipsByDate={shipsByDate} />
      </div>
    </section>
  );
}
