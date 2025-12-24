"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class CaseStatus(str, enum.Enum):
    """Case status enumeration."""
    OPEN = "open"
    TRIAGE = "triage"
    INVESTIGATION = "investigation"
    REMEDIATION = "remediation"
    CLOSED = "closed"


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class UserRole(str, enum.Enum):
    """User role enumeration."""
    INVESTIGATOR = "investigator"
    ANALYST = "analyst"
    ADMIN = "admin"
    READ_ONLY = "read_only"


class Transaction(Base):
    """Transaction model."""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    merchant_id = Column(String, index=True)
    merchant_name = Column(String)
    merchant_category = Column(String)
    channel = Column(String)  # online, pos, atm, etc.
    customer_id = Column(String, index=True)
    account_id = Column(String, index=True)
    device_id = Column(String, index=True)
    ip_address = Column(String)
    geo_country = Column(String(2))
    geo_city = Column(String)
    timestamp = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    score = relationship("Score", back_populates="transaction", uselist=False)
    case_transactions = relationship("CaseTransaction", back_populates="transaction")


class Score(Base):
    """Fraud score model."""
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), unique=True, nullable=False)
    anomaly_score = Column(Float, nullable=False, index=True)
    reconstruction_error = Column(Float)
    classifier_score = Column(Float)
    risk_level = Column(SQLEnum(RiskLevel), nullable=False, index=True)
    decision = Column(String)  # approve, review, block
    feature_contributions = Column(JSON)  # Feature attribution data
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="score")


class Entity(Base):
    """Entity model (customer, merchant, device, IP, etc.)."""
    __tablename__ = "entities"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, unique=True, index=True, nullable=False)
    entity_type = Column(String, nullable=False, index=True)  # customer, merchant, device, ip, account
    name = Column(String)
    entity_metadata = Column(JSON)  # Additional entity-specific data
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    links_from = relationship("EntityLink", foreign_keys="EntityLink.from_entity_id", back_populates="from_entity")
    links_to = relationship("EntityLink", foreign_keys="EntityLink.to_entity_id", back_populates="to_entity")
    case_entities = relationship("CaseEntity", back_populates="entity")


class EntityLink(Base):
    """Relationship between entities."""
    __tablename__ = "entity_links"
    
    id = Column(Integer, primary_key=True, index=True)
    from_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    to_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    relationship_type = Column(String)  # owns, uses, transacted_with, etc.
    link_metadata = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    from_entity = relationship("Entity", foreign_keys=[from_entity_id], back_populates="links_from")
    to_entity = relationship("Entity", foreign_keys=[to_entity_id], back_populates="links_to")


class Case(Base):
    """Case model for investigations."""
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.OPEN, index=True)
    priority = Column(String)  # low, medium, high, critical
    owner_id = Column(Integer, ForeignKey("users.id"))
    tags = Column(JSON)  # List of tags
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime)
    
    # Relationships
    owner = relationship("User", back_populates="owned_cases")
    events = relationship("CaseEvent", back_populates="case", order_by="CaseEvent.created_at")
    case_transactions = relationship("CaseTransaction", back_populates="case")
    case_entities = relationship("CaseEntity", back_populates="case")


class CaseEvent(Base):
    """Case timeline event (notes, actions)."""
    __tablename__ = "case_events"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    event_type = Column(String, nullable=False)  # note, action, status_change, etc.
    title = Column(String)
    content = Column(Text)
    event_metadata = Column(JSON)  # Additional event data
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now(), index=True)
    
    # Relationships
    case = relationship("Case", back_populates="events")
    created_by = relationship("User", back_populates="case_events")


class CaseTransaction(Base):
    """Many-to-many relationship between cases and transactions."""
    __tablename__ = "case_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    added_at = Column(DateTime, server_default=func.now())
    added_by_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    case = relationship("Case", back_populates="case_transactions")
    transaction = relationship("Transaction", back_populates="case_transactions")


class CaseEntity(Base):
    """Many-to-many relationship between cases and entities."""
    __tablename__ = "case_entities"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    added_at = Column(DateTime, server_default=func.now())
    added_by_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    case = relationship("Case", back_populates="case_entities")
    entity = relationship("Entity", back_populates="case_entities")


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.ANALYST, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owned_cases = relationship("Case", back_populates="owner")
    case_events = relationship("CaseEvent", back_populates="created_by")


class AuditLog(Base):
    """Immutable audit log."""
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"))
    actor_username = Column(String)  # Denormalized for immutability
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, index=True)  # transaction, case, entity, user, etc.
    resource_id = Column(String, index=True)
    before_state = Column(JSON)
    after_state = Column(JSON)
    audit_metadata = Column(JSON)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, server_default=func.now(), index=True)

