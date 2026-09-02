"use client";

import Link from "next/link";
import { BOOKABLE_PRODUCTS, type BookableProduct } from "@/data/bookable-products";
import { formatPricePerPerson } from "@/lib/commerce/currency";
import { ProductBadge } from "@/components/ProductBadge";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { getGuideImage } from "@/lib/images";
import { trackBookingEvent } from "@/platform/booking/analytics";

type Column = {
  product: BookableProduct;
  bestFor: string;
  includes: string[];
  doesNotInclude?: string[];
};

function productById(id: string): BookableProduct {
  const product = BOOKABLE_PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Missing bookable product: ${id}`);
  return product;
}

const COLUMNS: Column[] = [
  {
    product: productById("best-value"),
    bestFor: "Independent travellers who want flexibility and value after the long drive from Cádiz.",
    includes: [
      "Return transport from the cruise port",
      "Plaza de España stop",
      "Orientation / panoramic sightseeing",
      "Approximately 3–4 hours free time",
    ],
    doesNotInclude: [
      "Cathedral admission",
      "Real Alcázar admission",
      "Guided historic-centre sightseeing",
    ],
  },
  {
    product: productById("best-overall"),
    bestFor: "Guests who want Seville's headline sights organised — smaller group, tickets included.",
    includes: [
      "Smaller group — max 20 per guide",
      "Guided Santa Cruz",
      "Cathedral admission (skip-the-line)",
      "Real Alcázar admission (skip-the-line)",
      "Guided monument visits",
      "Approximately 1–2 hours free time",
    ],
  },
];

function trackSelect(productId: string) {
  trackBookingEvent("seville_comparison_selected", { productId });
}

export function SevilleComparison() {
  return (
    <section className="section-padding bg-coastal-50/40" aria-labelledby="seville-comparison-heading">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow">Seville from Cádiz</p>
          <h2 id="seville-comparison-heading" className="section-title mt-2">
            Going to Seville from Cádiz? Choose how you want to see it.
          </h2>
          <p className="section-subtitle mx-auto">
            Same long road inland. Two different days: freedom and value, or guided inclusions with a smaller group.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {COLUMNS.map(({ product, bestFor, includes, doesNotInclude }) => {
            const priceLabel = formatPricePerPerson(product.priceAmount, product.priceCurrency);
            const image = getGuideImage(product.imageKey);
            return (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-coastal-100 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-coastal-100">
                  <ResponsiveImage
                    image={{ ...image, alt: product.imageAlt }}
                    role="card"
                    imgClassName="h-full w-full object-cover"
                    priority={false}
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProductBadge label={product.badge} kind={product.badgeKind} />
                    {priceLabel && (
                      <p className="font-display text-2xl font-semibold text-coastal-900">{priceLabel}</p>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-gray-900 sm:text-2xl">{product.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.benefit}</p>
                  <p className="mt-4 text-sm leading-relaxed text-gray-700">
                    <span className="font-semibold text-gray-900">Best for: </span>
                    {bestFor}
                  </p>

                  <div className="mt-6 flex-1 space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-coastal-700">Includes</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                        {includes.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coastal-500" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {doesNotInclude && doesNotInclude.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Does not include</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                          {doesNotInclude.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href={product.path}
                      className="btn-primary"
                      onClick={() => trackSelect(product.id)}
                    >
                      View excursion
                    </Link>
                    {product.bookingPath && (
                      <Link
                        href={product.bookingPath}
                        className="btn-secondary"
                        onClick={() => trackSelect(product.id)}
                      >
                        Book this excursion
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
