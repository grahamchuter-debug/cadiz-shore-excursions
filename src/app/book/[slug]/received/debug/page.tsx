import { Suspense } from "react";
import { BookingReceivedDebug } from "@/components/booking-engine/BookingReceivedDebug";
import { getBookingProduct, getRequestBookingSlugs } from "@/data/booking-catalogue";
import { buildMetadata } from "@/lib/seo";
import { isBookingDebugToolsEnabled } from "@/platform/booking/debug-tools";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getRequestBookingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBookingProduct(slug);
  if (!product || !isBookingDebugToolsEnabled()) return {};
  return buildMetadata({
    title: `Booking debug — ${product.name}`,
    description: "Internal booking debug tools. Not for customers.",
    path: `${product.receivedPath}/debug`,
    noindex: true,
  });
}

export default async function BookingReceivedDebugPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isBookingDebugToolsEnabled()) notFound();

  const { slug } = await params;
  const product = getBookingProduct(slug);
  if (!product) notFound();

  return (
    <section className="section-padding pt-8 sm:pt-10">
      <div className="container-wide max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Internal only</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-gray-900">Booking received — debug</h1>
        <p className="mt-2 text-sm text-gray-600">
          Operator simulations and email previews for{" "}
          <span className="font-medium text-gray-900">{product.name}</span>. Pass the same{" "}
          <code className="rounded bg-coastal-50 px-1">?ref=</code> query string as the customer confirmation page.
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-gray-600">Loading debug tools…</p>}>
          <BookingReceivedDebug product={product} />
        </Suspense>
      </div>
    </section>
  );
}
