import { excursions } from "./excursions";
import { recommendBookableProducts } from "./planner-recommendations";

export interface PlannerInput {
  arrivalTime: string;
  departureTime: string;
  adults: number;
  children: number;
  interests: string[];
  mobility: "full" | "some" | "limited";
  budget: "budget" | "mid" | "premium";
  style: "guided" | "mix" | "diy";
}

export interface PlannerLink {
  label: string;
  href: string;
  why: string;
}

export interface PlannerResult {
  headline: string;
  summary: string;
  excursions: PlannerLink[];
  guides: PlannerLink[];
  logistics: PlannerLink[];
  dayPlan: { time: string; text: string }[];
  returnConfidence: "high" | "medium" | "low";
  commercial?: {
    primary: { productId: string; matchReason: string };
    alternative?: { productId: string; matchReason: string };
  };
  independentDay?: boolean;
  independentNote?: string;
}

export const INTEREST_OPTIONS = [
  { id: "seville", label: "Seville day trip" },
  { id: "cadiz", label: "Historic Cádiz" },
  { id: "food", label: "Food & tapas" },
  { id: "wine", label: "Wine & sherry" },
  { id: "history", label: "History & monuments" },
  { id: "beaches", label: "Beaches & coast" },
  { id: "villages", label: "White Villages" },
  { id: "culture", label: "Flamenco & culture" },
  { id: "family", label: "Family-friendly" },
];

const INTEREST_TO_EXCURSION: Record<string, string[]> = {
  seville: ["seville-on-your-own", "small-group-seville", "seville-highlights", "seville-cathedral-and-alcazar"],
  cadiz: ["cadiz-walking-tour", "cadiz-highlights"],
  food: ["andalusian-food-experience", "cadiz-walking-tour"],
  wine: ["jerez-and-sherry-experience", "andalusian-food-experience"],
  history: ["cadiz-walking-tour", "small-group-seville", "seville-cathedral-and-alcazar", "cadiz-highlights"],
  beaches: ["cadiz-highlights", "cadiz-walking-tour"],
  villages: ["white-villages-tour"],
  culture: ["flamenco-experience", "cadiz-walking-tour"],
  family: ["cadiz-highlights", "cadiz-walking-tour", "white-villages-tour"],
};

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function hoursAshore(arrival: string, departure: string): number {
  const diff = parseTime(departure) - parseTime(arrival);
  return Math.max(0, diff / 60);
}

function excursionLink(slug: string, why: string): PlannerLink | null {
  const e = excursions.find((x) => x.slug === slug);
  if (!e) return null;
  return { label: e.title, href: `/shore-excursions/${slug}`, why };
}

