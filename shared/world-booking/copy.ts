import type { BookingMode } from "./types";

export const REQUEST_COPY = {
  primaryCta: "Book this excursion",
  bookingEngineHeading: "Book your excursion",
  supporting:
    "Choose your cruise date and send your booking request. We'll confirm your places with our local partner.",
  reviewHeading: "Request your excursion",
  payCtaPrefix: "Pay",
  payCtaSuffix: "& book",
  guestsHeading: "How many people are travelling?",
  flatGuestNote: "Same price per guest for this excursion.",
  groupOverMaxTitle: (maxGuests: number) => `Travelling with more than ${maxGuests} guests?`,
  groupOverMaxBody: "Ask us about a larger group and we'll help arrange the best option.",
  groupOverMaxCta: "Ask us about this excursion",
  subjectToConfirmationTitle: "Subject to confirmation",
  subjectToConfirmationParagraphs: [
    "We'll confirm your excursion with our local partner after you submit your booking request.",
    "Your booking is only confirmed when you receive our confirmation email.",
    "If your excursion cannot be confirmed, your payment will be refunded in full.",
  ],
  consentLabel:
    "I understand this is a booking request. Payment is taken when I submit my request and does not confirm the excursion. Confirmation will be emailed separately when my places are confirmed. If the excursion cannot be confirmed, the amount paid will be refunded in full to my original payment method.",
  receivedHeadline: "Request received",
  receivedBody:
    "We've received your payment and your excursion request. This is not a booking confirmation. We're now confirming your places with our local partner. We'll email you again as soon as your excursion is confirmed.",
  paymentSuccessfulLabel: "Payment successful",
  awaitingConfirmationLabel: "Awaiting confirmation",
  preparingHeadline: "Payment received — preparing your booking request",
  preparingBody:
    "We're confirming your payment with our payment provider. This page will update when your booking request is ready. Your excursion is not confirmed yet.",
  nextSteps:
    "We'll check availability with our local partner and email you. Keep your booking reference — you'll need it if you get in touch.",
  childPricingNote:
    "Child and infant prices are not confirmed for this excursion yet. You can include them in your request; they are not charged at the adult rate. We'll confirm any child or infant rate before taking extra payment.",
} as const;

export const INSTANT_COPY = {
  primaryCta: "Book now",
  supporting: "Choose your cruise date and complete booking.",
  receivedHeadline: "Booking confirmed",
} as const;

export const ENQUIRE_COPY = {
  primaryCta: "Ask us about this excursion",
  supporting: "Tell us your cruise date and we'll help you plan.",
} as const;

export function primaryCtaLabel(mode: BookingMode): string {
  if (mode === "instant") return INSTANT_COPY.primaryCta;
  if (mode === "request") return REQUEST_COPY.primaryCta;
  return ENQUIRE_COPY.primaryCta;
}

export function payAndRequestCtaLabel(amountLabel: string): string {
  return `${REQUEST_COPY.payCtaPrefix} ${amountLabel} ${REQUEST_COPY.payCtaSuffix}`;
}

export const CUSTOMER_EMAIL = {
  requestedSubject: "We've received your Cádiz shore excursion request",
  confirmedSubject: "Your Seville shore excursion is confirmed",
  declinedSubject: "Update on your Seville shore excursion request",
} as const;
