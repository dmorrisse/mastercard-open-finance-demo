import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));

// Partner Bank intentionally returns 500
app.get("/api/partnerbank-connect", (req, res) => {
  res.status(500).json({ error: "Partner Bank connection failed" });
});

// Chase endpoint (fake)
app.post("/api/chase-connect", (req, res) => {
  res.status(500).json({ error: "Chase internal error" });
});

// Activity feed placeholder
app.get("/api/activity-feed", (req, res) => {
  res.json([
    { user: "Liam", amount: 25, desc: "Coffee run" },
    { user: "Sophia", amount: 60, desc: "Dinner split" },
    { user: "Noah", amount: 120, desc: "Concert tickets" },
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
