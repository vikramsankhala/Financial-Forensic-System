import { useEffect, useMemo, useState } from "react";
import {
  createEventSource,
  fetchAlerts,
  fetchCases,
  fetchMetrics,
  fetchTransactions,
} from "./api.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

const formatTime = (value) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));

const riskBadge = (score) => {
  if (score >= 0.9) return "critical";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
};

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [cases, setCases] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [metricsData, alertData, caseData, transactionData] =
        await Promise.all([
          fetchMetrics(),
          fetchAlerts(),
          fetchCases(),
          fetchTransactions(),
        ]);
      setMetrics(metricsData);
      setAlerts(alertData);
      setCases(caseData);
      setTransactions(transactionData);
    };
    load();
  }, []);

  useEffect(() => {
    const stream = createEventSource();
    stream.addEventListener("metrics", (event) => {
      setMetrics(JSON.parse(event.data));
    });
    stream.addEventListener("alert", (event) => {
      const next = JSON.parse(event.data);
      setAlerts((prev) => [next, ...prev].slice(0, 8));
    });
    return () => stream.close();
  }, []);

  const openCases = useMemo(
    () => cases.filter((item) => item.status !== "resolved").slice(0, 6),
    [cases]
  );

  return (
    <div className="app">
      <header className="hero">
        <div className="container">
          <div className="hero-text">
            <p className="eyebrow">FFS Live Product Demo</p>
            <h1>Real-time fraud monitoring with forensic case management.</h1>
            <p>
              This local demo streams live alerts, cases, and transaction updates
              from the Express + SQLite API.
            </p>
          </div>
          <div className="hero-card">
            <h4>Live Metrics</h4>
            {metrics ? (
              <div className="metric-grid">
                <div>
                  <span>Total transactions</span>
                  <strong>{metrics.totalTransactions}</strong>
                </div>
                <div>
                  <span>High-risk alerts</span>
                  <strong>{metrics.highRiskAlerts}</strong>
                </div>
                <div>
                  <span>Open cases</span>
                  <strong>{metrics.openCases}</strong>
                </div>
                <div>
                  <span>Avg response</span>
                  <strong>{metrics.avgResponseMinutes} min</strong>
                </div>
                <div>
                  <span>Alert rate</span>
                  <strong>{(metrics.alertRate * 100).toFixed(1)}%</strong>
                </div>
                <div>
                  <span>FP rate</span>
                  <strong>{(metrics.fpRate * 100).toFixed(1)}%</strong>
                </div>
              </div>
            ) : (
              <p>Loading metrics...</p>
            )}
          </div>
        </div>
      </header>

      <main className="container main-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Live alerts</h3>
            <span className="tag">Streaming every 8s</span>
          </div>
          <div className="table">
            <div className="table-row table-header">
              <span>Member</span>
              <span>Type</span>
              <span>Channel</span>
              <span>Amount</span>
              <span>Risk</span>
              <span>Time</span>
            </div>
            {alerts.map((alert) => (
              <div className="table-row" key={alert.id}>
                <span>{alert.member}</span>
                <span>{alert.type}</span>
                <span>{alert.channel}</span>
                <span>{formatCurrency(alert.amount)}</span>
                <span className={`badge ${riskBadge(alert.risk_score)}`}>
                  {alert.risk_score.toFixed(2)}
                </span>
                <span>{formatTime(alert.created_at)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Open case queue</h3>
            <span className="tag">Investigator workflow</span>
          </div>
          <div className="case-list">
            {openCases.map((item) => (
              <div className="case-card" key={item.id}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
                <div className="case-meta">
                  <span className={`badge ${item.priority}`}>{item.priority}</span>
                  <span>{item.owner}</span>
                  <span>{formatTime(item.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Recent transactions</h3>
            <span className="tag">Multi-channel feed</span>
          </div>
          <div className="table">
            <div className="table-row table-header">
              <span>Member</span>
              <span>Channel</span>
              <span>Merchant</span>
              <span>Amount</span>
              <span>Risk</span>
            </div>
            {transactions.map((txn) => (
              <div className="table-row" key={txn.id}>
                <span>{txn.member}</span>
                <span>{txn.channel}</span>
                <span>{txn.merchant}</span>
                <span>{formatCurrency(txn.amount)}</span>
                <span className={`badge ${riskBadge(txn.risk_score)}`}>
                  {txn.risk_score.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
