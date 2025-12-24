"""Entity API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Entity, EntityLink
from app.schemas import EntityResponse, EntityNetworkResponse
from app.auth import get_current_user, User

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an entity by ID."""
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity


@router.get("/{entity_id}/network", response_model=EntityNetworkResponse)
async def get_entity_network(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get entity network graph."""
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
                "metadata": link.metadata
            })
    
    return EntityNetworkResponse(
        entity=entity,
        links=network_links
    )

