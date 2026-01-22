# Setup Status

## ✅ Completed Steps

1. **Dependencies Installed**
   - ✅ Redis 5.0.1 installed
   - ✅ Neo4j 5.15.0 installed
   - ⚠️ Some packages (scikit-learn) may need Visual C++ Build Tools on Windows

2. **Configuration Files Created**
   - ✅ `.env` file created (needs your actual database URLs)

## ⚠️ Action Required

### 1. Update `.env` File

Edit `backend/.env` and update these required values:

```env
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_database
JWT_SECRET=your-actual-secret-key-here
```

**Important:** Replace the placeholder values with your actual:
- PostgreSQL database connection string
- JWT secret key (use a strong random string)

### 2. Install Remaining Dependencies

Some packages may require Visual C++ Build Tools on Windows. You have two options:

**Option A: Install Build Tools (Recommended)**
1. Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "C++ build tools" workload
3. Run: `pip install -r requirements.txt`

**Option B: Use Pre-built Wheels**
The system will work with Redis and Neo4j installed. Other ML packages can be installed later if needed.

### 3. Set Up PostgreSQL

Make sure PostgreSQL is running and accessible:

```bash
# Test connection
psql -U your_user -d your_database -h your_host
```

### 4. Run Migrations

Once `.env` is configured:

```bash
cd backend
alembic upgrade head
```

This will:
- Enable TimescaleDB extension
- Convert transactions and audit_log to hypertables
- Add compression policies

### 5. Verify Setup

```bash
cd backend
python scripts/check_services.py
```

## 🚀 Next Steps After Configuration

### Optional: Set Up Redis (Recommended)

**Local Development:**
1. Install Redis: https://redis.io/download
2. Start Redis: `redis-server`
3. Update `.env`: `REDIS_URL=redis://localhost:6379/0`

**Production (Fly.io):**
```bash
fly redis create --name fraud-detection-redis --region iad
fly secrets set REDIS_URL=$(fly redis status -a fraud-detection-redis)
```

### Optional: Set Up Neo4j

**Local Development:**
```bash
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest
```

Update `.env`:
```env
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_ENABLED=true
```

Then sync entities:
```bash
python scripts/sync_entities.py
```

## 📋 Quick Checklist

- [ ] Update `.env` with actual DATABASE_URL and JWT_SECRET
- [ ] PostgreSQL is running and accessible
- [ ] Run `alembic upgrade head` (enables TimescaleDB)
- [ ] Run `python scripts/check_services.py` to verify
- [ ] (Optional) Set up Redis
- [ ] (Optional) Set up Neo4j and sync entities

## 🆘 Troubleshooting

**Error: "Field required"**
- Make sure `.env` file exists and has DATABASE_URL and JWT_SECRET set

**Error: "Connection refused"**
- Check PostgreSQL is running
- Verify DATABASE_URL is correct

**Error: "TimescaleDB extension not found"**
- Connect to PostgreSQL and run: `CREATE EXTENSION IF NOT EXISTS timescaledb;`

See `SETUP_GUIDE.md` for detailed troubleshooting.

