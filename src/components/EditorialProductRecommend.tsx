import Link from "next/link";
import type { BookableProduct } from "@/data/bookable-products";
import { formatPricePerPerson } from "@/lib/commerce/currency";
import { shouldShowPublicPrice } from "@/lib/booking-status";
import { ProductBadge } from "@/components/ProductBadge";

export function EditorialProductRecommend({
  product,
  heading,
  body,
  ctaLabel,
}: {
  product: BookableProduct;
  heading: string;
  body: string;
  ctaLabel?: string;
}) {
  const priceLabel = shouldShowPublicPrice(product)
    ? formatPricePerPerson(product.priceAmount, product.priceCurrency)
    : null;

  return (
    <aside className="mt-10 rounded-2xl border border-coastal-100 bg-gradient-to-br from-coastal-50/90 to-white p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-maple-600">{heading}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ProductBadge label={product.badge} kind={product.badgeKind} />
        <h2 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">{product.name}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700 sm:text-base">{body}</p>
      {priceLabel && (
        <p className="mt-4 font-display text-lg font-semibold text-coastal-900">{priceLabel}</p>
      )}
      <Link href={product.path} className="btn-primary mt-5 inline-flex">
        {ctaLabel ?? `View ${product.shortName}`}
      </Link>
    </aside>
  );
}

export function CommercialPlacementList({
  placements,
}: {
  placements: {
    product: BookableProduct;
    heading: string;
    body: string;
    ctaLabel: string;
  }[];
}) {
  if (!placements.length) return null;
  return (
    <div className="mt-10 space-y-6">
      {placements.map((p) => (
        <EditorialProductRecommend
          key={`${p.product.id}-${p.heading}`}
          product={p.product}
          heading={p.heading}
          body={p.body}
          ctaLabel={p.ctaLabel}
        />
      ))}
    </div>
  );
}
