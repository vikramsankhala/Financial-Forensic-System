# Deployment Guide

## GitHub Repository

The code has been pushed to: https://github.com/vikramsankhala/Financial-Forensic-System.git

## Fly.io Deployment

### Prerequisites

1. Install Fly.io CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Login to Fly.io: `fly auth login`
3. Install Docker (required for building images)

### Backend Deployment

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create Fly.io app (if not exists):**
   ```bash
   fly apps create fraud-detection-backend
   ```

3. **Create PostgreSQL database (with TimescaleDB support):**
   ```bash
   # Create PostgreSQL database
   fly postgres create --name fraud-detection-db --region iad --vm-size shared-cpu-1x
   
   # Attach database to app
   fly postgres attach --app fraud-detection-backend fraud-detection-db
   
   # Enable TimescaleDB extension (connect to database and run)
   fly postgres connect -a fraud-detection-db
   # Inside psql:
   CREATE EXTENSION IF NOT EXISTS timescaledb;
   \q
   ```

4. **Create Redis instance (optional but recommended):**
   ```bash
   fly redis create --name fraud-detection-redis --region iad
   # Get Redis URL
   fly redis status -a fraud-detection-redis
   ```

5. **Set environment variables:**
   ```bash
   # Get database URL from attached postgres
   DATABASE_URL=$(fly postgres connect -a fraud-detection-db -c "SELECT current_database();" | grep postgres)
   
   # Get Redis URL (if created)
   REDIS_URL=$(fly redis status -a fraud-detection-redis | grep "Connection URL" | awk '{print $3}')
   
   # Set secrets
   fly secrets set DATABASE_URL=$DATABASE_URL
   fly secrets set SECRET_KEY=your-secret-key-here
   fly secrets set OPENAI_API_KEY=your-openai-api-key-here
   
   # Redis (optional)
   fly secrets set REDIS_URL=$REDIS_URL
   fly secrets set REDIS_ENABLED=true
   fly secrets set REDIS_CACHE_TTL=3600
   
   # Neo4j (optional - if using Neo4j AuraDB or self-hosted)
   # fly secrets set NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   # fly secrets set NEO4J_USER=neo4j
   # fly secrets set NEO4J_PASSWORD=your-password
   # fly secrets set NEO4J_ENABLED=true
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

7. **Run migrations:**
   ```bash
   fly ssh console -a fraud-detection-backend
   # Inside the container:
   alembic upgrade head
   # This will create TimescaleDB hypertables for transactions and audit_log
   
   python scripts/seed_data.py
   python scripts/train_model.py
   
   # If Neo4j is enabled, sync entities to graph database:
   python -c "from app.services.entity_sync import sync_all_entities_to_graph; from app.database import SessionLocal; sync_all_entities_to_graph(SessionLocal())"
   ```

### Frontend Deployment

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create Fly.io app (if not exists):**
   ```bash
   fly apps create fraud-detection-frontend
   ```

3. **Set environment variables:**
   ```bash
   fly secrets set NEXT_PUBLIC_API_URL=https://fraud-detection-backend.fly.dev/api
   fly secrets set NEXT_PUBLIC_DEMO_AUDIO_ENABLED=true
   fly secrets set OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

### Post-Deployment

1. **Verify backend is running:**
   ```bash
   fly status -a fraud-detection-backend
   fly logs -a fraud-detection-backend
   ```

2. **Verify frontend is running:**
   ```bash
   fly status -a fraud-detection-frontend
   fly logs -a fraud-detection-frontend
   ```

3. **Access the application:**
   - Frontend: `https://fraud-detection-frontend.fly.dev`
   - Backend API: `https://fraud-detection-backend.fly.dev/api`
   - API Docs: `https://fraud-detection-backend.fly.dev/docs`

### Verification

After deployment, verify all services are working:

1. **Check TimescaleDB hypertables:**
   ```bash
   fly postgres connect -a fraud-detection-db
   # Inside psql:
   SELECT * FROM timescaledb_information.hypertables;
   \q
   ```

2. **Check Redis connection:**
   ```bash
   fly ssh console -a fraud-detection-backend
   python -c "from app.cache import get_redis_client; client = get_redis_client(); print('Redis:', 'connected' if client else 'disabled')"
   ```

