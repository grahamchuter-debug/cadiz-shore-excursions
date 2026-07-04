"use client";

import Link from "next/link";
import { useState } from "react";
import { siteImages } from "@/lib/images";

const navItems = [
  { href: "/shore-excursions", label: "Shore Excursions" },
  { href: "/cruise-port-guide", label: "Port Guide" },
  { href: "/cruise-planner", label: "Cruise Planner" },
  { href: "/ship-schedules", label: "Ship Schedules" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-coastal-100 bg-white/95 backdrop-blur-sm">
      <div className="container-wide flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src={siteImages.logo.src}
            alt={siteImages.logo.alt}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-coastal-200"
            width={40}
            height={40}
          />
          <div className="hidden sm:block">
            <div className="font-display text-lg font-bold text-coastal-800 leading-tight">Cadiz Shore</div>
            <div className="text-xs text-gray-500 -mt-0.5">Excursions &amp; Andalusia</div>
          </div>
        </Link>
        <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-coastal-50 hover:text-coastal-700 transition-colors">{item.label}</Link>
          ))}
        </nav>
        <div className="hidden xl:block">
          <Link href="/enquire" className="btn-accent text-sm">Enquire</Link>
        </div>
        <button type="button" className="xl:hidden rounded-lg p-2 text-gray-700 hover:bg-coastal-50" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="xl:hidden border-t border-coastal-100 bg-white px-4 py-4" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-coastal-50" onClick={() => setOpen(false)}>{item.label}</Link>
            ))}
            <Link href="/enquire" className="rounded-lg px-4 py-3 text-sm font-semibold text-maple-600 hover:bg-coastal-50" onClick={() => setOpen(false)}>Enquire</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
