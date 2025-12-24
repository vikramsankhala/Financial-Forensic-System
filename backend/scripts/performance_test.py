"""Script to test performance improvements from caching and TimescaleDB."""
import sys
import os
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import Transaction, Score, Entity
from app.cache import get_cache, set_cache, CacheKeys, get_redis_client
from app.config import settings
from sqlalchemy import func, and_
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_dashboard_metrics_query(db):
    """Test dashboard metrics query performance."""
    logger.info("Testing dashboard metrics query...")
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Test without cache
    start = time.time()
    total = db.query(Transaction).filter(Transaction.timestamp >= today_start).count()
    high_risk = db.query(Transaction).join(Score).filter(
        and_(
            Transaction.timestamp >= today_start,
            Score.risk_level.in_(["high", "critical"])
        )
    ).count()
    db_time = time.time() - start
    
    logger.info(f"  Database query: {db_time*1000:.2f}ms")
    
    # Test with cache
    cache_key = CacheKeys.METRICS_DASHBOARD
    start = time.time()
    cached = get_cache(cache_key)
    if cached:
        cache_time = time.time() - start
        logger.info(f"  Cache hit: {cache_time*1000:.2f}ms ({cache_time/db_time*100:.1f}x faster)")
    else:
        # Set cache
        metrics = {"total": total, "high_risk": high_risk}
        set_cache(cache_key, metrics, ttl=10)
        cache_time = time.time() - start
        logger.info(f"  Cache miss: {cache_time*1000:.2f}ms (next request will be cached)")
    
    return db_time, cache_time if cached else None


def test_entity_query(db):
    """Test entity query performance."""
    logger.info("Testing entity query...")
    
    # Get first entity
    entity = db.query(Entity).first()
    if not entity:
        logger.warning("  No entities found in database")
        return None, None
    
    # Test without cache
    start = time.time()
    entity_data = db.query(Entity).filter(Entity.id == entity.id).first()
    db_time = time.time() - start
    
    logger.info(f"  Database query: {db_time*1000:.2f}ms")
    
    # Test with cache
    cache_key = f"{CacheKeys.ENTITY}:{entity.id}"
    start = time.time()
    cached = get_cache(cache_key)
    if cached:
        cache_time = time.time() - start
        logger.info(f"  Cache hit: {cache_time*1000:.2f}ms ({db_time/cache_time:.1f}x faster)")
    else:
        set_cache(cache_key, entity_data, ttl=3600)
        cache_time = time.time() - start
        logger.info(f"  Cache miss: {cache_time*1000:.2f}ms (next request will be cached)")
    
    return db_time, cache_time if cached else None


def test_time_series_query(db):
    """Test time-series query performance."""
    logger.info("Testing time-series query...")
    
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=24)
    
    # Test standard PostgreSQL query
    start = time.time()
    result = db.query(
        func.date_trunc('hour', Transaction.timestamp).label('bucket'),
        func.count(Transaction.id).label('count')
    ).filter(
        and_(
            Transaction.timestamp >= start_time,
            Transaction.timestamp <= end_time
        )
    ).group_by('bucket').all()
    pg_time = time.time() - start
    
    logger.info(f"  PostgreSQL query: {pg_time*1000:.2f}ms ({len(result)} buckets)")
    
    # Note: TimescaleDB time_bucket would be faster, but requires raw SQL
    # This is tested in the actual API endpoint
    
    return pg_time


def main():
    """Run performance tests."""
    logger.info("=" * 60)
    logger.info("Performance Test Suite")
    logger.info("=" * 60)
    logger.info("")
    
    redis_enabled = get_redis_client() is not None
    logger.info(f"Redis caching: {'ENABLED' if redis_enabled else 'DISABLED'}")
    logger.info("")
    
    db = SessionLocal()
    try:
        # Test 1: Dashboard metrics
        db_time, cache_time = test_dashboard_metrics_query(db)
        logger.info("")
        
        # Test 2: Entity query
        db_time, cache_time = test_entity_query(db)
        logger.info("")
        
        # Test 3: Time-series query
        pg_time = test_time_series_query(db)
        logger.info("")
        
        logger.info("=" * 60)
        logger.info("Recommendations")
        logger.info("=" * 60)
        
        if not redis_enabled:
            logger.info("⚠ Enable Redis caching for 10-100x faster dashboard queries")
            logger.info("  Set REDIS_URL and REDIS_ENABLED=true")
        
        logger.info("✓ Run 'alembic upgrade head' to enable TimescaleDB hypertables")
        logger.info("✓ TimescaleDB provides 10-50x faster time-series queries")
        
    finally:
        db.close()


if __name__ == "__main__":
    main()

