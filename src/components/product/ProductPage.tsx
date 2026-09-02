import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQSection } from "@/components/FAQSection";
import { PlanningLinks } from "@/components/PlanningLinks";
import { JsonLd } from "@/components/JsonLd";
import { ProductBadge } from "@/components/ProductBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PhotoCredits } from "@/components/media/PhotoCredits";
import { ProductStickyCta } from "@/components/product/ProductStickyCta";
import { ProductViewTracker } from "@/components/booking-engine/ProductViewTracker";
import { GuestReviews } from "@/components/product/GuestReviews";
import { breadcrumbSchema, faqSchema, articleSchema, productOfferSchema } from "@/lib/schema";
import { getGuideImage, getExcursionImage } from "@/lib/images";
import { formatCompactPricePerPerson, formatPricePerPerson } from "@/lib/commerce/currency";
import { bookingPrimaryCta, bookingSecondaryCta, bookingSupportingCopy, shouldShowPublicPrice } from "@/lib/booking-status";
import type { ProductExperience } from "@/data/product-pages";
import type { ExcursionPage } from "@/data/types";
import { excursions } from "@/data/excursions";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { PreloadImage } from "@/components/PreloadImage";

const SENTINEL_ID = "product-primary-cta";

export function ProductPage({
  experience,
  excursion,
}: {
  experience: ProductExperience;
  excursion: ExcursionPage;
}) {
  const priceLabel = shouldShowPublicPrice(experience)
    ? formatPricePerPerson(experience.priceAmount, experience.priceCurrency)
    : null;
  const priceCompact = shouldShowPublicPrice(experience)
    ? formatCompactPricePerPerson(experience.priceAmount, experience.priceCurrency)
    : null;
  const primary = bookingPrimaryCta(experience);
  const secondary = bookingSecondaryCta();
  const enquireHref = `${secondary.href}?excursion=${encodeURIComponent(experience.name)}`;
  const primaryHref =
    primary.kind === "enquire"
      ? `${primary.href}?excursion=${encodeURIComponent(experience.name)}`
      : primary.href;
  const ctaSupport = bookingSupportingCopy(experience);
  const facts = experience.quickFacts.split(" · ");
  const related = excursion.relatedExcursionSlugs
    .map((slug) => excursions.find((item) => item.slug === slug))
    .filter(Boolean);
  const ogImage = getExcursionImage(experience.slug);
  const galleryItems = experience.gallery.map((item) => ({
    image: getGuideImage(item.imageKey),
    alt: item.alt,
  }));

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Shore Excursions", path: "/shore-excursions" },
    { name: experience.name, path: experience.path },
  ];

  return (
    <>
      <ProductViewTracker productId={experience.slug} />
      {galleryItems[0]?.image.base && (
        <PreloadImage base={galleryItems[0].image.base} role="gallery" />
      )}
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          faqSchema(excursion.faqs),
          articleSchema({
            title: excursion.seoTitle,
            description: excursion.metaDescription,
            path: experience.path,
            image: ogImage.src,
          }),
          productOfferSchema({
            name: experience.supplierProductName,
            headline: experience.customerHeadline,
            description: experience.proposition,
            path: experience.path,
            image: ogImage.src,
            price: experience.priceAmount,
            currency: experience.priceCurrency,
            duration: experience.durationLabel,
          }),
        ]}
      />

      <article className="product-page pb-24 lg:pb-0">
        <section className="section-padding pt-8 sm:pt-10 lg:pt-14">
          <div className="container-wide">
            <Breadcrumbs items={breadcrumbs} />

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:gap-12">
              <div className="order-1 lg:order-2">
                <ProductBadge label={experience.badge} kind={experience.badgeKind} />
                <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-[2.6rem]">
                  {experience.customerHeadline}
                </h1>
                <p className="mt-3 font-display text-lg text-coastal-800 sm:text-xl">{experience.name}</p>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-700 sm:text-lg">
                  {experience.proposition}
                </p>
                {priceLabel && (
                  <p className="price-amount mt-6 text-3xl font-semibold text-coastal-900">{priceLabel}</p>
                )}
                <ul className="mt-5 flex flex-wrap gap-2">
                  {facts.map((fact) => (
                    <li key={fact} className="pill">
                      {fact}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 hidden lg:block">
                  <ProductCtaCluster
                    primaryHref={primaryHref}
                    primaryLabel={primary.label}
                    secondaryHref={enquireHref}
                    secondaryLabel={secondary.label}
                    microcopy={ctaSupport}
                    sentinelId={SENTINEL_ID}
                  />
                </div>
              </div>

              <div className="order-2 lg:order-1">
                <ProductGallery
                  images={galleryItems}
                  productName={experience.name}
                  video={experience.video}
                />
                <PhotoCredits imageKeys={experience.gallery.map((item) => item.imageKey)} />
              </div>
            </div>

            <div className="mt-8 lg:hidden">
              <ProductCtaCluster
                primaryHref={primaryHref}
                primaryLabel={primary.label}
                secondaryHref={enquireHref}
                secondaryLabel={secondary.label}
                microcopy={ctaSupport}
                sentinelId={`${SENTINEL_ID}-mobile`}
              />
            </div>
          </div>
        </section>

        <section className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="container-wide max-w-3xl">
            <h2 className="section-title text-2xl sm:text-3xl">{experience.whyWeChoseTitle}</h2>
            <p className="mt-5 text-base leading-relaxed text-gray-700 sm:text-lg">{experience.whyWeChose}</p>
          </div>
        </section>

        {experience.importantNotices[0] && (
          <section className="section-padding pt-10 pb-4">
            <div className="container-wide max-w-3xl">
              <div className="rounded-2xl border border-autumn-400/40 bg-autumn-300/10 px-5 py-6 sm:px-8 sm:py-7">
                <h2 className="font-display text-2xl font-semibold text-gray-900">
                  {experience.importantNotices[0].title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-gray-800">{experience.importantNotices[0].body}</p>
              </div>
            </div>
          </section>
        )}

        <section className="section-padding pt-12">
          <div className="container-wide">
            <h2 className="section-title text-2xl sm:text-3xl">{experience.itineraryTitle}</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2">
              {experience.itinerary.map((stop) => (
                <li key={stop.number} className="relative pl-4 sm:pl-0">
                  <p className="font-display text-sm font-semibold tracking-[0.18em] text-maple-600">{stop.number}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-gray-900">{stop.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{stop.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {experience.valueBlocks && experience.valueBlocks.length > 0 && (
          <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="container-wide">
              <h2 className="section-title text-2xl sm:text-3xl">{experience.valueBlocksTitle}</h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {experience.valueBlocks.map((block) => (
                  <li key={block.title} className="rounded-2xl border border-coastal-100 bg-white p-5">
                    <ValueIcon name={block.icon} />
                    <h3 className="mt-3 font-display text-lg font-semibold text-gray-900">{block.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{block.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="section-padding pt-8">
          <div className="container-wide grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="section-title text-2xl">{experience.includedTitle}</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                {experience.included.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coastal-700" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {experience.notIncluded && experience.notIncluded.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display text-lg font-semibold text-gray-900">Not included</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    {experience.notIncluded.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="section-title text-2xl">Is this right for me?</h2>
              <dl className="mt-5 divide-y divide-coastal-100 border-y border-coastal-100">
                {experience.practicalFacts.map((fact) => (
                  <div key={fact.label} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6">
                    <dt className="text-sm font-semibold text-coastal-800">{fact.label}</dt>
                    <dd className="text-sm leading-relaxed text-gray-700">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-8 font-display text-lg font-semibold text-gray-900">Access and walking</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                {experience.accessibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3 className="mt-8 font-display text-lg font-semibold text-gray-900">What to bring</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                {experience.whatToBring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {experience.importantNotices.slice(1).map((notice) => (
          <section key={notice.title} className="px-4 pb-8 sm:px-6 lg:px-8">
            <div className="container-wide max-w-3xl rounded-2xl border border-coastal-100 bg-coastal-50/70 px-5 py-6 sm:px-8">
              <h2 className="font-display text-xl font-semibold text-gray-900">{notice.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{notice.body}</p>
            </div>
          </section>
        ))}

        <section className="section-padding pt-4">
          <div className="container-wide">
            <h2 className="section-title text-2xl">Keep planning this Cadiz day</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {experience.authorityLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="pill hover:bg-coastal-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="container-wide overflow-hidden rounded-3xl bg-coastal-900 px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-autumn-300">{experience.badge}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{experience.customerHeadline}</h2>
            {priceLabel && <p className="price-amount mt-4 text-2xl text-white">{priceLabel}</p>}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-coastal-100 sm:text-base">
              {ctaSupport}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryHref} className="btn-primary bg-white text-coastal-900 hover:bg-coastal-50">
                {primary.label}
              </Link>
              <Link href={enquireHref} className="btn-secondary border-white/20 bg-transparent text-white hover:bg-white/10">
                {secondary.label}
              </Link>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="section-padding pt-4">
            <div className="container-wide">
              <h2 className="section-title text-2xl mb-6">Related Cadiz days</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {related.map(
                  (item) =>
                    item && (
                      <Link key={item.slug} href={`/shore-excursions/${item.slug}`} className="card-editorial group overflow-hidden">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <ResponsiveImage
                            image={getExcursionImage(item.slug)}
                            role="card"
                            imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-base font-bold text-gray-900 group-hover:text-coastal-800">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">{item.tagline}</p>
                        </div>
                      </Link>
                    ),
                )}
              </div>
            </div>
          </section>
        )}

        <section className="section-padding pt-4">
          <div className="container-wide max-w-4xl">
            <FAQSection faqs={excursion.faqs} title={`${experience.name} — FAQs`} />
            <GuestReviews reviews={experience.reviews} />
            <div className="mt-12">
              <PlanningLinks />
            </div>
          </div>
        </section>
      </article>

      <ProductStickyCta
        priceCompact={priceCompact}
        href={primaryHref}
        label={primary.label}
        sentinelId="product-primary-cta-mobile"
      />
    </>
  );
}

function ProductCtaCluster({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  microcopy,
  sentinelId,
}: {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  microcopy: string;
  sentinelId: string;
}) {
  return (
    <div id={sentinelId}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={primaryHref} className="btn-primary">
          {primaryLabel}
        </Link>
        <Link href={secondaryHref} className="btn-secondary">
          {secondaryLabel}
        </Link>
      </div>
      <p className="mt-3 text-sm text-gray-600">{microcopy}</p>
    </div>
  );
}

function ValueIcon({ name }: { name: "transfer" | "sunbed" | "umbrella" | "drink" | "time" }) {
  const className = "h-6 w-6 text-coastal-800";
  if (name === "transfer") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h13l3 4v4H3v-8z" />
        <circle cx="7.5" cy="18.5" r="1.5" />
        <circle cx="16.5" cy="18.5" r="1.5" />
        <path strokeLinecap="round" d="M8 10V7h6v3" />
      </svg>
    );
  }
  if (name === "sunbed") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l7-6 9 8" />
        <path strokeLinecap="round" d="M4 19h16M7 16v3M17 18v1" />
      </svg>
    );
  }
  if (name === "umbrella") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5c5 0 8 3 8 3H4s3-3 8-3z" />
        <path strokeLinecap="round" d="M12 8v11M12 19h3" />
      </svg>
    );
  }
  if (name === "drink") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 5h10l-1.5 14h-7L7 5z" />
        <path strokeLinecap="round" d="M7 9h10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8v4l3 2" />
    </svg>
  );
}
