// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files (HTML, CSS, images)
app.use(express.static(path.join(__dirname, "public")));

// Default route - send index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Example route to simulate a bank connection failure
app.get("/api/connect-bank", (req, res) => {
  const bank = req.query.bank;
  if (bank === "Citi") {
    return res.status(500).json({ error: "Unable to connect to bank at this time." });
  }
  return res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Quantum Pay server running on port ${PORT}`);
});
