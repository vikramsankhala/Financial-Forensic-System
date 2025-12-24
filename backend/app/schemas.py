"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models import CaseStatus, RiskLevel, UserRole


# Transaction schemas
class TransactionCreate(BaseModel):
    """Transaction creation schema."""
    transaction_id: str
    amount: float
    currency: str = "USD"
    merchant_id: Optional[str] = None
    merchant_name: Optional[str] = None
    merchant_category: Optional[str] = None
    channel: Optional[str] = None
    customer_id: Optional[str] = None
    account_id: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    geo_country: Optional[str] = None
    geo_city: Optional[str] = None
    timestamp: datetime


class TransactionResponse(BaseModel):
    """Transaction response schema."""
    id: int
    transaction_id: str
    amount: float
    currency: str
    merchant_id: Optional[str]
    merchant_name: Optional[str]
    merchant_category: Optional[str]
    channel: Optional[str]
    customer_id: Optional[str]
    account_id: Optional[str]
    device_id: Optional[str]
    ip_address: Optional[str]
    geo_country: Optional[str]
    geo_city: Optional[str]
    timestamp: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class ScoreResponse(BaseModel):
    """Score response schema."""
    transaction_id: int
    anomaly_score: float
    reconstruction_error: Optional[float]
    classifier_score: Optional[float]
    risk_level: RiskLevel
    decision: str
    feature_contributions: Dict[str, float]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionScoreRequest(BaseModel):
    """Transaction scoring request."""
    transaction: TransactionCreate


class TransactionScoreResponse(BaseModel):
    """Transaction scoring response."""
    transaction_id: str
    score: float
    risk_level: RiskLevel
    decision: str
    reasons: List[str]
    feature_contributions: Dict[str, float]


# Case schemas
class CaseCreate(BaseModel):
    """Case creation schema."""
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    tags: Optional[List[str]] = None


class CaseUpdate(BaseModel):
    """Case update schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[str] = None
    owner_id: Optional[int] = None
    tags: Optional[List[str]] = None


class CaseEventCreate(BaseModel):
    """Case event creation schema."""
    event_type: str
    title: str
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CaseResponse(BaseModel):
    """Case response schema."""
    id: int
    case_id: str
    title: str
    description: Optional[str]
    status: CaseStatus
    priority: Optional[str]
    owner_id: Optional[int]
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class CaseEventResponse(BaseModel):
    """Case event response schema."""
    id: int
    case_id: int
    event_type: str
    title: str
    content: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_by_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Entity schemas
class EntityResponse(BaseModel):
    """Entity response schema."""
    id: int
    entity_id: str
    entity_type: str
    name: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EntityNetworkResponse(BaseModel):
    """Entity network response schema."""
    entity: EntityResponse
    links: List[Dict[str, Any]]


# User schemas
class UserCreate(BaseModel):
    """User creation schema."""
    username: str
    email: Optional[str] = None
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.ANALYST


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    username: str
    email: Optional[str]
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Report schemas
class CaseReportResponse(BaseModel):
    """Case report response schema."""
    case: CaseResponse
    transactions: List[TransactionResponse]
    entities: List[EntityResponse]
    events: List[CaseEventResponse]
    summary: Dict[str, Any]


# Metrics schema
class MetricsResponse(BaseModel):
    """Metrics response schema."""
    metrics: Dict[str, Any]

