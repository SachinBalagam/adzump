import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adsRouter from "./routes/ads.routes.js";

dotenv.config();
console.log(
  "API KEY from env:",
  process.env.OPENAI_API_KEY ? "Loaded" : "Missing"
);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/ads", adsRouter);

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "internal_error",
    message: err?.message || "Unknown error",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
