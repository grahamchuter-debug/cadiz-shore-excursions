import type { BookingAnalyticsEvent, PlannerAnalyticsEvent, W2AnalyticsEvent } from "@shared/world-booking/types";
import { stripPassengersFromAnalyticsPayload } from "@shared/world-booking/passenger-security";

type Payload = Record<string, string | number | boolean | null | undefined>;

function dispatchAnalyticsEvent(event: W2AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;
  const safe = stripPassengersFromAnalyticsPayload(payload as Record<string, unknown>) as Payload;
  const detail = { event, ...safe, at: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("w2:booking", { detail }));
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event, ...safe });
  }
}

export function trackBookingEvent(event: BookingAnalyticsEvent, payload: Payload = {}): void {
  dispatchAnalyticsEvent(event, payload);
}

export function trackPlannerEvent(event: PlannerAnalyticsEvent, payload: Payload = {}): void {
  dispatchAnalyticsEvent(event, payload);
}
