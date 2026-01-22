"""Service to sync entities between PostgreSQL and Neo4j."""
import logging
from sqlalchemy.orm import Session
from app.models import Entity, EntityLink
from app.graph import get_graph_service

logger = logging.getLogger(__name__)


def sync_entity_to_graph(entity: Entity, graph_service=None):
    """Sync a single entity to Neo4j."""
    if not graph_service:
        graph_service = get_graph_service()
    
    if not graph_service:
        return
    
    try:
        graph_service.sync_entity(
            entity_id=entity.entity_id,
            entity_type=entity.entity_type,
            name=entity.name,
            metadata=entity.entity_metadata or {}
        )
    except Exception as e:
        logger.error(f"Failed to sync entity {entity.entity_id} to Neo4j: {e}")


def sync_entity_link_to_graph(link: EntityLink, db: Session, graph_service=None):
    """Sync an entity link to Neo4j."""
    if not graph_service:
        graph_service = get_graph_service()
    
    if not graph_service:
        return
    
    try:
        # Get entity IDs
        from_entity = db.query(Entity).filter(Entity.id == link.from_entity_id).first()
        to_entity = db.query(Entity).filter(Entity.id == link.to_entity_id).first()
        
        if not from_entity or not to_entity:
            logger.warning(f"Could not find entities for link {link.id}")
            return
        
        graph_service.sync_entity_link(
            from_entity_id=from_entity.entity_id,
            to_entity_id=to_entity.entity_id,
            relationship_type=link.relationship_type or "RELATES_TO",
            metadata=link.link_metadata or {}
        )
    except Exception as e:
        logger.error(f"Failed to sync entity link {link.id} to Neo4j: {e}")


def sync_all_entities_to_graph(db: Session, batch_size: int = 1000):
    """Sync all entities from PostgreSQL to Neo4j (for initial setup)."""
    graph_service = get_graph_service()
    if not graph_service:
        logger.warning("Neo4j not enabled, skipping sync")
        return
    
    logger.info("Starting full entity sync to Neo4j...")
    
    # Sync all entities
    offset = 0
    while True:
        entities = db.query(Entity).offset(offset).limit(batch_size).all()
        if not entities:
            break
        
        for entity in entities:
            sync_entity_to_graph(entity, graph_service)
        
        offset += batch_size
        logger.info(f"Synced {offset} entities...")
    
    # Sync all entity links
    offset = 0
    while True:
        links = db.query(EntityLink).offset(offset).limit(batch_size).all()
        if not links:
            break
        
        for link in links:
            sync_entity_link_to_graph(link, db, graph_service)
        
        offset += batch_size
        logger.info(f"Synced {offset} entity links...")
    
    logger.info("Entity sync to Neo4j completed")

