"use client";

import { useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import {
  generateCadizPlan,
  INTEREST_OPTIONS,
  type PlannerInput,
  type PlannerResult,
} from "@/data/planner";
import { getBookableProduct } from "@/data/bookable-products";
import { PlannerBookableMatch, PlannerIndependentDayNote } from "@/components/PlannerBookableMatch";
import { trackPlannerEvent } from "@/platform/booking/analytics";

function Section({ title, links }: { title: string; links: PlannerLink[] }) {
  if (!links.length) return null;
  return (
    <section>
      <h3 className="section-title text-xl mb-4">{title}</h3>
      <div className="grid gap-3">
        {links.map((l) => (
          <Link key={l.href + l.label} href={l.href} className="card-editorial group block p-5">
            <p className="font-display text-base font-bold text-gray-900 group-hover:text-coastal-800">{l.label}</p>
            <p className="mt-1 text-sm text-gray-600">{l.why}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

type PlannerLink = PlannerResult["excursions"][number];

const CONFIDENCE_LABELS = {
  high: { text: "High return-to-ship confidence", className: "bg-coastal-100 text-coastal-800" },
  medium: { text: "Moderate — watch your timing", className: "bg-autumn-300/30 text-coastal-900" },
  low: { text: "Tight timing — consider a shorter option", className: "bg-maple-500/10 text-maple-600" },
};

export function CadizCruisePlanner() {
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [departureTime, setDepartureTime] = useState("17:00");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [interests, setInterests] = useState<string[]>(["cadiz", "history"]);
  const [mobility, setMobility] = useState<PlannerInput["mobility"]>("full");
  const [budget, setBudget] = useState<PlannerInput["budget"]>("mid");
  const [style, setStyle] = useState<PlannerInput["style"]>("mix");
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [guestSnapshot, setGuestSnapshot] = useState({ adults: 2, children: 0 });

  function toggleInterest(id: string) {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function generate() {
    const adultCount = Number(adults) || 1;
    const childCount = Number(children) || 0;
    const nextPlan = generateCadizPlan({
      arrivalTime,
      departureTime,
      adults: adultCount,
      children: childCount,
      interests,
      mobility,
      budget,
      style,
    });
    setGuestSnapshot({ adults: adultCount, children: childCount });
    setPlan(nextPlan);
    trackPlannerEvent("planner_completed", {
      theme: nextPlan.headline,
      independentDay: nextPlan.independentDay ?? false,
      hasRecommendation: Boolean(nextPlan.commercial?.primary),
    });
    if (nextPlan.commercial?.primary) {
      trackPlannerEvent("planner_product_recommended", {
        productId: nextPlan.commercial.primary.productId,
        alternativeProductId: nextPlan.commercial.alternative?.productId ?? null,
      });
    }
  }

  function downloadPdf() {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(plan.headline, 20, 20);
    doc.setFontSize(10);
    let y = 30;
    const write = (text: string, indent = 20) => {
      const lines = doc.splitTextToSize(text, 200 - indent);
      doc.text(lines, indent, y);
      y += lines.length * 5 + 2;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
    };
    write(plan.summary);
    y += 2;
    if (plan.commercial?.primary) {
      const product = getBookableProduct(plan.commercial.primary.productId);
      doc.setFont("helvetica", "bold");
      write("Best match for your day");
      doc.setFont("helvetica", "normal");
      if (product) write(`${product.name}: ${plan.commercial.primary.matchReason}`, 24);
      y += 2;
    } else if (plan.independentNote) {
      doc.setFont("helvetica", "bold");
      write("Independent exploration");
      doc.setFont("helvetica", "normal");
      write(plan.independentNote, 24);
      y += 2;
    }
    const block = (title: string, items: { label: string; why: string }[]) => {
      if (!items.length) return;
      doc.setFont("helvetica", "bold");
      write(title);
      doc.setFont("helvetica", "normal");
      items.forEach((i) => write(`- ${i.label}: ${i.why}`, 24));
      y += 2;
    };
    block("Shore excursions", plan.excursions);
    block("Guides", plan.guides);
    block("Logistics", plan.logistics);
    doc.setFont("helvetica", "bold");
    write("Your day plan");
    doc.setFont("helvetica", "normal");
    plan.dayPlan.forEach((s) => write(`${s.time}: ${s.text}`, 24));
    doc.save("cadiz-cruise-plan.pdf");
  }

  const primaryMatch =
    plan?.commercial?.primary && getBookableProduct(plan.commercial.primary.productId)
      ? {
          product: getBookableProduct(plan.commercial.primary.productId)!,
          matchReason: plan.commercial.primary.matchReason,
        }
      : null;
  const alternativeMatch =
    plan?.commercial?.alternative && getBookableProduct(plan.commercial.alternative.productId)
      ? {
          product: getBookableProduct(plan.commercial.alternative.productId)!,
          matchReason: plan.commercial.alternative.matchReason,
        }
      : null;

  return (
    <div className="card-feature">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ship arrival (local time)</label>
          <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ship departure (local time)</label>
          <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
          <input type="number" min={1} max={20} value={adults} onChange={(e) => setAdults(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
          <input type="number" min={0} max={20} value={children} onChange={(e) => setChildren(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Interests & preferences</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleInterest(o.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${interests.includes(o.id) ? "bg-coastal-800 text-white" : "bg-white text-coastal-800 border border-coastal-200 hover:bg-coastal-50"}`}
                aria-pressed={interests.includes(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobility</label>
          <select value={mobility} onChange={(e) => setMobility(e.target.value as PlannerInput["mobility"])} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="full">Happy to walk a lot</option>
            <option value="some">Some walking is fine</option>
            <option value="limited">Limited mobility</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
          <select value={budget} onChange={(e) => setBudget(e.target.value as PlannerInput["budget"])} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="budget">Budget</option>
            <option value="mid">Mid-range</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Guided tour or DIY?</label>
          <select value={style} onChange={(e) => setStyle(e.target.value as PlannerInput["style"])} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="guided">Prefer guided</option>
            <option value="mix">A mix</option>
            <option value="diy">Prefer DIY / independent</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={generate} className="btn-primary">Build my plan</button>
        {plan && <button type="button" onClick={downloadPdf} className="btn-secondary">Download PDF</button>}
      </div>

      {plan && (
        <div className="mt-8 space-y-8">
          <div className="rounded-xl border border-coastal-200 bg-coastal-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-display text-xl font-bold text-gray-900">{plan.headline}</h3>
              <span className={`pill ${CONFIDENCE_LABELS[plan.returnConfidence].className}`}>
                {CONFIDENCE_LABELS[plan.returnConfidence].text}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">{plan.summary}</p>
          </div>

          {primaryMatch ? (
            <PlannerBookableMatch
              primary={primaryMatch}
              alternative={alternativeMatch}
              guests={guestSnapshot}
              onRequestBook={() => {
                trackPlannerEvent("planner_product_clicked", { productId: primaryMatch.product.id, action: "request_to_book" });
                trackPlannerEvent("planner_booking_started", { productId: primaryMatch.product.id, source: "planner" });
              }}
              onAlternativeRequestBook={
                alternativeMatch
                  ? () => {
                      trackPlannerEvent("planner_product_clicked", {
                        productId: alternativeMatch.product.id,
                        action: "request_to_book",
                        variant: "alternative",
                      });
                      trackPlannerEvent("planner_booking_started", {
                        productId: alternativeMatch.product.id,
                        source: "planner",
                        variant: "alternative",
                      });
                    }
                  : undefined
              }
            />
          ) : plan.independentNote ? (
            <PlannerIndependentDayNote note={plan.independentNote} />
          ) : null}

          <Section title="Recommended shore excursions" links={plan.excursions} />
          <Section title="Planning guides" links={plan.guides} />
          <Section title="Logistics & reassurance" links={plan.logistics} />
          <section>
            <h3 className="section-title text-xl mb-4">Your day plan</h3>
            <ol className="relative space-y-4 border-l border-coastal-200 pl-6">
              {plan.dayPlan.map((s, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-coastal-600" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-coastal-700">{s.time}</p>
                  <p className="mt-1 text-sm text-gray-700">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
          <p className="text-xs text-gray-500">Guidance is indicative — always confirm your ship&apos;s all-aboard time. Register interest on excursion pages for upcoming direct tours.</p>
        </div>
      )}
    </div>
  );
}
