import { getPublicContact } from "@/config/destination";

const ITEMS = [
  {
    title: "Written for cruise port days",
    text: "Recommendations assume a Cadiz cruise call — hours ashore, all-aboard buffers and the geography from Alfonso XIII pier.",
  },
  {
    title: "Independent Cadiz advice",
    text: "Cadiz Shore Excursions is a local destination brand. We are not a cruise line and not the Port of Cadiz.",
  },
  {
    title: "Ask before you commit",
    text: "Questions about dates, group size or whether this excursion suits your call go to our Cadiz team."
  },
] as const;

export function CommercialTrust({ compact = false }: { compact?: boolean }) {
  const contact = getPublicContact();

  if (compact) {
    return (
      <p className="mt-4 text-sm text-gray-600">
        Independent Cadiz cruise planning — questions:{" "}
        <a href={`mailto:${contact.email}`} className="font-medium text-coastal-800 underline-offset-2 hover:underline">
          {contact.email}
        </a>
      </p>
    );
  }

  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Why you can trust this recommendation">
      {ITEMS.map((item) => (
        <div key={item.title} className="rounded-2xl border border-coastal-100 bg-white p-5">
          <h3 className="font-display text-base font-bold text-gray-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
        </div>
      ))}
    </section>
  );
}
