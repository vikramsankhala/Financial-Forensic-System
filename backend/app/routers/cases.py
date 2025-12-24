"""Case management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Case, CaseEvent, CaseTransaction, Transaction, Entity, CaseEntity
from app.schemas import (
    CaseCreate, CaseUpdate, CaseResponse, CaseEventCreate, CaseEventResponse,
    CaseReportResponse, TransactionResponse, EntityResponse
)
from app.auth import get_current_user, require_role, User, UserRole
from app.agents import InvestigationAgent
from app.audit import log_audit_event
from app.models import CaseStatus

router = APIRouter(prefix="/cases", tags=["cases"])

_investigation_agent: InvestigationAgent = None


def get_investigation_agent() -> InvestigationAgent:
    """Get investigation agent."""
    global _investigation_agent
    if _investigation_agent is None:
        _investigation_agent = InvestigationAgent()
    return _investigation_agent


@router.post("", response_model=CaseResponse)
async def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INVESTIGATOR, UserRole.ADMIN))
):
    """Create a new case."""
    from datetime import datetime
    from app.models import Case
    
    case = Case(
        case_id=f"CASE-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        title=case_data.title,
        description=case_data.description,
        priority=case_data.priority,
        tags=case_data.tags,
        owner_id=current_user.id,
        status=CaseStatus.OPEN
    )
    
    db.add(case)
    db.commit()
    db.refresh(case)
    
    log_audit_event(
        db=db,
        action="create_case",
        resource_type="case",
        resource_id=str(case.id),
        actor_id=current_user.id,
        after_state={"status": case.status.value, "title": case.title}
    )
    
    return case


@router.get("", response_model=List[CaseResponse])
async def list_cases(
    skip: int = 0,
    limit: int = 100,
    status: Optional[CaseStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List cases."""
    query = db.query(Case)
    
    if status:
        query = query.filter(Case.status == status)
    
    cases = query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()
    return cases


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a case by ID."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: int,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INVESTIGATOR, UserRole.ADMIN))
):
    """Update a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    before_state = {
        "status": case.status.value,
        "priority": case.priority,
        "title": case.title
    }
    
    if case_update.title is not None:
        case.title = case_update.title
    if case_update.description is not None:
        case.description = case_update.description
    if case_update.status is not None:
        investigation_agent = get_investigation_agent()
        case = investigation_agent.update_case_status(case_id, case_update.status, db, current_user.id)
    if case_update.priority is not None:
        case.priority = case_update.priority
    if case_update.owner_id is not None:
        case.owner_id = case_update.owner_id
    if case_update.tags is not None:
        case.tags = case_update.tags
    
    db.commit()
    db.refresh(case)
    
    after_state = {
        "status": case.status.value,
        "priority": case.priority,
        "title": case.title
    }
    
    log_audit_event(
        db=db,
        action="update_case",
        resource_type="case",
        resource_id=str(case_id),
        actor_id=current_user.id,
        before_state=before_state,
        after_state=after_state
    )
    
    return case


@router.post("/{case_id}/notes", response_model=CaseEventResponse)
async def add_case_note(
    case_id: int,
    event_data: CaseEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a note/event to a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    event = CaseEvent(
        case_id=case_id,
        event_type=event_data.event_type,
        title=event_data.title,
        content=event_data.content,
        event_metadata=event_data.metadata,
        created_by_id=current_user.id
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    log_audit_event(
        db=db,
        action="add_case_note",
        resource_type="case",
        resource_id=str(case_id),
        actor_id=current_user.id,
        metadata={"event_type": event_data.event_type}
    )
    
    return event


@router.get("/{case_id}/report", response_model=CaseReportResponse)
async def get_case_report(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a case report. Cached for 5 minutes."""
    from app.cache import get_cache, set_cache, CacheKeys
    
    cache_key = f"{CacheKeys.CASE_REPORT}:{case_id}"
    cached_report = get_cache(cache_key)
    if cached_report:
        return cached_report
    
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get related transactions
    case_txs = db.query(CaseTransaction).filter(CaseTransaction.case_id == case_id).all()
    transaction_ids = [ct.transaction_id for ct in case_txs]
    transactions = db.query(Transaction).filter(Transaction.id.in_(transaction_ids)).all()
    
    # Get related entities
    case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
    entity_ids = [ce.entity_id for ce in case_entities]
    entities = db.query(Entity).filter(Entity.id.in_(entity_ids)).all()
    
    # Get events
    events = db.query(CaseEvent).filter(CaseEvent.case_id == case_id).order_by(CaseEvent.created_at).all()
    
    # Compute summary
    summary = {
        "transaction_count": len(transactions),
        "entity_count": len(entities),
        "event_count": len(events),
        "status": case.status.value,
        "priority": case.priority
    }
    
    result = CaseReportResponse(
        case=case,
        transactions=transactions,
        entities=entities,
        events=events,
        summary=summary
    )
    
    # Cache for 5 minutes
    set_cache(cache_key, result, ttl=300)
    
    return result

