import type { FAQ } from "./types";

export interface Terminal {
  name: string;
  quay: string;
  usedBy: string;
  cityAccess: string;
}

export const terminals: Terminal[] = [
  { name: "Alfonso XIII Cruise Terminal", quay: "Muelle Alfonso XIII, city waterfront", usedBy: "Most cruise ships calling at Cadiz", cityAccess: "10–15 min walk to old town; taxis at terminal exit" },
  { name: "Ciudad pier / adjacent berths", quay: "Central waterfront near Plaza de España", usedBy: "Smaller ships and some seasonal assignments", cityAccess: "5–10 min walk to cathedral and La Caleta" },
  { name: "Outer harbour berths", quay: "Port of Cadiz commercial zone", usedBy: "Occasional larger vessels requiring bus transfer", cityAccess: "Shuttle or taxi to old town (~10 min)" },
];

export interface PortGuideSection {
  heading: string;
  paragraphs: string[];
}

export const portGuideSections: PortGuideSection[] = [
  {
    heading: "Where cruise ships dock in Cadiz",
    paragraphs: [
      "Cadiz is one of the few major Mediterranean cruise ports where ships often berth within walking distance of a historic city centre. Most vessels use the Alfonso XIII cruise terminal on the waterfront, putting the old town, cathedral and La Caleta beach within a 10–20 minute stroll along flat, paved routes.",
      "This geography defines Cadiz as Andalusia's gateway port: you can explore 3,000 years of history on foot, or board a coach for Seville, Jerez and the White Villages when your port window allows. Unlike ports that require a mandatory shuttle, Cadiz rewards passengers who understand walking distances and plan inland trips realistically.",
    ],
  },
  {
    heading: "Getting from the port to the old town and beyond",
    paragraphs: [
      "For city exploration, walking is often the best option. From Alfonso XIII pier, head toward Plaza de San Juan de Dios and the cathedral — the old town unfolds from there. Taxis wait at the terminal for Jerez, White Villages or Seville day trips; agree on return timing if booking independently.",
      "Public buses connect the port area to outer districts but are rarely needed for cruise passengers focused on the historic centre. For Seville (~90 min each way), Jerez (~45 min) or Vejer (~50 min), pre-booked excursions or private transfers are strongly recommended — they track your ship's all-aboard time.",
      "Do not assume every berth is equally walkable. Confirm your terminal assignment on arrival; outer harbour berths may require a short shuttle or taxi to the old town.",
    ],
  },
  {
    heading: "Facilities and practicalities",
    paragraphs: [
      "The euro is the local currency. Spanish is the main language; English is common on organised tours and in central tourist areas. ATMs and cafés are in the old town; plan ahead for inland wine-country trips.",
      "Cadiz is a safe, relaxed city, but use normal precautions in busy markets and on crowded port days. Download offline maps before leaving the ship — mobile signal can be patchy near the terminal.",
      "Summer calls can be hot and bright; spring and autumn are ideal for walking. Atlantic breezes cool the waterfront even in July.",
    ],
  },
  {
    heading: "Return-to-ship timing",
    paragraphs: [
      "Confirm your all-aboard time (usually 30–60 minutes before departure) and work backwards. Cádiz old town walks need 45–60 minutes return buffer. Jerez and White Villages need 60–75 minutes. Seville day trips need generous margins and should only be attempted on long port days with a reputable operator.",
      "Traffic on the AP-4 motorway toward Seville can slow afternoon returns, especially on multi-ship days. If you book independently, choose operators that track ship schedules. Ship-run excursions guarantee the vessel waits; independent passengers must manage their own timing.",
    ],
  },
];

export const portGuideFaqs: FAQ[] = [
  { question: "How far is Cadiz old town from the cruise terminal?", answer: "About 10–20 minutes on foot from Alfonso XIII pier to the cathedral and central plazas. La Caleta beach is a similar distance." },
  { question: "Can I walk to Seville from the cruise port?", answer: "No — Seville is roughly 100 km inland, about 90 minutes by road each way. It requires a full-day excursion." },
  { question: "Is there a shuttle from the Cadiz cruise terminal?", answer: "Some cruise lines offer their own shuttles, especially from outer berths. The old town is walkable from most central berths — check your terminal assignment on arrival." },
  { question: "How much time do I need to get back to my ship?", answer: "Allow 45–60 minutes buffer for city walks, 60–75 minutes for Jerez or White Villages, and only attempt Seville on port days with 8+ usable hours ashore." },
];
