# Setup Guide - Next Steps

This guide will help you complete the setup of TimescaleDB, Redis, and Neo4j.

## Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or if you're using a virtual environment:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

**New dependencies added:**
- `redis==5.0.1` - Redis client for caching
- `neo4j==5.15.0` - Neo4j driver for graph database

## Step 2: Configure Environment Variables

1. **Copy the template environment file:**
   ```bash
   cd backend
   copy env.template .env  # Windows
   # or
   cp env.template .env     # Linux/Mac
   ```

2. **Edit `.env` file with your configuration:**

   **Required:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/fraud_detection
   JWT_SECRET=your-secret-key-change-this-in-production
   ```

   **Redis (Optional but recommended):**
   ```env
   REDIS_URL=redis://localhost:6379/0
   REDIS_ENABLED=true
   REDIS_CACHE_TTL=3600
   ```

   **Neo4j (Optional):**
   ```env
   NEO4J_URI=neo4j://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=password
   NEO4J_ENABLED=false  # Set to true when ready
   ```

## Step 3: Run Database Migrations

This will enable TimescaleDB hypertables:

```bash
cd backend
alembic upgrade head
```

**What this does:**
- Creates TimescaleDB extension (if not exists)
- Converts `transactions` table to hypertable
- Converts `audit_log` table to hypertable
- Adds compression policies

**Verify TimescaleDB:**
```bash
python scripts/check_services.py
```

## Step 4: Set Up Redis (Optional but Recommended)

### Option A: Local Redis (Development)

**Windows:**
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Update `.env`: `REDIS_URL=redis://localhost:6379/0`

**Linux/Mac:**
```bash
# Install Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # Mac

# Start Redis
redis-server

# Update .env
REDIS_URL=redis://localhost:6379/0
```

### Option B: Fly.io Redis (Production)

```bash
fly redis create --name fraud-detection-redis --region iad
fly secrets set REDIS_URL=$(fly redis status -a fraud-detection-redis | grep "Connection URL")
fly secrets set REDIS_ENABLED=true
```

**Test Redis:**
```bash
python scripts/check_services.py
```

## Step 5: Set Up Neo4j (Optional)

### Option A: Local Neo4j (Development)

**Using Docker:**
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

**Update `.env`:**
```env
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_ENABLED=true
```

### Option B: Neo4j AuraDB (Cloud - Free Tier Available)

1. Sign up at: https://neo4j.com/cloud/aura/
2. Create a free instance
3. Get connection details from dashboard
4. Update `.env` with your credentials

**Test Neo4j:**
```bash
python scripts/check_services.py
```

## Step 6: Sync Entities to Neo4j (If Using Neo4j)

After enabling Neo4j, sync existing entities:

```bash
cd backend
python scripts/sync_entities.py
```

This will:
- Sync all entities from PostgreSQL to Neo4j
- Create entity nodes
- Create relationships between entities

**Note:** New entities will be automatically synced when created.

## Step 7: Verify Everything Works

Run the service check script:

```bash
cd backend
python scripts/check_services.py
```

Expected output:
```
============================================================
Database Services Status Check
============================================================

Checking PostgreSQL...
✓ PostgreSQL connected: PostgreSQL 15.x
✓ TimescaleDB extension is enabled
  Hypertables: transactions, audit_log

Checking Redis...
✓ Redis connected
  Version: 7.x
  Used memory: 2.5M
  Connected clients: 1

Checking Neo4j...
✓ Neo4j connected
  URI: neo4j://localhost:7687
  Total nodes: 150
  Total relationships: 45

============================================================
Summary
============================================================
✓ PostgreSQL: OK
✓ Redis: OK
✓ Neo4j: OK
```

## Step 8: Test Performance

Run the performance test script:

```bash
cd backend
python scripts/performance_test.py
```

This will show:
- Query performance with/without caching
- Cache hit rates
- Performance improvements

## Step 9: Start the Application

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Test endpoints:**
- Dashboard metrics: `http://localhost:8000/api/metrics/dashboard`
- Entity network: `http://localhost:8000/api/entities/1/network`
- Fraud rings: `http://localhost:8000/api/entities/fraud-rings`

## Troubleshooting

### TimescaleDB Issues

**Error: "extension timescaledb does not exist"**
```sql
-- Connect to PostgreSQL
psql -U postgres -d fraud_detection

-- Enable extension
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

**Check hypertables:**
```sql
SELECT * FROM timescaledb_information.hypertables;
```

### Redis Issues

**Connection refused:**
- Check Redis is running: `redis-cli ping` (should return PONG)
- Verify REDIS_URL in `.env`
- Check firewall/network settings

**Cache not working:**
- Verify `REDIS_ENABLED=true` in `.env`
- Check Redis logs: `redis-cli monitor`

### Neo4j Issues

**Connection failed:**
- Verify Neo4j is running: `docker ps` (if using Docker)
- Check NEO4J_URI format: `neo4j://` for local, `neo4j+s://` for AuraDB
- Test connection: `cypher-shell -a $NEO4J_URI -u $NEO4J_USER -p $NEO4J_PASSWORD`

**No entities synced:**
- Run sync script: `python scripts/sync_entities.py`
- Check Neo4j browser: `http://localhost:7474`
- Verify entities exist in PostgreSQL first

## Quick Reference

| Service | Status Check | Enable Command |
|---------|-------------|----------------|
| PostgreSQL | `python scripts/check_services.py` | Already enabled |
| TimescaleDB | `alembic upgrade head` | `CREATE EXTENSION timescaledb;` |
| Redis | `redis-cli ping` | `REDIS_ENABLED=true` |
| Neo4j | `python scripts/check_services.py` | `NEO4J_ENABLED=true` |

## Next Steps After Setup

1. **Monitor Performance:**
   - Check dashboard load times
   - Monitor cache hit rates
   - Review query performance

2. **Optimize Cache TTLs:**
   - Adjust `REDIS_CACHE_TTL` based on data update frequency
   - Different TTLs for different data types

3. **Tune Neo4j:**
   - Add indexes for frequently queried properties
   - Optimize fraud ring detection queries
   - Monitor graph database size

4. **Production Deployment:**
   - See `DEPLOYMENT.md` for Fly.io deployment
   - Set up monitoring and alerts
   - Configure backup strategies

