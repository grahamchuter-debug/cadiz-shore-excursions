import Link from "next/link";
import type { BookableProduct } from "@/data/bookable-products";
import { formatPricePerPerson } from "@/lib/commerce/currency";
import { shouldShowPublicPrice } from "@/lib/booking-status";
import { getGuideImage } from "@/lib/images";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { ProductBadge } from "@/components/ProductBadge";

export function PriorityProductCard({
  product,
  ctaLabel,
}: {
  product: BookableProduct;
  ctaLabel?: string;
}) {
  const image = getGuideImage(product.imageKey);
  const priceLabel = shouldShowPublicPrice(product)
    ? formatPricePerPerson(product.priceAmount, product.priceCurrency)
    : null;
  const label = ctaLabel ?? product.ctaLabel;

  return (
    <article className="card-editorial group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <ResponsiveImage
          image={{ ...image, alt: product.imageAlt }}
          role="card"
          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coastal-900/55 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute left-3 top-3">
          <ProductBadge label={product.badge} kind={product.badgeKind} overlay />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-coastal-800">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{product.benefit}</p>
        {priceLabel && (
          <p className="mt-4 font-display text-xl font-semibold text-coastal-900">{priceLabel}</p>
        )}
        <Link href={product.path} className="btn-primary mt-5 w-full sm:w-auto">
          {label}
        </Link>
      </div>
    </article>
  );
}
