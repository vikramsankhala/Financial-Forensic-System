import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const unwrap = <T>(response: { data: T }) => response.data;

const demoMode = process.env.NEXT_PUBLIC_DEMO_DATA === 'true';
const withDemoFlag = (params: Record<string, any>) =>
  demoMode ? { ...params, demo: true } : params;

const controlBaseURL =
  process.env.NEXT_PUBLIC_CONTROL_URL || 'http://localhost:9000';
const controlApi = axios.create({
  baseURL: controlBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactions = {
  list: (params: Record<string, any> = {}) =>
    api.get('/transactions', { params: withDemoFlag(params) }).then(unwrap),
  get: (id: number) => api.get(`/transactions/${id}`).then(unwrap),
  flag: (id: number) => api.post(`/transactions/${id}/flag`).then(unwrap),
};

export const cases = {
  list: (params: Record<string, any> = {}) =>
    api.get('/cases', { params: withDemoFlag(params) }).then(unwrap),
  get: (id: number) => api.get(`/cases/${id}`).then(unwrap),
  create: (payload: Record<string, any>) => api.post('/cases', payload).then(unwrap),
  updateStatus: (id: number, status: string) =>
    api.patch(`/cases/${id}`, { status }).then(unwrap),
  addEvent: (id: number, payload: Record<string, any>) =>
    api.post(`/cases/${id}/notes`, payload).then(unwrap),
  getReport: (id: number) => api.get(`/cases/${id}/report`).then(unwrap),
};

export const entities = {
  get: (id: number) => api.get(`/entities/${id}`).then(unwrap),
  getNetwork: (id: number) => api.get(`/entities/${id}/network`).then(unwrap),
  // Backend endpoint not yet implemented; will return 404 until added server-side.
  block: (id: number) => api.post(`/entities/${id}/block`).then(unwrap),
};

export const demoFeed = {
  status: () => api.get('/demo-feed/status').then(unwrap),
  start: (payload: Record<string, any> = {}) => api.post('/demo-feed/start', payload).then(unwrap),
  stop: () => api.post('/demo-feed/stop').then(unwrap),
};

export const control = {
  status: () => controlApi.get('/control/backend/status').then(unwrap),
  start: () => controlApi.post('/control/backend/start').then(unwrap),
  stop: () => controlApi.post('/control/backend/stop').then(unwrap),
};
