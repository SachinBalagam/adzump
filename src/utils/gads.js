export const toMicros = (num) => Math.round(Number(num) * 1_000_000);

export const biddingForGoal = (goal) =>
  goal === "sales" || goal === "leads" ? "MAXIMIZE_CONVERSIONS" : "MANUAL_CPC";

export const ctaForGoal = (goal) =>
  goal === "sales" ? "Shop Now" : "Get Quote";

export const rsaLimits = {
  headlineMax: 30,
  descriptionMax: 90,
  maxHeadlines: 15,
  maxDescriptions: 4,
};
