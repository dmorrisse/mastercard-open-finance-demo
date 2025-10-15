import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// simple in-memory store to remember connected banks per session token
const sessions = {}; // { token: { connectedBankId: '...', connectedBankName: '...' } }

// Mock banks list
const banks = [
  { id: "bank-a", name: "Demo National Bank" },
  { id: "bank-b", name: "Community Demo Bank" },
  { id: "bank-fail", name: "Intermittent Bank (try failing creds)" }
];

// Simple users
const users = { "demo@user.com": { password: "demo123", name: "Dan" } };

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
  const token = uuid();
  sessions[token] = { connectedBankId: null, connectedBankName: null };
  res.json({ ok: true, name: user.name, token });
});

app.get("/api/banks", (_req, res) => {
  res.json({ banks });
});

// Connect bank: will fail if password === "wrongpass" for any bank,
// or if bankId === "bank-fail" and password !== "correct123" returns a temporary 502 for demo purposes.
app.post("/api/connect", (req, res) => {
  const { token, bankId, username, password } = req.body;
  if (!token || !sessions[token]) return res.status(401).json({ error: "Unauthenticated" });

  // Simulated validation
  if (!username || !password) return res.status(400).json({ error: "MISSING_CREDENTIALS" });

  // If user intentionally types "wrongpass" -> immediate auth failure (400)
  if (password === "wrongpass") {
    return res.status(401).json({
      error: "BANK_AUTH_FAILED",
      message: "The bank rejected the credentials. Please try again."
    });
  }

  // For the special intermittent bank, simulate a temporary outage unless they use correct123
  if (bankId === "bank-fail" && password !== "correct123") {
    return res.status(502).json({
      error: "BANK_AUTH_TEMP_FAILURE",
      message: "Temporary bank authentication outage (try again or use different credentials)."
    });
  }

  // Successful connect
  const bank = banks.find(b => b.id === bankId) || { id: bankId, name: "Unknown Bank" };
  sessions[token].connectedBankId = bank.id;
  sessions[token].connectedBankName = bank.name;

  res.json({ ok: true, bankId: bank.id, bankName: bank.name });
});

// Transfer endpoint (fake) — intentional bug: decimal amounts cause server 500
app.post("/api/transfer", (req, res) => {
  const { token, fromAccount, toAccount, amount, memo } = req.body;
  if (!token || !sessions[token]) return res.status(401).json({ error: "Unauthenticated" });

  // Ensure bank is connected before transferring
  if (!sessions[token].connectedBankId) {
    return res.status(403).json({ error: "NO_BANK_CONNECTED", message: "Please connect a bank first." });
  }

  // Intentional bug: decimals cause 500 for the demo
  if (String(amount).includes(".")) {
    console.error("INTENTIONAL_BUG: Decimal amount rejected");
    return res.status(500).json({
      error: "AMOUNT_FORMAT_VALIDATION_FAILED",
      detail: "Decimals are not allowed (intentional demo bug)"
    });
  }

  // Fake success response
  res.json({
    ok: true,
    reference: "VENMO-DEMO-" + Math.floor(Math.random() * 1_000_000),
    fromAccount, toAccount, amount, memo
  });
});

// small helper to show session state (not used by UI, but useful)
app.get("/api/session/:token", (req, res) => {
  const s = sessions[req.params.token];
  if (!s) return res.status(404).json({ error: "NOT_FOUND" });
  res.json(s);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
