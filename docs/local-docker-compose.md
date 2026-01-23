# Local Hosting with Docker Compose + Tunnel

This setup runs Postgres, FastAPI backend, and Next.js frontend locally and exposes them with a temporary public URL using a tunnel (cloudflared or ngrok).

## 1) Start the stack

From the repo root:

```
docker compose up -d --build
```

Backend: http://localhost:8000  
Frontend: http://localhost:3000

## 2) Initialize the database (one-time)

```
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_data.py
docker compose exec backend python scripts/train_model.py
```

## 3) Expose with a tunnel

### Option A: cloudflared (recommended)

```
cloudflared tunnel --url http://localhost:8000
cloudflared tunnel --url http://localhost:3000
```

Use the **backend** tunnel URL for `NEXT_PUBLIC_API_URL`.

### Option B: ngrok

```
ngrok http 8000
ngrok http 3000
```

## 4) Update frontend API URL for external users

If you tunnel the backend, update the frontend build to use the backend tunnel URL:

```
set NEXT_PUBLIC_API_URL=https://<backend-tunnel>/api
docker compose build frontend
docker compose up -d
```

Now the public frontend URL will call the public backend URL.

## Notes

- If you change `NEXT_PUBLIC_API_URL`, you must rebuild the frontend image.
- Default credentials after seeding:
  - `admin` / `admin123`
  - `investigator` / `investigator123`
  - `analyst` / `analyst123`
