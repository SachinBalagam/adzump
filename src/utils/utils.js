// Convert normal currency to micros (Google Ads expects micros)
export const toMicros = (amount) => amount * 1_000_000;

// Simple bidding strategy mapper
export const biddingForGoal = (goal) => {
  if (goal.toLowerCase() === "sales") return "MAXIMIZE_CONVERSIONS";
  if (goal.toLowerCase() === "leads") return "MAXIMIZE_CONVERSION_VALUE";
  return "MANUAL_CPC";
};

// CTA generator
export const ctaForGoal = (goal) => {
  if (goal.toLowerCase() === "sales") return "Buy Now";
  if (goal.toLowerCase() === "leads") return "Sign Up Today";
  return "Learn More";
};
