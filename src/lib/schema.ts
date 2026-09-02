import { SITE } from "./site";
import { absoluteUrl } from "./paths";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(SITE.url, item.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function travelGuideSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelGuide",
    name: title,
    description,
    url: absoluteUrl(SITE.url, path),
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    inLanguage: "en-GB",
  };
}

export function articleSchema({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(SITE.url, path),
    ...(image ? { image: absoluteUrl(SITE.url, image) } : {}),
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    inLanguage: "en-GB",
  };
}

/** TravelAgency / LocalBusiness for the Cadiz cruise planning brand. */
export function travelAgencySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    areaServed: {
      "@type": "City",
      name: "Cadiz",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cadiz",
        addressRegion: "Andalusia",
        addressCountry: "ES",
      },
    },
    knowsAbout: [
      "Cadiz shore excursions",
      "Cadiz cruise port guide",
      "Seville day trips from Cadiz",
      "Jerez sherry tours",
      "White Villages Andalusia",
      "Andalusian food and flamenco",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.email,
      contactType: "customer service",
      areaServed: "ES",
      availableLanguage: ["English", "Spanish"],
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.email,
      contactType: "customer service",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-GB",
  };
}

export function webPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(SITE.url, path),
  };
}

export function productOfferSchema({
  name,
  headline,
  description,
  path,
  image,
  price,
  currency,
  duration,
}: {
  name: string;
  headline: string;
  description: string;
  path: string;
  image?: string;
  price: number | null;
  currency: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    alternateName: headline,
    description,
    url: absoluteUrl(SITE.url, path),
    ...(image ? { image: absoluteUrl(SITE.url, image) } : {}),
    ...(duration
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Duration",
            value: duration,
          },
        }
      : {}),
    ...(price != null
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: currency,
            url: absoluteUrl(SITE.url, path),
          },
        }
      : {}),
  };
}
