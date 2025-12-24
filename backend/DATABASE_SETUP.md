# Database Setup Guide

This guide explains how to set up and configure TimescaleDB, Redis, and Neo4j for the Fraud Detection Forensic Systems.

## Quick Start

### 1. TimescaleDB (PostgreSQL Extension)

TimescaleDB is automatically enabled when you run the migration. It optimizes time-series queries for `transactions` and `audit_log` tables.

**Setup:**
```bash
# Enable TimescaleDB extension (if not already enabled)
fly postgres connect -a fraud-detection-db
CREATE EXTENSION IF NOT EXISTS timescaledb;
\q

# Run migrations
alembic upgrade head
```

**What it does:**
- Converts `transactions` and `audit_log` tables to hypertables
- Enables automatic compression for old data (30+ days for transactions, 90+ days for audit logs)
- Optimizes time-range queries (10-100x faster)

**Verification:**
```sql
SELECT * FROM timescaledb_information.hypertables;
```

### 2. Redis (Caching)

Redis is used for caching frequently accessed data to improve performance.

**Setup:**
```bash
# Create Redis instance on Fly.io
fly redis create --name fraud-detection-redis --region iad

# Get connection URL
fly redis status -a fraud-detection-redis

# Set environment variables
fly secrets set REDIS_URL=redis://default:password@redis-host:6379
fly secrets set REDIS_ENABLED=true
fly secrets set REDIS_CACHE_TTL=3600
```

**What it caches:**
- Entity data (1 hour TTL)
- Entity networks (30 minutes TTL)
- Dashboard metrics (10-60 seconds TTL)
- Case reports (5 minutes TTL)

**Verification:**
```python
from app.cache import get_redis_client
client = get_redis_client()
print("Redis:", "connected" if client else "disabled")
```

### 3. Neo4j (Graph Database)

Neo4j enables advanced graph queries for fraud ring detection and entity relationship analysis.

**Setup Options:**

**Option A: Neo4j AuraDB (Cloud)**
1. Sign up at https://neo4j.com/cloud/aura/
2. Create a free instance
3. Get connection URI, username, and password

**Option B: Self-hosted**
```bash
# Using Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

**Configure:**
```bash
fly secrets set NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
fly secrets set NEO4J_USER=neo4j
fly secrets set NEO4J_PASSWORD=your-password
fly secrets set NEO4J_ENABLED=true
```

**Sync existing data:**
```python
from app.services.entity_sync import sync_all_entities_to_graph
from app.database import SessionLocal
sync_all_entities_to_graph(SessionLocal())
```

**Verification:**
```python
from app.graph import get_graph_service
service = get_graph_service()
if service:
    rings = service.find_fraud_rings()
    print(f"Found {len(rings)} potential fraud rings")
```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key

### Optional (Redis)
- `REDIS_URL` - Redis connection URL
- `REDIS_ENABLED` - Enable Redis (default: true)
- `REDIS_CACHE_TTL` - Default cache TTL in seconds (default: 3600)

### Optional (Neo4j)
- `NEO4J_URI` - Neo4j connection URI
- `NEO4J_USER` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password
- `NEO4J_ENABLED` - Enable Neo4j (default: false)

## Performance Benefits

| Feature | Without Optimization | With Optimization |
|---------|---------------------|-------------------|
| Dashboard metrics query | 2-5 seconds | 0.3-0.8 seconds |
| Entity network query | 500ms-2s | 50-200ms (Neo4j) |
| Time-series queries | Baseline | 10-50x faster |
| High-risk transaction count | 1-2 seconds | <100ms (cached) |

## Troubleshooting

### TimescaleDB
- **Error: "extension timescaledb does not exist"**
  - Solution: Run `CREATE EXTENSION IF NOT EXISTS timescaledb;` in PostgreSQL

### Redis
- **Error: "Connection refused"**
  - Check REDIS_URL is correct
  - Verify Redis instance is running: `fly redis status -a fraud-detection-redis`
  - Check network connectivity

### Neo4j
- **Error: "Neo4j graph database not available"**
  - Verify NEO4J_ENABLED=true
  - Check NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD are set
  - Test connection manually: `cypher-shell -a $NEO4J_URI -u $NEO4J_USER -p $NEO4J_PASSWORD`

## API Endpoints

### Dashboard Metrics (Cached)
- `GET /api/metrics/dashboard` - Dashboard KPIs (cached 10s)
- `GET /api/metrics/risk-distribution` - Risk level distribution (cached 30s)
- `GET /api/metrics/transactions-over-time` - Time-series data (cached 60s)

### Entity Network (Neo4j-enhanced)
- `GET /api/entities/{id}/network?max_depth=2` - Entity network graph
- `GET /api/entities/fraud-rings` - Find potential fraud rings

## Next Steps

1. **Monitor performance**: Check dashboard load times and query latencies
2. **Tune cache TTLs**: Adjust `REDIS_CACHE_TTL` based on your data update frequency
3. **Optimize Neo4j queries**: Add indexes for frequently queried entity properties
4. **Set up alerts**: Monitor Redis memory usage and Neo4j connection health

