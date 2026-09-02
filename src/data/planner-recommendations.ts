import type { PlannerInput } from "./planner";

export type BookableProductId = "best-value" | "best-overall";

export interface PlannerProductMatch {
  productId: BookableProductId;
  score: number;
  matchReason: string;
}

export interface PlannerRecommendationResult {
  primary: PlannerProductMatch | null;
  alternative: PlannerProductMatch | null;
  independentDay: boolean;
  independentNote?: string;
}

const MIN_SCORE = 4;
const ALT_MAX_GAP = 2;
const SEVILLE_MIN_HOURS = 7;

function scoreBestValue(input: PlannerInput, hours: number): PlannerProductMatch {
  const { interests, style, budget } = input;
  const active = interests.length ? interests : ["cadiz", "history"];
  let score = 0;
  const reasons: string[] = [];

  if (active.includes("seville")) {
    score += 3;
    reasons.push("Seville is on your list");
  }
  if (style === "diy" || style === "mix") {
    score += 2;
    reasons.push(style === "diy" ? "you prefer independence ashore" : "you want a mix of structure and free time");
  }
  if (budget === "budget" || budget === "mid") {
    score += 2;
    reasons.push("you are watching value on the day");
  }
  if (hours >= SEVILLE_MIN_HOURS) {
    score += 1;
  } else {
    score -= 3;
  }

  if (style === "guided") score -= 1;
  if (budget === "premium" && style === "guided") score -= 2;
  if (!active.includes("seville") && !active.includes("history")) score -= 2;

  const matchReason =
    reasons.length > 0
      ? `Seville On Your Own fits because ${reasons.slice(0, 2).join(" and ")} — transport, Plaza de España and ~3–4 hours free in the centre.`
      : "A flexible Seville day with return transport from the Cádiz pier and substantial free time.";

  return { productId: "best-value", score, matchReason };
}

function scoreBestOverall(input: PlannerInput, hours: number): PlannerProductMatch {
  const { interests, style, budget } = input;
  const active = interests.length ? interests : ["cadiz", "history"];
  let score = 0;
  const reasons: string[] = [];

  if (active.includes("seville")) {
    score += 3;
    reasons.push("Seville is a priority");
  }
  if (active.includes("history")) {
    score += 2;
    reasons.push("history and monuments matter to you");
  }
  if (style === "guided") {
    score += 3;
    reasons.push("you prefer a guided day");
  } else if (style === "mix") {
    score += 1;
  }
  if (budget === "premium" || budget === "mid") {
    score += 1;
  }
  if (hours >= SEVILLE_MIN_HOURS) {
    score += 1;
  } else {
    score -= 3;
  }

  if (style === "diy") score -= 2;
  if (budget === "budget" && style !== "guided") score -= 1;
  if (!active.includes("seville") && !active.includes("history")) score -= 2;

  const matchReason =
    reasons.length > 0
      ? `Small-Group Seville fits because ${reasons.slice(0, 2).join(" and ")} — Cathedral and Real Alcázar admissions with a max-20 guide.`
      : "A smaller guided Seville day with Cathedral and Real Alcázar included.";

  return { productId: "best-overall", score, matchReason };
}

export function recommendBookableProducts(
  input: PlannerInput,
  _themeKey: string,
  hours: number,
): PlannerRecommendationResult {
  const { style, interests } = input;
  const active = interests.length ? interests : ["cadiz", "history"];
  const wantsSeville = active.includes("seville");

  if (hours < SEVILLE_MIN_HOURS) {
    return {
      primary: null,
      alternative: null,
      independentDay: true,
      independentNote: wantsSeville
        ? "Seville from Cádiz needs a long call — roughly 90 minutes each way plus time in the city. With under seven hours ashore, stay in Cádiz or treat Seville as a stretch only if your ship times truly allow it."
        : "With a shorter call, Cádiz itself is usually the stronger day. Seville only makes sense when you have a long port window.",
    };
  }

  if (style === "diy" && !wantsSeville) {
    return {
      primary: null,
      alternative: null,
      independentDay: true,
      independentNote:
        "This looks like a good day to explore Cádiz independently. Your day plan below is built for that — no Seville coach day is required.",
    };
  }

  const scored = [scoreBestValue(input, hours), scoreBestOverall(input, hours)].sort(
    (a, b) => b.score - a.score,
  );

  const top = scored[0];
  const second = scored[1];

  if (!top || top.score < MIN_SCORE) {
    return {
      primary: null,
      alternative: null,
      independentDay: true,
      independentNote: wantsSeville
        ? "Neither bookable Seville day is a strong match for these preferences yet — use the independent plan below, or adjust style and budget."
        : "None of our bookable Seville excursions is a strong match — your independent Cádiz plan below is the better fit.",
    };
  }

  const alternative =
    second && second.score >= MIN_SCORE && top.score - second.score <= ALT_MAX_GAP ? second : null;

  return {
    primary: top,
    alternative,
    independentDay: false,
  };
}
