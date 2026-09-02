import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RequestReceived } from "@/components/booking-engine/RequestReceived";
import { getBookingProduct, getRequestBookingSlugs } from "@/data/booking-catalogue";
import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getRequestBookingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBookingProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: `Request received — ${product.name}`,
    description: "We've received your Cadiz excursion request. This is not a booking confirmation.",
    path: product.receivedPath,
    noindex: true,
  });
}

export default async function BookingReceivedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBookingProduct(slug);
  if (!product) notFound();

  return (
    <section className="section-padding pt-8 sm:pt-10">
      <div className="container-wide">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: product.name, path: product.productPath },
            { name: "Request received", path: product.receivedPath },
          ]}
        />
        <Suspense fallback={<p className="text-sm text-gray-600">Loading your request…</p>}>
          <RequestReceived product={product} />
        </Suspense>
      </div>
    </section>
  );
}
