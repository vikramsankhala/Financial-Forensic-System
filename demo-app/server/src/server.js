import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
const db = initDb();

app.use(cors());
app.use(express.json());

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];
const nowIso = () => new Date().toISOString();

const channels = ["Card", "ACH", "RTP", "Wire", "ITM", "Online", "Mobile"];
const merchants = [
  "Electronics Hub",
  "Travel Junction",
  "Payroll Services",
  "University Bookstore",
  "Security Holdings LLC",
  "Medical Services",
  "Utility Payments",
  "Online Marketplace",
];
const members = [
  "Sarah Martinez",
  "Robert Thompson",
  "James Whitaker",
  "Erin Fields",
  "Dana Patel",
  "Ashley Nguyen",
  "Samuel Ortiz",
];
const alertTypes = [
  "Account takeover",
  "Impersonation scam",
  "Check kiting",
  "RTP scam",
  "Velocity spike",
  "Suspicious transfer",
];

const formatCurrency = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const calculateMetrics = () => {
  const totalTransactions = db.prepare("SELECT COUNT(*) as count FROM transactions").get().count;
  const highRiskAlerts = db
    .prepare("SELECT COUNT(*) as count FROM alerts WHERE risk_score >= 0.8 AND status != 'resolved'")
    .get().count;
  const openCases = db
    .prepare("SELECT COUNT(*) as count FROM cases WHERE status IN ('open', 'in_review')")
    .get().count;

  return {
    totalTransactions,
    highRiskAlerts,
    openCases,
    avgResponseMinutes: 7.2,
    alertRate: totalTransactions ? Number((highRiskAlerts / totalTransactions).toFixed(3)) : 0.031,
    fpRate: 0.014,
    latencyMsP95: 82,
  };
};

const createCase = (alert) => {
  const caseId = `CASE-${Math.floor(Math.random() * 900000 + 100000)}`;
  const now = nowIso();
  const summary = `${alert.type} flagged for ${alert.member} (${formatCurrency(alert.amount)}).`;
  db.prepare(
    `INSERT INTO cases (id, title, status, priority, created_at, updated_at, summary, owner)
     VALUES (@id, @title, @status, @priority, @created_at, @updated_at, @summary, @owner)`
  ).run({
    id: caseId,
    title: `${alert.type} investigation`,
    status: "open",
    priority: alert.risk_score >= 0.9 ? "critical" : "high",
    created_at: now,
    updated_at: now,
    summary,
    owner: "FFS On-Call Team",
  });
  return caseId;
};

const createAlertAndTransaction = () => {
  const riskScore = Number((Math.random() * 0.55 + 0.35).toFixed(2));
  const amount = Number((Math.random() * 12000 + 50).toFixed(2));
  const member = randomFrom(members);
  const channel = randomFrom(channels);
  const type = randomFrom(alertTypes);
  const createdAt = nowIso();
  const transactionId = `TXN-${Math.floor(Math.random() * 900000 + 100000)}`;
  const alertId = `ALERT-${Math.floor(Math.random() * 900000 + 100000)}`;

  const transaction = {
    id: transactionId,
    created_at: createdAt,
    amount,
    channel,
    member,
    merchant: randomFrom(merchants),
    risk_score: riskScore,
    case_id: null,
  };

  db.prepare(
    `INSERT INTO transactions (id, created_at, amount, channel, member, merchant, risk_score, case_id)
     VALUES (@id, @created_at, @amount, @channel, @member, @merchant, @risk_score, @case_id)`
  ).run(transaction);

  if (riskScore < 0.65) {
    return null;
  }

  const alert = {
    id: alertId,
    created_at: createdAt,
    member,
    risk_score: riskScore,
    amount,
    channel,
    type,
    status: riskScore >= 0.9 ? "critical" : "high",
    description: `${type} detected on ${channel} channel`,
    case_id: null,
  };

  if (riskScore >= 0.85) {
    alert.case_id = createCase(alert);
  }

  db.prepare(
    `INSERT INTO alerts
      (id, created_at, member, risk_score, amount, channel, type, status, description, case_id)
     VALUES
      (@id, @created_at, @member, @risk_score, @amount, @channel, @type, @status, @description, @case_id)`
  ).run(alert);

  return alert;
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: nowIso() });
});

app.get("/api/metrics", (req, res) => {
  res.json(calculateMetrics());
});

app.get("/api/alerts", (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const alerts = db
    .prepare(
      `SELECT * FROM alerts
       ORDER BY datetime(created_at) DESC
       LIMIT ?`
    )
    .all(limit);
  res.json(alerts);
});

app.get("/api/cases", (req, res) => {
  const cases = db
    .prepare(
      `SELECT * FROM cases
       ORDER BY datetime(updated_at) DESC`
    )
    .all();
  res.json(cases);
});

app.get("/api/cases/:id", (req, res) => {
  const item = db.prepare("SELECT * FROM cases WHERE id = ?").get(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const alerts = db.prepare("SELECT * FROM alerts WHERE case_id = ?").all(req.params.id);
  const transactions = db
    .prepare("SELECT * FROM transactions WHERE case_id = ?")
    .all(req.params.id);
  res.json({ ...item, alerts, transactions });
});

app.get("/api/transactions", (req, res) => {
  const limit = Number(req.query.limit) || 15;
  const rows = db
    .prepare(
      `SELECT * FROM transactions
       ORDER BY datetime(created_at) DESC
       LIMIT ?`
    )
    .all(limit);
  res.json(rows);
});

const clients = new Set();

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const client = { res };
  clients.add(client);

  res.write(`event: metrics\ndata: ${JSON.stringify(calculateMetrics())}\n\n`);

  req.on("close", () => {
    clients.delete(client);
  });
});

setInterval(() => {
  const alert = createAlertAndTransaction();
  if (!alert) {
    return;
  }

  const payload = JSON.stringify(alert);
  const metrics = JSON.stringify(calculateMetrics());
  clients.forEach((client) => {
    client.res.write(`event: alert\ndata: ${payload}\n\n`);
    client.res.write(`event: metrics\ndata: ${metrics}\n\n`);
  });
}, 8000);

app.listen(PORT, () => {
  console.log(`FFS demo server running on http://localhost:${PORT}`);
});
