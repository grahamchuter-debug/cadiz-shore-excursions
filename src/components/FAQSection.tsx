export function FAQSection({ faqs, title = "Frequently Asked Questions" }: { faqs: { question: string; answer: string }[]; title?: string }) {
  return (
    <section>
      <h2 className="section-title text-2xl sm:text-3xl mb-8">{title}</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="group rounded-xl border border-gray-200 bg-white p-5">
            <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
              {faq.question}
              <span className="ml-4 text-coastal-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
