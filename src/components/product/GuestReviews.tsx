import type { GuestReview } from "@/data/product-pages";

/**
 * First-party guest reviews. Renders nothing until approved reviews exist.
 * Do not pass supplier ratings or placeholder empty states.
 */
export function GuestReviews({
  reviews,
  heading = "What our guests say",
}: {
  reviews?: GuestReview[];
  heading?: string;
}) {
  if (!reviews?.length) return null;

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="mt-16" aria-labelledby="guest-reviews-heading">
      <h2 id="guest-reviews-heading" className="section-title text-2xl sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-3 text-sm text-gray-600">
        {average.toFixed(1)} / 5 from {reviews.length} verified guest{reviews.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-8 space-y-6">
        {reviews.map((review, index) => (
          <li key={`${review.displayName}-${index}`} className="rounded-2xl border border-coastal-100 bg-white p-6">
            <p className="text-sm font-semibold text-coastal-800">
              {review.verified ? "Verified guest" : review.displayName} · {review.rating}/5
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{review.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
