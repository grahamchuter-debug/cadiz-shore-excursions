import Link from "next/link";
import type { BookableProduct } from "@/data/bookable-products";
import { formatPricePerPerson } from "@/lib/commerce/currency";
import { bookingPrimaryCta, bookingSupportingCopy, shouldShowPublicPrice } from "@/lib/booking-status";
import { buildPlannerBookingHref } from "@/lib/planner-booking";
import { ProductBadge } from "@/components/ProductBadge";

function MatchCard({
  product,
  matchReason,
  guests,
  variant,
  onRequestBook,
}: {
  product: BookableProduct;
  matchReason: string;
  guests: { adults: number; children: number };
  variant: "primary" | "alternative";
  onRequestBook?: () => void;
}) {
  const priceLabel = shouldShowPublicPrice(product)
    ? formatPricePerPerson(product.priceAmount, product.priceCurrency)
    : null;
  const bookingHref = buildPlannerBookingHref(product, guests);
  const cta = bookingPrimaryCta(product);

  return (
    <article
      className={
        variant === "primary"
          ? "rounded-xl border border-coastal-200 bg-white p-4 sm:p-5"
          : "rounded-xl border border-coastal-100 bg-coastal-50/40 p-4"
      }
    >
      {variant === "alternative" && (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Also worth considering</p>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <ProductBadge label={product.badge} kind={product.badgeKind} />
        <h3 className="font-display text-base font-bold text-gray-900 sm:text-lg">{product.name}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        <span className="font-medium text-gray-900">Why it suits your day: </span>
        {matchReason}
      </p>
      {priceLabel && (
        <p className="mt-3 font-display text-base font-semibold text-coastal-900 sm:text-lg">{priceLabel}</p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={cta.kind === "request" || cta.kind === "book" ? bookingHref : cta.href}
          className="btn-primary inline-flex justify-center text-sm sm:text-base"
          onClick={onRequestBook}
        >
          {cta.label}
        </Link>
        <Link href={product.path} className="text-sm font-medium text-coastal-800 underline-offset-2 hover:underline">
          View excursion details
        </Link>
      </div>
      {variant === "primary" && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">{bookingSupportingCopy(product)}</p>
      )}
    </article>
  );
}

export function PlannerBookableMatch({
  primary,
  alternative,
  guests,
  onRequestBook,
  onAlternativeRequestBook,
}: {
  primary: { product: BookableProduct; matchReason: string };
  alternative?: { product: BookableProduct; matchReason: string } | null;
  guests: { adults: number; children: number };
  onRequestBook?: () => void;
  onAlternativeRequestBook?: () => void;
}) {
  return (
    <section className="space-y-4" aria-labelledby="planner-best-match">
      <div>
        <p id="planner-best-match" className="text-xs font-semibold uppercase tracking-wide text-maple-600">
          Best match for your day
        </p>
      </div>
      <MatchCard product={primary.product} matchReason={primary.matchReason} guests={guests} variant="primary" onRequestBook={onRequestBook} />
      {alternative && (
        <MatchCard
          product={alternative.product}
          matchReason={alternative.matchReason}
          guests={guests}
          variant="alternative"
          onRequestBook={onAlternativeRequestBook}
        />
      )}
    </section>
  );
}

export function PlannerIndependentDayNote({ note }: { note: string }) {
  return (
    <aside className="rounded-xl border border-coastal-100 bg-coastal-50/60 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-coastal-700">Independent exploration</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{note}</p>
    </aside>
  );
}
