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

const users = { "demo@user.com": { password: "demo123", name: "Dan" } };
const accounts = [
  { id: "chk-001", name: "Mastercard Checking", type: "checking", balance: 2140.27, currency: "USD" },
  { id: "svg-002", name: "Mastercard Savings", type: "savings", balance: 12450.55, currency: "USD" }
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || user.password !== password)
    return res.status(401).json({ error: "Invalid credentials" });
  res.json({ ok: true, name: user.name, token: uuid() });
});

app.get("/api/accounts", (_req, res) => res.json({ accounts }));

app.post("/api/transfer", (req, res) => {
  const { fromId, toId, amount, memo } = req.body;
  if (String(amount).includes(".")) {
    console.error("INTENTIONAL_BUG: Decimal amount rejected");
    return res.status(500).json({
      error: "AMOUNT_FORMAT_VALIDATION_FAILED",
      detail: "Decimals not allowed (intentional demo bug)"
    });
  }
  res.json({
    ok: true,
    reference: "MC-" + Math.floor(Math.random() * 1_000_000),
    fromId, toId, amount, memo
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
