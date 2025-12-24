# Quick Start - Database Setup

## 🚀 Quick Setup Commands

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy example env file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac

# Edit .env with your database URLs
```

### 3. Run Migrations (Enables TimescaleDB)
```bash
alembic upgrade head
```

### 4. Check Services Status
```bash
python scripts/check_services.py
```

### 5. Sync Entities to Neo4j (If Enabled)
```bash
python scripts/sync_entities.py
```

### 6. Test Performance
```bash
python scripts/performance_test.py
```

## 📋 Checklist

- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Environment variables configured (`.env` file)
- [ ] PostgreSQL running and accessible
- [ ] Migrations run (`alembic upgrade head`)
- [ ] TimescaleDB extension enabled
- [ ] Redis configured (optional but recommended)
- [ ] Neo4j configured (optional)
- [ ] Services verified (`python scripts/check_services.py`)
- [ ] Entities synced to Neo4j (if using Neo4j)

## 🔍 Verification

Run this to check everything:
```bash
python scripts/check_services.py
```

Expected output:
- ✓ PostgreSQL: OK
- ✓ TimescaleDB: Enabled
- ✓ Redis: OK (if configured)
- ✓ Neo4j: OK (if configured)

## 📚 Full Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Detailed setup instructions
- **Database Setup**: `DATABASE_SETUP.md` - Database-specific configuration
- **Deployment**: `../DEPLOYMENT.md` - Production deployment guide

## 🆘 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Run `python scripts/check_services.py` to diagnose issues
3. Check service logs for errors
4. Verify environment variables are set correctly

