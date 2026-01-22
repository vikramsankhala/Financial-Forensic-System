"""Quick test script for Redis and Neo4j connections."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.cache import get_redis_client
from app.graph import get_graph_driver, get_graph_service
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_redis():
    """Test Redis connection."""
    print("=" * 60)
    print("Testing Redis Connection")
    print("=" * 60)
    
    if not settings.redis_enabled:
        print("⚠ Redis is disabled (REDIS_ENABLED=false)")
        return False
    
    if not settings.redis_url:
        print("⚠ Redis URL not configured")
        return False
    
    try:
        client = get_redis_client()
        if client:
            result = client.ping()
            if result:
                print("[OK] Redis connection: SUCCESS")
                info = client.info()
                print(f"   Version: {info.get('redis_version', 'unknown')}")
                print(f"   Used memory: {info.get('used_memory_human', 'unknown')}")
                
                # Test cache operations
                test_key = "test:connection"
                client.setex(test_key, 10, "test_value")
                value = client.get(test_key)
                if value:
                    print("[OK] Cache operations: WORKING")
                    client.delete(test_key)
                return True
            else:
                print("[FAIL] Redis ping failed")
                return False
        else:
            print("[FAIL] Redis client not available")
            return False
    except Exception as e:
        print(f"[FAIL] Redis connection failed: {e}")
        return False


def test_neo4j():
    """Test Neo4j connection."""
    print("\n" + "=" * 60)
    print("Testing Neo4j Connection")
    print("=" * 60)
    
    if not settings.neo4j_enabled:
        print("⚠ Neo4j is disabled (NEO4J_ENABLED=false)")
        return False
    
    if not all([settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password]):
        print("⚠ Neo4j credentials not fully configured")
        return False
    
    try:
        driver = get_graph_driver()
        if driver:
            with driver.session() as session:
                result = session.run("RETURN 1 as test")
                test_value = result.single()["test"]
                if test_value == 1:
                    print("[OK] Neo4j connection: SUCCESS")
                    print(f"   URI: {settings.neo4j_uri}")
                    
                    # Get node count
                    result = session.run("MATCH (n) RETURN count(n) as count")
                    count = result.single()["count"]
                    print(f"   Total nodes: {count}")
                    
                    # Get relationship count
                    result = session.run("MATCH ()-[r]->() RETURN count(r) as count")
                    rel_count = result.single()["count"]
                    print(f"   Total relationships: {rel_count}")
                    
                    # Test graph service
                    service = get_graph_service()
                    if service:
                        print("[OK] Graph service: AVAILABLE")
                    return True
                else:
                    print("[FAIL] Neo4j test query failed")
                    return False
        else:
            print("[FAIL] Neo4j driver not available")
            return False
    except Exception as e:
        print(f"[FAIL] Neo4j connection failed: {e}")
        print(f"   Check NEO4J_URI: {settings.neo4j_uri}")
        print(f"   Check NEO4J_USER: {settings.neo4j_user}")
        return False


def main():
    """Run tests."""
    print("\n")
    redis_ok = test_redis()
    neo4j_ok = test_neo4j()
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Redis:  {'[OK]' if redis_ok else '[FAILED]'}")
    print(f"Neo4j:  {'[OK]' if neo4j_ok else '[FAILED]'}")
    print("\n")
    
    if redis_ok and neo4j_ok:
        print("[SUCCESS] Both Redis and Neo4j are configured and working!")
        print("\nNext steps:")
        print("1. Configure DATABASE_URL in .env file")
        print("2. Run: alembic upgrade head")
        print("3. Run: python scripts/sync_entities.py (to sync data to Neo4j)")
    elif redis_ok:
        print("[OK] Redis is working. Neo4j needs configuration.")
    elif neo4j_ok:
        print("[OK] Neo4j is working. Redis needs configuration.")
    else:
        print("[WARNING] Both services need configuration.")


if __name__ == "__main__":
    main()

