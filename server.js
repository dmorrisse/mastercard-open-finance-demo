// Quantum Pay Demo Server
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let bankAttempts = {};
const users = ["dan", "sarah", "alex", "maria"];

app.post("/api/login", (req, res) => {
  res.json({ success: true, user: "DemoUser" });
});

app.post("/api/search-user", (req, res) => {
  const { name } = req.body;
  if (!name || name.toLowerCase().includes("x")) {
    console.error("Quantum Pay Error: USER_NOT_FOUND");
    return res.status(404).json({ error: "USER_NOT_FOUND" });
  }
  res.json({ name, id: Math.floor(Math.random() * 10000) });
});

app.post("/api/bank-connect", (req, res) => {
  const { sessionId } = req.body;
  if (!bankAttempts[sessionId]) {
    bankAttempts[sessionId] = true;
    console.error("Quantum Pay Error: BANK_AUTH_FAIL");
    return res.status(401).json({ error: "BANK_AUTH_FAIL" });
  }
  res.json({ connected: true, bank: "Demo Bank" });
});

app.post("/api/fund", (req, res) => {
  const rand = Math.random();
  if (rand < 0.1) {
    console.error("Quantum Pay Error: INSUFFICIENT_FUNDS");
    return res.status(402).json({ error: "INSUFFICIENT_FUNDS" });
  } else if (rand < 0.2) {
    console.error("Quantum Pay Error: FUNDING_FAILURE");
    return res.status(500).json({ error: "FUNDING_FAILURE" });
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Quantum Pay running on port ${PORT}`));
