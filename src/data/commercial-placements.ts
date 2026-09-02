import { getBookableProduct, type BookableProduct } from "./bookable-products";

export type CommercialPlacement = {
  heading: string;
  body: string;
  ctaLabel: string;
  product: BookableProduct;
};

const copy: Record<string, { productId: string; heading: string; body: string; ctaLabel: string }[]> = {
  "/seville-from-cadiz-cruise-port": [
    {
      productId: "best-value",
      heading: "Want Seville with time that is yours?",
      body: "If the long drive from Cádiz is worth it for flexibility, Seville On Your Own covers return transport, Plaza de España and around 3–4 hours free in the centre — Cathedral and Alcázar tickets stay optional.",
      ctaLabel: "View Best Value Seville",
    },
    {
      productId: "best-overall",
      heading: "Prefer Cathedral and Alcázar organised?",
      body: "Small-Group Seville builds skip-the-line Cathedral and Real Alcázar visits into the day, with a maximum of 20 guests per guide. Passport details are required for every guest before you book.",
      ctaLabel: "View Best Overall Seville",
    },
  ],
  "/one-day-in-cadiz-from-a-cruise-ship": [
    {
      productId: "best-value",
      heading: "Leaving the peninsula for Seville?",
      body: "A Cádiz walking day stays near the pier. If your call is long enough for the inland drive, the Best Value Seville day keeps free time high after Plaza de España.",
      ctaLabel: "View Seville On Your Own",
    },
    {
      productId: "best-overall",
      heading: "Fuller Seville on a long call",
      body: "When hours ashore support it, Best Overall adds guided Santa Cruz plus Cathedral and Alcázar admissions — less free wandering, more of the headline interiors handled for you.",
      ctaLabel: "View Small-Group Seville",
    },
  ],
  "/best-cadiz-excursions-for-first-time-visitors": [
    {
      productId: "best-overall",
      heading: "First visit and Seville is the priority",
      body: "First-timers who want Andalusia's golden city with the two essential interiors included usually start with Small-Group Seville — provided the port day is long enough for the road time.",
      ctaLabel: "View Best Overall",
    },
    {
      productId: "best-value",
      heading: "First visit, but you want to wander",
      body: "If you already know how you use free time in a historic centre, Best Value gives you the coach logistics and leaves the monuments optional during ~3–4 hours ashore in Seville.",
      ctaLabel: "View Best Value",
    },
  ],
  "/independent-vs-cruise-line-excursions": [
    {
      productId: "best-value",
      heading: "Independent in Seville — without DIY transfers",
      body: "Walking Cádiz from the pier is easy alone. Seville is not: the value of an independent-style day is often the organised coach and return buffer, which is exactly what Best Value sells.",
      ctaLabel: "View Seville On Your Own",
    },
    {
      productId: "best-overall",
      heading: "When guided inclusions beat DIY tickets",
      body: "If skip-the-line Cathedral and Alcázar matter more than maximising free time, Best Overall is the independent-operator alternative we put against a large cruise-line coach day.",
      ctaLabel: "View Small-Group Seville",
    },
  ],
  "/shore-excursions": [
    {
      productId: "best-value",
      heading: "Best Value — Seville On Your Own",
      body: "€88 per adult: return transport from the Cádiz pier, Plaza de España and around 3–4 hours free in Seville's historic centre.",
      ctaLabel: "View Best Value",
    },
    {
      productId: "best-overall",
      heading: "Best Overall — Small-Group Seville",
      body: "€229 per adult: max 20 per guide, guided Santa Cruz, and skip-the-line Cathedral and Real Alcázar admissions.",
      ctaLabel: "View Best Overall",
    },
  ],
};

export function getCommercialPlacements(pagePath: string): CommercialPlacement[] {
  const path = pagePath.replace(/\/$/, "") || "/";
  return (copy[path] ?? [])
    .map((item) => {
      const product = getBookableProduct(item.productId);
      if (!product) return null;
      return {
        heading: item.heading,
        body: item.body,
        ctaLabel: item.ctaLabel,
        product,
      };
    })
    .filter((x): x is CommercialPlacement => x !== null);
}
