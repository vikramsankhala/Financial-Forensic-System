"""Entity API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Entity, EntityLink
from app.schemas import EntityResponse, EntityNetworkResponse
from app.auth import get_current_user, User
from app.cache import get_cache, set_cache, delete_cache, CacheKeys
from app.graph import get_graph_service

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an entity by ID."""
    # Try cache first
    cache_key = CacheKeys.ENTITY + f":{entity_id}"
    cached_entity = get_cache(cache_key)
    if cached_entity:
        return cached_entity
    
    # Query database
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Cache result
    set_cache(cache_key, entity, ttl=3600)
    
    return entity


@router.get("/{entity_id}/network", response_model=EntityNetworkResponse)
async def get_entity_network(
    entity_id: int,
    max_depth: int = 2,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get entity network graph. Uses Neo4j if available, falls back to PostgreSQL."""
    # Try Neo4j first if enabled
    graph_service = get_graph_service()
    if graph_service:
        entity = db.query(Entity).filter(Entity.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")
        
        # Get network from Neo4j
        network_data = graph_service.get_entity_network(entity.entity_id, max_depth=max_depth)
        
        if network_data.get("entity"):
            return EntityNetworkResponse(
                entity=entity,
                links=network_data.get("links", [])
            )
    
    # Fallback to PostgreSQL (original implementation)
    cache_key = CacheKeys.ENTITY_NETWORK + f":{entity_id}:{max_depth}"
    cached_network = get_cache(cache_key)
    if cached_network:
        return cached_network
    
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Get all links for this entity
    links_from = db.query(EntityLink).filter(EntityLink.from_entity_id == entity_id).all()
    links_to = db.query(EntityLink).filter(EntityLink.to_entity_id == entity_id).all()
    
    # Build network representation
    network_links = []
    for link in links_from + links_to:
        target_entity = db.query(Entity).filter(
            Entity.id == (link.to_entity_id if link.from_entity_id == entity_id else link.from_entity_id)
        ).first()
        if target_entity:
            network_links.append({
                "entity_id": target_entity.entity_id,
                "entity_type": target_entity.entity_type,
                "relationship_type": link.relationship_type,
                "metadata": link.link_metadata
            })
    
    result = EntityNetworkResponse(
        entity=entity,
        links=network_links
    )
    
    # Cache result
    set_cache(cache_key, result, ttl=1800)  # 30 minutes
    
    return result


@router.get("/fraud-rings")
async def find_fraud_rings(
    min_entities: int = 3,
    min_connections: int = 2,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Find potential fraud rings using Neo4j graph analysis."""
    graph_service = get_graph_service()
    if not graph_service:
        raise HTTPException(
            status_code=503,
            detail="Neo4j graph database not available. Enable NEO4J_ENABLED and configure credentials."
        )
    
    rings = graph_service.find_fraud_rings(
        min_entities=min_entities,
        min_connections=min_connections
    )
    
    return {"fraud_rings": rings}

