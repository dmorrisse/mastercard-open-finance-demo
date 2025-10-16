import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// --- Simulated Open Banking APIs --- //
app.get("/api/connect-bank", (req, res) => {
  // Simulate 1s loading time
  setTimeout(() => {
    res.json({ step: "mastercard_consent" });
  }, 1000);
});

app.get("/api/partnerbank-connect", (req, res) => {
  // Simulate 500 server failure
  console.error("🔥 Partner Bank API failed – provider timeout");
  res.status(500).json({
    message: "Partner Bank connection failed — provider timeout",
  });
});

app.get("/api/chase-connect", (req, res) => {
  // Simulate successful connection after 1s
  setTimeout(() => {
    res.json({ message: "Chase account connected successfully" });
  }, 1000);
});

app.get("/api/activity-feed", (req, res) => {
  res.json([
    { user: "@mike", amount: 24.5, desc: "coffee ☕" },
    { user: "@sara", amount: 120, desc: "rent 🏡" },
    { user: "@gymfit", amount: 45, desc: "membership 💪" },
  ]);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Quantum Pay running on ${PORT}`));