3. **Check Neo4j connection (if enabled):**
   ```bash
   fly ssh console -a fraud-detection-backend
   python -c "from app.graph import get_graph_driver; driver = get_graph_driver(); print('Neo4j:', 'connected' if driver else 'disabled')"
   ```

4. **Test API endpoints:**
   ```bash
   # Dashboard metrics (should be cached)
   curl https://fraud-detection-backend.fly.dev/api/metrics/dashboard
   
   # Entity network (uses Neo4j if enabled)
   curl https://fraud-detection-backend.fly.dev/api/entities/1/network
   ```

### Troubleshooting

- **Database connection issues:** Check DATABASE_URL secret is set correctly
- **TimescaleDB errors:** Ensure TimescaleDB extension is enabled: `CREATE EXTENSION IF NOT EXISTS timescaledb;`
- **Redis connection errors:** Check REDIS_URL is set correctly and Redis instance is running
- **Neo4j connection errors:** Verify NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD are set correctly
- **API key errors:** Verify OPENAI_API_KEY is set in both backend and frontend apps
- **Build failures:** Check Docker logs: `fly logs -a <app-name>`
- **CORS errors:** Ensure NEXT_PUBLIC_API_URL matches backend URL
- **Cache not working:** Check REDIS_ENABLED=true and REDIS_URL is accessible

### Environment Variables Reference

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SECRET_KEY` - JWT secret key (required)
- `OPENAI_API_KEY` - OpenAI API key for AI features (required)
- `REDIS_URL` - Redis connection URL (optional, for caching)
- `REDIS_ENABLED` - Enable/disable Redis caching (default: true)
- `REDIS_CACHE_TTL` - Default cache TTL in seconds (default: 3600)
- `NEO4J_URI` - Neo4j connection URI (optional, for graph features)
- `NEO4J_USER` - Neo4j username (optional)
- `NEO4J_PASSWORD` - Neo4j password (optional)
- `NEO4J_ENABLED` - Enable/disable Neo4j (default: false)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_DEMO_AUDIO_ENABLED` - Enable/disable audio demos
- `OPENAI_API_KEY` - OpenAI API key (server-side only)

## Database Recommendations

### Current Setup: PostgreSQL

The system currently uses **PostgreSQL**, which is well-suited for:
- ✅ Relational data (cases, users, transactions)
- ✅ ACID compliance (critical for audit logs)
- ✅ Complex joins and aggregations
- ✅ JSON support for flexible metadata
- ✅ Mature ecosystem and tooling

### Recommended Enhancements

#### 1. TimescaleDB (PostgreSQL Extension) - **Highly Recommended**

**Why**: Your system processes high-volume time-series data (transactions, audit logs) with time-based queries.

**Benefits**:
- **10-100x faster** time-range queries (e.g., "transactions in last 24 hours")
- Automatic data compression and retention policies
- Better performance for dashboard metrics (`transactions-over-time` queries)
- Seamless integration (PostgreSQL extension, no code changes needed)

**Implementation**:
```sql
-- Convert transactions table to hypertable
SELECT create_hypertable('transactions', 'timestamp');

-- Convert audit_log table to hypertable
SELECT create_hypertable('audit_log', 'created_at');

-- Add compression policy (compress data older than 30 days)
SELECT add_compression_policy('transactions', INTERVAL '30 days');
SELECT add_compression_policy('audit_log', INTERVAL '90 days');
```

**Fly.io Setup**:
- TimescaleDB is available on Fly.io: `fly postgres create --name fraud-detection-db --region iad --vm-size shared-cpu-1x`
- Or use Timescale Cloud and connect via external connection string

**When to Use**: 
- ✅ Production deployments with > 1M transactions/month
- ✅ Dashboard performance is critical
- ✅ Need automatic data retention/archival

---

#### 2. Redis - **Recommended for Production**

**Why**: Improve real-time performance and reduce database load.

**Use Cases**:
- **Caching**: Frequently accessed entity metadata, risk scores
- **Real-time Metrics**: Dashboard KPIs, risk distribution
- **Session Management**: WebSocket connections, rate limiting
- **Queue Management**: Background job processing

