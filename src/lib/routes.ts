import { schedulePorts, getScheduleEntries } from "@/data/schedules";

export function hasShipSchedule(slug: string): boolean {
  return schedulePorts.some((p) => p.slug === slug);
}

export function hasVerifiedScheduleData(slug: string): boolean {
  return hasShipSchedule(slug) && getScheduleEntries(slug).length > 0;
}
