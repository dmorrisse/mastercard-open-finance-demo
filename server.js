// ====== BASIC EXPRESS SERVER FOR QUANTUM PAY DEMO ======
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ====== DEMO API ROUTES ======

// ✅ Simulated PartnerBank 500
app.get("/api/partnerbank-connect", (req, res) => {
  console.log("💥 Simulating PartnerBank 500 Error");
  res.status(500).json({ error: "PartnerBank internal server error" });
});

// ✅ Simulated Chase funding failure (also 500)
app.get("/api/chase-connect", (req, res) => {
  console.log("💥 Simulating Chase funding failure");
  res.status(500).json({ error: "Chase funding failure" });
});

// ✅ Activity feed (fake data)
app.get("/api/activity-feed", (req, res) => {
  res.json([
    { user: "Jane", amount: 45, desc: "Dinner" },
    { user: "Chris", amount: 120, desc: "Tickets" },
    { user: "Alex", amount: 30, desc: "Drinks" },
  ]);
});

// fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