**Benefits**:
- Sub-millisecond latency for cached data
- Reduces PostgreSQL load by 30-50%
- Enables real-time dashboard updates without DB queries
- Supports pub/sub for WebSocket events

**Implementation**:
```python
# Example: Cache entity metadata
import redis
redis_client = redis.Redis(host='redis-host', port=6379)

# Cache entity for 1 hour
entity = get_entity_from_db(entity_id)
redis_client.setex(f"entity:{entity_id}", 3600, json.dumps(entity))
```

**Fly.io Setup**:
```bash
fly redis create --name fraud-detection-redis --region iad
fly secrets set REDIS_URL=redis://default:password@redis-host:6379
```

**When to Use**:
- ✅ Production deployments
- ✅ Dashboard load time > 2 seconds
- ✅ Need to support 100+ concurrent users

---

#### 3. Neo4j (Graph Database) - **Optional for Advanced Use Cases**

**Why**: Your system has complex entity relationships (`entity_links` table) that form a graph structure.

**Benefits**:
- **Faster graph queries**: Find fraud rings, relationship paths
- **Better visualization**: Network graph analysis
- **Pattern matching**: Cypher queries for fraud patterns
- **Relationship traversal**: "Find all entities connected to this customer within 3 hops"

**Trade-offs**:
- ⚠️ Additional infrastructure complexity
- ⚠️ Data synchronization between PostgreSQL and Neo4j
- ⚠️ Only beneficial if graph queries become a bottleneck

**When to Use**:
- ✅ Need advanced fraud ring detection
- ✅ Complex relationship queries are slow (>500ms)
- ✅ Entity network analysis is a core feature
- ✅ Have resources for additional infrastructure

**Alternative**: Consider using PostgreSQL with recursive CTEs or graph extensions (e.g., Apache AGE) before adding Neo4j.

---

### Database Architecture Recommendations

#### **Phase 1: Current (MVP)**
```
PostgreSQL (Standard)
├── All tables
└── Standard indexes
```

#### **Phase 2: Production (Recommended)**
```
PostgreSQL + TimescaleDB
├── Transactions (hypertable)
├── Audit Log (hypertable)
└── Other tables (standard)

Redis
├── Entity cache
├── Metrics cache
└── Session management
```

#### **Phase 3: Enterprise (Advanced)**
```
PostgreSQL + TimescaleDB (Primary)
├── Transactions (hypertable)
├── Audit Log (hypertable)
└── Cases, Users, etc.

Redis (Caching & Real-time)
├── Entity cache
├── Metrics aggregation
└── Pub/sub events

Neo4j (Graph Analysis) [Optional]
└── Entity relationships (synced from PostgreSQL)
```

### Migration Path

1. **Start**: Standard PostgreSQL (current)
2. **Next**: Add Redis for caching (low risk, high impact)
3. **Then**: Migrate to TimescaleDB for time-series optimization
4. **Later**: Consider Neo4j if graph queries become critical

### Performance Impact Estimates

| Database Setup | Transaction Query Speed | Dashboard Load Time | Graph Query Speed |
|---------------|------------------------|-------------------|-------------------|
| PostgreSQL (current) | Baseline | 2-5s | Baseline |
| + Redis | Baseline | **0.5-1s** ⚡ | Baseline |
| + TimescaleDB | **10-50x faster** ⚡ | **0.3-0.8s** ⚡ | Baseline |
| + Neo4j | Baseline | Baseline | **100x faster** ⚡ |

### Cost Considerations

- **PostgreSQL**: Included in Fly.io Postgres pricing
- **TimescaleDB**: Same as PostgreSQL (free extension)
- **Redis**: ~$5-20/month on Fly.io (depending on size)
- **Neo4j**: ~$50-200/month (AuraDB cloud) or self-hosted

### Recommendation Summary

**For MVP/Development**: ✅ **Keep PostgreSQL** - It's sufficient

**For Production**: ✅ **Add Redis** + ✅ **Migrate to TimescaleDB**
- Low complexity, high performance gains
- Minimal code changes required
- Significant improvement in dashboard and query performance

**For Enterprise Scale**: Consider Neo4j only if:
- Entity relationship queries become a bottleneck
- Advanced fraud ring detection is required
- You have dedicated DevOps resources

