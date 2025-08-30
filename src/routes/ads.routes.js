import express from "express";
import { generateAds, buildPayloads } from "../controllers/ads.controller.js";

const router = express.Router();

// POST /api/ads/generate
router.post("/generate", generateAds);

router.post("/constructPayloads", buildPayloads);

export default router;
