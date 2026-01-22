"""Audit logging utilities."""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import AuditLog, User
from datetime import datetime


def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: str,
    actor_id: Optional[int] = None,
    before_state: Optional[Dict[str, Any]] = None,
    after_state: Optional[Dict[str, Any]] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Log an audit event.
    
    Args:
        db: Database session
        action: Action performed (e.g., "create_case", "update_score")
        resource_type: Type of resource (e.g., "case", "transaction")
        resource_id: ID of the resource
        actor_id: User ID performing the action
        before_state: State before the action
        after_state: State after the action
        metadata: Additional metadata
        ip_address: IP address of the request
        user_agent: User agent string
    """
    actor_username = None
    if actor_id:
        user = db.query(User).filter(User.id == actor_id).first()
        if user:
            actor_username = user.username
    
    audit_log = AuditLog(
        actor_id=actor_id,
        actor_username=actor_username,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        before_state=before_state,
        after_state=after_state,
        metadata=metadata,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(audit_log)
    db.commit()