export function generateCadizPlan(input: PlannerInput): PlannerResult {
  const { arrivalTime, departureTime, adults, children, interests, mobility, budget, style } = input;
  const party = adults + children;
  const hasKids = children > 0;
  const hours = hoursAshore(arrivalTime, departureTime);
  const shortDay = hours < 5;
  const standardDay = hours >= 5 && hours < 8;
  const longDay = hours >= 8;

  const excSlugs: string[] = [];
  const pushSlug = (s: string) => {
    if (s && !excSlugs.includes(s)) excSlugs.push(s);
  };

  const activeInterests = interests.length ? interests : ["cadiz", "history"];
  for (const interest of activeInterests) {
    for (const s of INTEREST_TO_EXCURSION[interest] ?? []) pushSlug(s);
  }

  if (hasKids) pushSlug("cadiz-highlights");
  if (mobility === "limited") pushSlug("private-andalusia-shore-excursion");
  if (style === "diy") pushSlug("cadiz-walking-tour");

  if (shortDay) {
    pushSlug("cadiz-walking-tour");
    pushSlug("cadiz-highlights");
    ["seville-on-your-own", "small-group-seville", "seville-highlights", "seville-cathedral-and-alcazar", "white-villages-tour"].forEach((s) => {
      const idx = excSlugs.indexOf(s);
      if (idx >= 0) excSlugs.splice(idx, 1);
    });
  } else if (standardDay) {
    if (activeInterests.includes("seville") && longDay === false) pushSlug("seville-on-your-own");
    if (activeInterests.includes("wine")) pushSlug("jerez-and-sherry-experience");
    if (activeInterests.includes("villages")) pushSlug("white-villages-tour");
  } else if (longDay) {
    if (activeInterests.includes("seville")) pushSlug("small-group-seville");
    if (activeInterests.includes("villages")) pushSlug("white-villages-tour");
    if (activeInterests.includes("food")) pushSlug("andalusian-food-experience");
  }

  if (style === "guided" && party >= 2) pushSlug("private-andalusia-shore-excursion");
  if (budget === "premium") pushSlug("private-andalusia-shore-excursion");
  if (activeInterests.includes("seville") && style === "guided") pushSlug("small-group-seville");
  if (activeInterests.includes("seville") && (style === "diy" || style === "mix")) pushSlug("seville-on-your-own");

  const reasonMap: Record<string, string> = {
    "seville-on-your-own": "Best Value Seville — transport, Plaza de España and ~3–4 hours free time.",
    "small-group-seville": "Best Overall — Cathedral and Real Alcázar included with a max-20 guide.",
    "seville-highlights": longDay ? "You have enough hours for Andalusia's headline city." : "Only on long port days — check your departure time.",
    "seville-cathedral-and-alcazar": "The deepest Seville experience when your call is 8+ hours.",
    "cadiz-walking-tour": "Walkable from the pier — low-risk and rich in history.",
    "cadiz-highlights": "The best half-day introduction to Cádiz without long drives.",
    "jerez-and-sherry-experience": "Sherry bodegas and equestrian heritage within a manageable drive.",
    "white-villages-tour": "Arcos and Vejer — ideal for repeat visitors avoiding Seville.",
    "andalusian-food-experience": "Tapas, markets and authentic southern Spanish flavours.",
    "flamenco-experience": "Andalusia's living culture in an evening or afternoon show.",
    "private-andalusia-shore-excursion": mobility === "limited" ? "Flexible vehicle and pacing for your group." : "Maximum return-to-ship confidence.",
    "small-group-seville-tour": "More intimate Seville access than a large coach.",
  };

  const excursionLinks = excSlugs
    .slice(0, 5)
    .map((s) => excursionLink(s, reasonMap[s] ?? "A strong match for your interests."))
    .filter((x): x is PlannerLink => x !== null);

  const guides: PlannerLink[] = [
    { label: "Cadiz Cruise Port Guide", href: "/cruise-port-guide", why: "Terminal layout, walking distances and realistic transfer times." },
    { label: "One Day in Cadiz", href: "/one-day-in-cadiz-from-a-cruise-ship", why: "Itineraries matched to your hours ashore." },
    { label: "Best Things to Do", href: "/best-things-to-do-in-cadiz-from-a-cruise-ship", why: "Compare Cádiz, Seville, Jerez and the White Villages." },
  ];
  if (activeInterests.includes("seville")) guides.push({ label: "Seville from the Port", href: "/seville-from-cadiz-cruise-port", why: "Drive times, what fits and return buffers explained." });
  if (activeInterests.includes("food")) guides.push({ label: "Markets & Tapas Guide", href: "/cadiz-markets-and-tapas-guide", why: "Where cruise passengers eat well on a port day." });
  if (activeInterests.includes("wine")) guides.push({ label: "Sherry Bodegas Tour", href: "/sherry-bodegas-tour", why: "Jerez tastings and timing from Cádiz." });
  if (activeInterests.includes("villages")) guides.push({ label: "White Villages Guide", href: "/white-villages-from-cadiz", why: "Vejer, Arcos and hill-town logistics." });
  if (hasKids) guides.push({ label: "First-Time Visitor Picks", href: "/best-cadiz-excursions-for-first-time-visitors", why: "Family-paced options with manageable walking." });

  const logistics: PlannerLink[] = [
    { label: "Ship Schedules", href: "/ship-schedules", why: "See if other ships share your port day." },
    { label: "Independent vs Ship Excursions", href: "/independent-vs-cruise-line-excursions", why: "Compare flexibility and return-to-ship guarantees." },
    { label: "FAQ", href: "/faq", why: "Common Cadiz cruise passenger questions answered." },
  ];

  const dayPlan: { time: string; text: string }[] = [];
  const topExc = excursionLinks[0]?.label ?? "your chosen excursion";

  dayPlan.push({ time: "On arrival", text: "Disembark at the Alfonso XIII pier. Allow 30–45 minutes for immigration and terminal exit before your excursion or walk begins." });

  if (shortDay) {
    dayPlan.push({ time: "Morning", text: `Stay in Cádiz: ${topExc}. The old town and La Caleta are walkable — skip Seville and long drives.` });
    dayPlan.push({ time: "Midday", text: activeInterests.includes("food") ? "Tapas near Plaza de las Flores or the central market." : "Cathedral exterior and a stroll along the Atlantic promenade." });
    dayPlan.push({ time: "Return", text: "Head back 45–60 minutes before all-aboard. Short port days leave little margin for inland trips." });
  } else if (standardDay) {
    if (activeInterests.includes("seville") && longDay) {
      dayPlan.push({ time: "Early start", text: `Depart for Seville immediately after disembarkation — ${topExc} needs roughly 90 minutes each way.` });
      dayPlan.push({ time: "Midday", text: "Plaza de España and Santa Cruz quarter with a guided lunch stop." });
      dayPlan.push({ time: "Afternoon", text: "Return drive to Cádiz with a 60–75 minute buffer before all-aboard." });
    } else {
      dayPlan.push({ time: "Morning", text: `Start with ${topExc} — ${activeInterests.includes("wine") ? "Jerez bodegas suit a standard port window." : "Cádiz old town rewards an early start before crowds."}` });
      dayPlan.push({ time: "Midday", text: activeInterests.includes("food") ? "Market visit and tapas in the old town." : "Lunch near the cathedral or La Caleta beach." });
      dayPlan.push({ time: "Afternoon", text: activeInterests.includes("villages") ? "White Villages if pre-booked with a tour tracking ship time." : "Relaxed coastal walk or second old-town sights." });
      dayPlan.push({ time: "Return buffer", text: "Allow 45–60 minutes margin for city days, 60–75 for Jerez or White Villages." });
    }
  } else {
    dayPlan.push({ time: "Early start", text: `Maximise your long day: ${topExc}. You have time for Seville, Jerez or a full White Villages loop.` });
    dayPlan.push({ time: "Midday", text: activeInterests.includes("seville") ? "Seville cathedral quarter and riverfront." : activeInterests.includes("food") ? "Andalusian food experience with market and tapas." : "Jerez sherry tasting or Vejer hill-town views." });
    dayPlan.push({ time: "Afternoon", text: "Second experience or relaxed return via coastal road." });
    dayPlan.push({ time: "Return buffer", text: "Even on long days, keep 60–75 minutes margin. Confirm your tour tracks ship departure." });
  }

  let returnConfidence: PlannerResult["returnConfidence"] = "high";
  if (excSlugs.some((s) => ["seville-on-your-own", "small-group-seville", "seville-highlights", "seville-cathedral-and-alcazar"].includes(s)) && !longDay) returnConfidence = "low";
  else if (excSlugs.includes("white-villages-tour") && shortDay) returnConfidence = "medium";
  else if (shortDay) returnConfidence = "medium";

  const interestLabels = activeInterests.map((i) => INTEREST_OPTIONS.find((o) => o.id === i)?.label ?? i).join(", ");

  const recommendation = recommendBookableProducts(input, "cadiz", hours);
  const commercial: PlannerResult["commercial"] = recommendation.primary
    ? {
        primary: {
          productId: recommendation.primary.productId,
          matchReason: recommendation.primary.matchReason,
        },
        alternative: recommendation.alternative
          ? {
              productId: recommendation.alternative.productId,
              matchReason: recommendation.alternative.matchReason,
            }
          : undefined,
      }
    : undefined;

  return {
    headline: `Your Cadiz Port-Day Plan (${hours.toFixed(1)} hours ashore)`,
    summary: `A ${shortDay ? "short" : standardDay ? "standard" : "long"} port day for ${party} guest${party === 1 ? "" : "s"} focused on ${interestLabels.toLowerCase()}. ${style === "guided" ? "Guided tours recommended for Seville and inland trips." : style === "diy" ? "DIY works well in Cádiz old town — book Seville tickets ahead if going independently." : "A mix of guided and independent suits most Cadiz calls."}`,
    excursions: excursionLinks,
    guides,
    logistics,
    dayPlan,
    returnConfidence,
    commercial,
    independentDay: recommendation.independentDay,
    independentNote: recommendation.independentNote,
  };
}
