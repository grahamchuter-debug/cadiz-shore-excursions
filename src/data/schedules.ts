import type { ScheduleEntry, ShipSchedulePort } from "./types";
import {
  filterEntriesByMonth,
  filterEntriesByYear,
  getMonthsWithEntries,
  type ScheduleYear,
} from "@/lib/schedule-utils";
import cadizSchedule from "./imported-schedules/cadiz.json";

const SCHEDULE_FAQS = [
  {
    question: "How accurate are the Cadiz cruise ship schedules?",
    answer:
      "Schedules are compiled from published cruise timetables and updated periodically. Times, berths and dates can change — always confirm your arrival and departure with your cruise line before booking shore excursions.",
  },
  {
    question: "Where do ships dock when they call at Cadiz?",
    answer:
      "Most vessels berth at the Alfonso XIII cruise terminal on the city waterfront, within walking distance of the old town. See our Cadiz Cruise Port Guide for details.",
  },
  {
    question: "When is Cadiz cruise season?",
    answer:
      "Cadiz sees most cruise calls from April through October, with peak traffic in May, June, September and October. Winter calls occur but are less frequent.",
  },
];

const SCHEDULE_TIPS = [
  "Check how many ships share your port day before booking Seville coach tours",
  "Confirm your berth — most calls are walkable to the old town from Alfonso XIII pier",
  "Book Seville and White Villages excursions early on multi-ship days",
  "Compare your hours ashore before choosing between Cádiz city and inland day trips",
];

export const schedulePorts: ShipSchedulePort[] = [
  {
    slug: "cadiz",
    name: "Cadiz",
    country: "Spain",
    seoTitle: "Cadiz Cruise Ship Schedule 2026 & 2027",
    metaDescription:
      "Cadiz cruise ship schedule hub. See which ships are in port and plan Seville, Jerez, White Villages and Cadiz shore excursions around published arrival and departure times.",
    intro:
      "Cadiz is a major Andalusian cruise port with ships berthing on the city waterfront. Check which vessels are scheduled before you book shore excursions, Seville day trips or Jerez sherry tours.",
    description: "Andalusia's Atlantic cruise gateway — ships dock on the waterfront with the old town within walking distance.",
    scheduleOverview:
      "Cadiz sees seasonal cruise traffic from April through October, with calls from Mediterranean and Atlantic itineraries.",
    planningTips: SCHEDULE_TIPS,
    faqs: SCHEDULE_FAQS,
  },
];

const scheduleData: Record<string, ScheduleEntry[]> = {
  cadiz: cadizSchedule as ScheduleEntry[],
};

export function getSchedulePortBySlug(slug: string): ShipSchedulePort | undefined {
  return schedulePorts.find((p) => p.slug === slug);
}

export function getAllSchedulePortSlugs(): string[] {
  return schedulePorts.map((p) => p.slug);
}

export function getScheduleEntries(slug: string): ScheduleEntry[] {
  return scheduleData[slug] ?? [];
}

export function getScheduleEntryCount(slug: string): number {
  return getScheduleEntries(slug).length;
}

export function getScheduleEntriesForYear(slug: string, year: ScheduleYear): ScheduleEntry[] {
  return filterEntriesByYear(getScheduleEntries(slug), year);
}

export function getScheduleEntriesForMonth(slug: string, monthKey: string): ScheduleEntry[] {
  return filterEntriesByMonth(getScheduleEntries(slug), monthKey);
}

export function getVerifiedMonthKeys(slug: string): string[] {
  return getMonthsWithEntries(getScheduleEntries(slug));
}

export function searchSchedulesByShip(query: string): { portSlug: string; entries: ScheduleEntry[] }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: { portSlug: string; entries: ScheduleEntry[] }[] = [];
  for (const port of schedulePorts) {
    const matches = getScheduleEntries(port.slug).filter(
      (e) => e.ship.toLowerCase().includes(q) || e.cruiseLine.toLowerCase().includes(q),
    );
    if (matches.length) results.push({ portSlug: port.slug, entries: matches });
  }
  return results;
}

export function getTodayTomorrowEntries(slug: string): { today: ScheduleEntry[]; tomorrow: ScheduleEntry[] } {
  const entries = getScheduleEntries(slug);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    today: entries.filter((e) => e.date === fmt(today)),
    tomorrow: entries.filter((e) => e.date === fmt(tomorrow)),
  };
}
