import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-depth mt-auto text-white">
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="container-wide grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-display text-xl font-semibold">Cadiz Shore Excursions</div>
            <p className="mt-3 text-sm text-coastal-100/70 leading-relaxed">The Andalusia cruise planning authority — shore excursions, port guidance, Seville day trips, Jerez sherry, White Villages and return-to-ship confidence for Cadiz cruise passengers.</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-white/90">Plan your day</h3>
            <ul className="space-y-1.5 text-sm text-coastal-100/70">
              <li><Link href="/cruise-planner" className="hover:text-white">Cruise Planner</Link></li>
              <li><Link href="/shore-excursions" className="hover:text-white">Shore Excursions</Link></li>
              <li><Link href="/one-day-in-cadiz-from-a-cruise-ship" className="hover:text-white">One Day in Cadiz</Link></li>
              <li><Link href="/ship-schedules" className="hover:text-white">Ship Schedules</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-white/90">Andalusia guides</h3>
            <ul className="space-y-1.5 text-sm text-coastal-100/70">
              <li><Link href="/seville-from-cadiz-cruise-port" className="hover:text-white">Seville from the Port</Link></li>
              <li><Link href="/cadiz-old-town-walking-guide" className="hover:text-white">Old Town Walking Guide</Link></li>
              <li><Link href="/jerez-from-cadiz-cruise-port" className="hover:text-white">Jerez &amp; Sherry</Link></li>
              <li><Link href="/cruise-port-guide" className="hover:text-white">Cruise Port Guide</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-white/90">Food, wine &amp; villages</h3>
            <ul className="space-y-1.5 text-sm text-coastal-100/70">
              <li><Link href="/andalusian-food-guide" className="hover:text-white">Andalusian Food Guide</Link></li>
              <li><Link href="/white-villages-from-cadiz" className="hover:text-white">White Villages</Link></li>
              <li><Link href="/independent-vs-cruise-line-excursions" className="hover:text-white">Independent vs Ship Tours</Link></li>
              <li><Link href="/enquire" className="hover:text-white">Enquire</Link></li>
            </ul>
          </div>
        </div>
        <div className="container-wide mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs text-coastal-100/60">
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <span className="ml-auto">{SITE.email}</span>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-coastal-300/75">
        &copy; {year} {SITE.name}. Independent Cadiz cruise planning resource — not affiliated with any cruise line or the Port of Cadiz.
      </div>
    </footer>
  );
}
