// ====== IMPORTS ======
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ====== FILEPATH HELPERS ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ====== MIDDLEWARE ======
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== LOGGING ======
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ====== API ENDPOINTS ======

// --- Partner Bank: returns real 500 error
app.get("/api/partnerbank-connect", (req, res) => {
  console.log("⚠️ Simulating Partner Bank API failure (500)");
  res.status(500).json({
    error: "PartnerBank_API500",
    message: "Partner Bank system unavailable. Please try again later.",
  });
});

// --- Chase: returns 500 to simulate funding failure
app.get("/api/chase-connect", (req, res) => {
  console.log("⚠️ Simulating Chase Funding Error (500)");
  res.status(500).json({
    error: "ChaseFunding_API500",
    message: "Chase funding source unavailable.",
  });
});

// --- Bank of America: returns 200 success
app.get("/api/bofa-connect", (req, res) => {
  console.log("✅ Simulating Bank of America success");
  res.json({ message: "Bank of America connection successful" });
});

// --- Citi: returns 200 success
app.get("/api/citi-connect", (req, res) => {
  console.log("✅ Simulating Citi connection success");
  res.json({ message: "Citi connection successful" });
});

// --- Activity Feed
app.get("/api/activity-feed", (req, res) => {
  console.log("📄 Fetching activity feed");
  res.json([
    { user: "Anna", amount: 125, desc: "Dinner" },
    { user: "Tom", amount: 42, desc: "Groceries" },
    { user: "Lauren", amount: 210, desc: "Concert tickets" },
  ]);
});

// ====== FRONTEND ROUTING ======
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Quantum Pay server running on port ${PORT}`);
});
