import { generateAdSuggestions } from "../services/ai.service.js";
import { buildGoogleAdsPayloads } from "../services/googleAdsBuilder.js";

export const buildPayloads = async (req, res) => {
  try {
    const { ads, businessName, customerId } = req.body;

    const payloads = buildGoogleAdsPayloads(customerId, businessName, ads);

    res.json({ success: true, payloads });
  } catch (error) {
    console.error("❌ Error constructing payloads:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to build payloads" });
  }
};

export const generateAds = async (req, res) => {
  try {
    const userInput = req.body; // { businessName, productOrService, budget, goal, location }
    const ads = await generateAdSuggestions(userInput);
    res.json({ success: true, ads });
  } catch (error) {
    console.error("❌ Error in generateAds:", error);
    res.status(500).json({ success: false, message: "Failed to generate ads" });
  }
};
