import type { ScheduleEntry } from "@/data/types";

export const SCHEDULE_YEARS = [2026, 2027] as const;

export type ScheduleYear = (typeof SCHEDULE_YEARS)[number];

export function isScheduleYearSlug(value: string): value is `${ScheduleYear}` {
  return value === "2026" || value === "2027";
}

export function parseScheduleYear(value: string): ScheduleYear | null {
  const year = Number(value);
  return isValidScheduleYear(year) ? year : null;
}

export function yearHubPath(year: ScheduleYear): string {
  return `/ship-schedules/${year}`;
}

export function portHubPath(slug: string): string {
  return `/ship-schedules/${slug}`;
}

export function portYearPath(slug: string, year: ScheduleYear): string {
  return `/ship-schedules/${slug}/${year}`;
}

export function monthKeyToSlug(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTH_SLUGS[month - 1]}-${year}`;
}

export function parseMonthSlug(value: string): string | null {
  const match = value.match(/^([a-z]+)-(\d{4})$/);
  if (!match) return null;
  const [, monthName, yearStr] = match;
  const monthIndex = MONTH_SLUGS.indexOf(monthName as MonthSlug);
  if (monthIndex === -1) return null;
  const year = Number(yearStr);
  if (!isValidScheduleYear(year)) return null;
  return getMonthKey(year, monthIndex + 1);
}

export function isMonthSlugParam(value: string): boolean {
  return parseMonthSlug(value) !== null;
}

export function portMonthPath(slug: string, monthKey: string): string {
  return `/ship-schedules/${slug}/${monthKeyToSlug(monthKey)}`;
}

export function getMonthName(monthKey: string): string {
  const { month } = parseMonthKey(monthKey);
  return MONTH_LABELS[month - 1];
}

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_SLUGS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export type MonthSlug = (typeof MONTH_SLUGS)[number];

export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

export function getEntryMonthKey(entry: ScheduleEntry): string {
  return entry.date.slice(0, 7);
}

export function isValidScheduleYear(year: number): year is ScheduleYear {
  return (SCHEDULE_YEARS as readonly number[]).includes(year);
}

export function filterEntriesByYear(entries: ScheduleEntry[], year: number): ScheduleEntry[] {
  const prefix = `${year}-`;
  return entries.filter((e) => e.date.startsWith(prefix));
}

export function filterEntriesByMonth(entries: ScheduleEntry[], monthKey: string): ScheduleEntry[] {
  return entries.filter((e) => getEntryMonthKey(e) === monthKey);
}

export function getMonthsWithEntries(entries: ScheduleEntry[]): string[] {
  const months = new Set(entries.map(getEntryMonthKey));
  return [...months].sort();
}

export function getUniqueCruiseLines(entries: ScheduleEntry[]): string[] {
  return [...new Set(entries.map((e) => e.cruiseLine))].sort();
}

export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export function getEntriesForDate(entries: ScheduleEntry[], date: string): ScheduleEntry[] {
  return entries.filter((e) => e.date === date);
}
