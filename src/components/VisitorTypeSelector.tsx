import Link from "next/link";
import { visitorTypes } from "@/data/homepage";

export function VisitorTypeSelector() {
  return (
    <section className="section-padding bg-coastal-50 border-b border-coastal-100">
      <div className="container-wide">
        <p className="section-eyebrow">Start here</p>
        <h2 className="section-title mt-2">What kind of Cadiz cruise passenger are you?</h2>
        <p className="section-subtitle">Choose the option that fits your Cádiz port day and we&apos;ll point you to the right planning resources.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {visitorTypes.map((v) => (
            <Link key={v.id} href={v.href} className="nav-card group flex h-full flex-col">
              <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-coastal-800">{v.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{v.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-maple-600">
                {v.cta}
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
