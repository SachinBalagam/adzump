import { askChatGPT } from "../providers/aiProvider.js";

export const generateAdSuggestions = async (input) => {
  const { businessName, businessType, product, service, goal, locations } =
    input;

  // Prepare product/service description
  let productOrServiceText = "";
  if (businessType === "product") {
    productOrServiceText = `Product: ${product}`;
  } else if (businessType === "service") {
    productOrServiceText = `Service: ${service}`;
  }

  const prompt = `
Business Name: ${businessName}
Business Type: ${businessType}
${productOrServiceText}
Goal: ${goal}
Locations: ${locations.join(", ")}

Task:
- Suggest a realistic daily budget in numbers only (INR).
- Expand the provided locations to relevant cities/towns in India as an array of maximum 5.
- Suggest an age range (like [25, 45]).
- Suggest gender(s) ["male"], ["female"], or ["male","female"].
- Create ONE perfect Google Search Ad with:
    * Exactly 15 Headlines
    * Exactly 4 Descriptions
    * Final URL
- Provide AT LEAST 10 relevant keywords as an array.

Output ONLY in the following JSON format:

{
  "budget": "<number>",
  "locations": [...],
  "age_range": [min, max],
  "gender": [...],
  "adDetails": {
    "headlines": [
      {"text": "...", "pinnedField": "HEADLINE_1"},
      {"text": "..."},
      ...
    ],
    "descriptions": [
      {"text": "...", "pinnedField": "DESCRIPTION_1"},
      {"text": "..."},
      ...
    ],
  },
  "keywords": ["keyword1", "keyword2", ..., "keyword10+"]
}
`;

  try {
    const aiResponse = await askChatGPT(prompt);

    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      console.error("⚠️ AI did not return valid JSON, returning raw text");
      parsed = { raw: aiResponse };
    }

    return parsed;
  } catch (error) {
    console.error("❌ Error in generateAdSuggestions:", error);
    return { error: "Failed to generate ad suggestion" };
  }
};
