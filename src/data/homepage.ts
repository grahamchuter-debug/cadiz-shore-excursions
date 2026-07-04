import type { FAQ, VisitorType } from "./types";

export const visitorTypes: VisitorType[] = [
  {
    id: "first-time",
    label: "First time in Cadiz on a cruise",
    shortLabel: "First visit",
    description: "Choose between historic Cádiz on foot or a Seville day trip — we help you pick the right first experience.",
    href: "/best-cadiz-excursions-for-first-time-visitors",
    cta: "See first-timer picks",
  },
  {
    id: "repeat",
    label: "I've been to Seville before",
    shortLabel: "Repeat visitor",
    description: "Jerez sherry, White Villages, flamenco and Andalusian food — alternatives beyond the usual Seville coach tour.",
    href: "/best-cadiz-excursions-for-repeat-visitors",
    cta: "Explore alternatives",
  },
  {
    id: "food-wine",
    label: "Here for Andalusian food and wine",
    shortLabel: "Food & wine",
    description: "Markets, tapas, sherry bodegas and authentic southern Spanish flavours from the Cadiz cruise port.",
    href: "/best-cadiz-excursions-for-food-and-wine-lovers",
    cta: "Food & wine guides",
  },
  {
    id: "cadiz-city",
    label: "I want to explore Cadiz itself",
    shortLabel: "Stay in Cádiz",
    description: "Walkable old town, cathedral, La Caleta beach and Atlantic views — no long coach rides required.",
    href: "/cadiz-old-town-walking-guide",
    cta: "Cadiz city guide",
  },
];

export interface HomeSection {
  slug: string;
  number: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export const coreSections: HomeSection[] = [
  { slug: "shore-excursions", number: "01", title: "Shore Excursions", description: "Premium, cruise-timed tours of Cádiz, Seville, Jerez sherry country and the White Villages.", href: "/shore-excursions", cta: "Browse excursions" },
  { slug: "cruise-port-guide", number: "02", title: "Cadiz Cruise Port Guide", description: "Where ships dock, walking distances to the old town, taxi options and return-to-ship timing.", href: "/cruise-port-guide", cta: "Read the guide" },
  { slug: "one-day", number: "03", title: "One Day in Cadiz", description: "Realistic port-day itineraries — historic Cádiz, Seville, Jerez or White Villages matched to your hours.", href: "/one-day-in-cadiz-from-a-cruise-ship", cta: "See day plans" },
  { slug: "seville", number: "04", title: "Seville from the Port", description: "Drive times, what fits your port window and how to visit Andalusia's golden city with confidence.", href: "/seville-from-cadiz-cruise-port", cta: "Seville guide" },
  { slug: "food", number: "05", title: "Andalusian Food & Sherry", description: "Markets, tapas, sherry bodegas and why Cádiz is one of Spain's great culinary ports.", href: "/andalusian-food-guide", cta: "Food guide" },
  { slug: "ship-schedules", number: "06", title: "Cruise Ship Schedules", description: "See which ships are scheduled at Cadiz before you book excursions or day trips.", href: "/ship-schedules", cta: "Check schedules" },
  { slug: "cruise-planner", number: "07", title: "Cadiz Cruise Planner", description: "Enter your ship times and interests — get tailored excursion ideas with return-to-ship confidence.", href: "/cruise-planner", cta: "Start planning" },
  { slug: "compare", number: "08", title: "Independent vs Ship Excursions", description: "Compare cruise-line tours with independent options — flexibility, value and timing.", href: "/independent-vs-cruise-line-excursions", cta: "Compare options" },
];

export function getHomepageFaqs(): FAQ[] {
  return [
    {
      question: "Where do cruise ships dock in Cadiz?",
      answer:
        "Most ships berth at the Alfonso XIII cruise terminal on the city waterfront, within walking distance of the historic old town and La Caleta beach. See our Cadiz Cruise Port Guide for terminal details and realistic walking times.",
    },
    {
      question: "Should I visit Seville or stay in Cadiz on a port day?",
      answer:
        "It depends on your hours ashore and whether you've been before. Seville needs a full day with roughly 90 minutes each way from the port. Historic Cádiz is walkable and rewarding for shorter calls or passengers who prefer less coach time. Our planner helps you choose.",
    },
    {
      question: "Can I visit Jerez or the White Villages from Cadiz?",
      answer:
        "Yes. Jerez is about 45 minutes each way — ideal for sherry tastings on a standard port day. White Villages like Vejer and Arcos need 45–60 minutes each way and suit repeat visitors or long calls. See our dedicated guides.",
    },
    {
      question: "How much time do I need to get back to my ship?",
      answer:
        "Allow 45–60 minutes buffer for Cádiz city walks, 60–75 minutes for Jerez or White Villages, and only attempt Seville on port days with 8+ usable hours ashore. Always confirm all-aboard with your cruise line.",
    },
    {
      question: "Should I book a cruise-line excursion or go independent in Cadiz?",
      answer:
        "Ship excursions guarantee the vessel waits if you're delayed. Independent tours often offer smaller groups, better food focus and more flexibility — but you must respect all-aboard times. See our Independent vs Cruise Line Excursions guide.",
    },
  ];
}
