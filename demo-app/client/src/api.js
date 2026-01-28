const API_BASE = "http://localhost:4000/api";

export const fetchMetrics = async () => {
  const res = await fetch(`${API_BASE}/metrics`);
  return res.json();
};

export const fetchAlerts = async () => {
  const res = await fetch(`${API_BASE}/alerts?limit=8`);
  return res.json();
};

export const fetchCases = async () => {
  const res = await fetch(`${API_BASE}/cases`);
  return res.json();
};

export const fetchTransactions = async () => {
  const res = await fetch(`${API_BASE}/transactions?limit=8`);
  return res.json();
};

export const createEventSource = () => new EventSource(`${API_BASE}/stream`);
