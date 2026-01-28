# FFS Live Demo (Local)

This folder contains a local demo stack that mirrors the marketing site and
adds a live dashboard with alerts, cases, and transactions.

## What runs

- **Express API** with SQLite data and live alert simulation.
- **React UI** (Vite) for dashboards, alerts, and case queues.
- **Flyer site** stays in `flyer-site/` and links to the demo on `localhost:5173`.

## Run locally

### 1) Start the API

```
cd demo-app/server
npm install
npm run dev
```

API runs at `http://localhost:4000`.

### 2) Start the UI

```
cd demo-app/client
npm install
npm run dev
```

UI runs at `http://localhost:5173`.

### One command (root)

```
cd ..
npm run demo
```

### 3) Open the marketing shell

Open `flyer-site/index.html` in a browser and click **Open live demo**, or go
directly to `http://localhost:5173`.

## Data model

Seed data lives in `demo-app/server/data/seed.json` and is loaded into a local
SQLite database (`demo-app/server/data/ffs-demo.db`). The server simulates a new
alert every ~8 seconds to keep the dashboard live.
