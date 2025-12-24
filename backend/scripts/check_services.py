"""Script to check status of all database services."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine
from app.cache import get_redis_client
from app.graph import get_graph_driver, get_graph_service
from app.config import settings
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_postgresql():
    """Check PostgreSQL connection and TimescaleDB extension."""
    logger.info("Checking PostgreSQL...")
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT version();"))
        version = result.scalar()
        logger.info(f"✓ PostgreSQL connected: {version}")
        
        # Check TimescaleDB extension
        try:
            result = db.execute(text("SELECT * FROM timescaledb_information.hypertables LIMIT 1;"))
            hypertables = result.fetchall()
            if hypertables:
                logger.info("✓ TimescaleDB extension is enabled")
                result = db.execute(text("SELECT hypertable_name FROM timescaledb_information.hypertables;"))
                names = [row[0] for row in result.fetchall()]
                logger.info(f"  Hypertables: {', '.join(names)}")
            else:
                logger.warning("⚠ TimescaleDB extension enabled but no hypertables found")
                logger.info("  Run: alembic upgrade head")
        except Exception as e:
            logger.warning(f"⚠ TimescaleDB not available: {e}")
            logger.info("  To enable: CREATE EXTENSION IF NOT EXISTS timescaledb;")
        
        db.close()
        return True
    except Exception as e:
        logger.error(f"✗ PostgreSQL connection failed: {e}")
        return False


def check_redis():
    """Check Redis connection."""
    logger.info("Checking Redis...")
    if not settings.redis_enabled:
        logger.info("⚠ Redis is disabled (REDIS_ENABLED=false)")
        return None
    
    if not settings.redis_url:
        logger.warning("⚠ Redis URL not configured (REDIS_URL not set)")
        return None
    
    try:
        client = get_redis_client()
        if client:
            client.ping()
            info = client.info()
            logger.info(f"✓ Redis connected")
            logger.info(f"  Version: {info.get('redis_version', 'unknown')}")
            logger.info(f"  Used memory: {info.get('used_memory_human', 'unknown')}")
            logger.info(f"  Connected clients: {info.get('connected_clients', 'unknown')}")
            return True
        else:
            logger.warning("⚠ Redis client not available")
            return False
    except Exception as e:
        logger.error(f"✗ Redis connection failed: {e}")
        logger.info(f"  Check REDIS_URL: {settings.redis_url}")
        return False


def check_neo4j():
    """Check Neo4j connection."""
    logger.info("Checking Neo4j...")
    if not settings.neo4j_enabled:
        logger.info("⚠ Neo4j is disabled (NEO4J_ENABLED=false)")
        return None
    
    if not all([settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password]):
        logger.warning("⚠ Neo4j credentials not fully configured")
        logger.info("  Required: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD")
        return None
    
    try:
        driver = get_graph_driver()
        if driver:
            with driver.session() as session:
                result = session.run("RETURN 1 as test")
                result.single()
                logger.info(f"✓ Neo4j connected")
                logger.info(f"  URI: {settings.neo4j_uri}")
                
                # Get node count
                result = session.run("MATCH (n) RETURN count(n) as count")
                count = result.single()["count"]
                logger.info(f"  Total nodes: {count}")
                
                # Get relationship count
                result = session.run("MATCH ()-[r]->() RETURN count(r) as count")
                rel_count = result.single()["count"]
                logger.info(f"  Total relationships: {rel_count}")
            
            return True
        else:
            logger.warning("⚠ Neo4j driver not available")
            return False
    except Exception as e:
        logger.error(f"✗ Neo4j connection failed: {e}")
        logger.info(f"  Check NEO4J_URI: {settings.neo4j_uri}")
        return False


def main():
    """Check all services."""
    logger.info("=" * 60)
    logger.info("Database Services Status Check")
    logger.info("=" * 60)
    logger.info("")
    
    results = {
        "PostgreSQL": check_postgresql(),
        "Redis": check_redis(),
        "Neo4j": check_neo4j()
    }
    
    logger.info("")
    logger.info("=" * 60)
    logger.info("Summary")
    logger.info("=" * 60)
    
    for service, status in results.items():
        if status is True:
            logger.info(f"✓ {service}: OK")
        elif status is False:
            logger.error(f"✗ {service}: FAILED")
        else:
            logger.info(f"⚠ {service}: DISABLED/NOT CONFIGURED")
    
    logger.info("")
    
    # Exit with error code if PostgreSQL failed
    if results["PostgreSQL"] is False:
        sys.exit(1)


if __name__ == "__main__":
    main()

