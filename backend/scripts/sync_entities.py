"""Script to sync entities from PostgreSQL to Neo4j."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.services.entity_sync import sync_all_entities_to_graph
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Sync all entities to Neo4j."""
    if not settings.neo4j_enabled:
        logger.warning("Neo4j is not enabled. Set NEO4J_ENABLED=true to enable.")
        return
    
    if not all([settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password]):
        logger.error("Neo4j credentials not configured. Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD.")
        return
    
    logger.info("Starting entity sync to Neo4j...")
    logger.info(f"Neo4j URI: {settings.neo4j_uri}")
    
    db = SessionLocal()
    try:
        sync_all_entities_to_graph(db)
        logger.info("Entity sync completed successfully!")
    except Exception as e:
        logger.error(f"Error during entity sync: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

