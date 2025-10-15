// Quantum Pay Demo Server – Final Version
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

app.post("/api/login", (req, res) => res.json({ success: true }));

app.post("/api/search-user", (req, res) => {
  const { name } = req.body;
  if (!name || name.toLowerCase().includes("x")) {
    console.error("Quantum Pay Error: USER_NOT_FOUND");
    return res.status(404).json({ error: "USER_NOT_FOUND" });
  }
  res.json({
