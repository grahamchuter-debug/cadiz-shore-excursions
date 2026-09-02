import type { ScheduleEntry } from "@/data/types";
import { cadizBookingCore } from "@shared/destinations/cadiz";

export type BookingShipVisit = {
  slug: string;
  name: string;
  cruiseLine: string;
  arrival?: string;
  departure?: string;
  isCustom?: boolean;
};

export type BookingShipsByDate = Record<string, BookingShipVisit[]>;

export function slugifyShipName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "ship";
}

export function customShipVisit(name: string): BookingShipVisit {
  return {
    slug: cadizBookingCore.customShipSlug,
    name: name.trim(),
    cruiseLine: "",
    isCustom: true,
  };
}

export function isCustomBookingShip(ship: BookingShipVisit): boolean {
  return Boolean(ship.isCustom) || ship.slug === cadizBookingCore.customShipSlug;
}

export function buildShipsByDate(entries: readonly ScheduleEntry[]): BookingShipsByDate {
  const byDate: BookingShipsByDate = {};
  for (const entry of entries) {
    const list = byDate[entry.date] ?? [];
    const slug = slugifyShipName(entry.ship);
    if (!list.some((item) => item.slug === slug && item.name === entry.ship)) {
      list.push({
        slug,
        name: entry.ship,
        cruiseLine: entry.cruiseLine,
        arrival: entry.arrival,
        departure: entry.departure,
      });
    }
    byDate[entry.date] = list;
  }
  return byDate;
}

export function shipsForDate(shipsByDate: BookingShipsByDate, date: string): BookingShipVisit[] {
  return shipsByDate[date] ?? [];
}
