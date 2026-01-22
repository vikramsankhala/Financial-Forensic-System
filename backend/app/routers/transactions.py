"""Transaction API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Transaction, Score
from app.schemas import (
    TransactionCreate, TransactionResponse, TransactionScoreRequest,
    TransactionScoreResponse, ScoreResponse
)
from app.auth import get_current_user, require_role, User, UserRole
from app.scoring import FraudScoringEngine
from app.features import FeatureEngineer
from app.autoencoder import Autoencoder
from app.agents import AnomalyAgent, ComplianceAgent, InvestigationAgent
from app.audit import log_audit_event
from app.config import settings
import os

router = APIRouter(prefix="/transactions", tags=["transactions"])

# Initialize scoring engine (would be loaded from config in production)
_scoring_engine: Optional[FraudScoringEngine] = None
_anomaly_agent: Optional[AnomalyAgent] = None
_compliance_agent: Optional[ComplianceAgent] = None
_investigation_agent: Optional[InvestigationAgent] = None


def get_scoring_engine() -> FraudScoringEngine:
    """Get or initialize scoring engine."""
    global _scoring_engine
    if _scoring_engine is None:
        # Load models (stub - would load from files in production)
        feature_engineer = FeatureEngineer(scaler_path=settings.feature_scaler_path)
        
        # Load autoencoder (stub - would load from file)
        if os.path.exists(settings.autoencoder_model_path):
            autoencoder = Autoencoder.load(settings.autoencoder_model_path)
        else:
            # Create dummy model for demo
            autoencoder = Autoencoder(input_dim=18)
        
        _scoring_engine = FraudScoringEngine(
            autoencoder=autoencoder,
            feature_engineer=feature_engineer,
            threshold_percentile=settings.anomaly_threshold_percentile
        )
    return _scoring_engine


def get_anomaly_agent() -> AnomalyAgent:
    """Get anomaly agent."""
    global _anomaly_agent
    if _anomaly_agent is None:
        _anomaly_agent = AnomalyAgent(get_scoring_engine())
    return _anomaly_agent


def get_compliance_agent() -> ComplianceAgent:
    """Get compliance agent."""
    global _compliance_agent
    if _compliance_agent is None:
        _compliance_agent = ComplianceAgent()
    return _compliance_agent


def get_investigation_agent() -> InvestigationAgent:
    """Get investigation agent."""
    global _investigation_agent
    if _investigation_agent is None:
        _investigation_agent = InvestigationAgent()
    return _investigation_agent


@router.post("/score", response_model=TransactionScoreResponse)
async def score_transaction(
    request: TransactionScoreRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Score a transaction for fraud."""
    try:
        # Store transaction
        transaction = Transaction(**request.transaction.dict())
        db.add(transaction)
        db.flush()
        
        # Score transaction
        anomaly_agent = get_anomaly_agent()
        score_result = anomaly_agent.score_transaction(
            request.transaction.dict(), db
        )
        
        # Store score
        score = Score(
            transaction_id=transaction.id,
            anomaly_score=score_result["anomaly_score"],
            reconstruction_error=score_result["reconstruction_error"],
            classifier_score=score_result.get("classifier_score"),
            risk_level=score_result["risk_level"],
            decision=score_result["decision"],
            feature_contributions=score_result["feature_contributions"]
        )
        db.add(score)
        
        # Run compliance checks
        compliance_agent = get_compliance_agent()
        reasons = []
        
        if transaction.customer_id:
            velocity_check = compliance_agent.check_velocity(transaction.customer_id, db)
            if not velocity_check["passed"]:
                reasons.extend(velocity_check["violations"])
        
        geo_check = compliance_agent.check_geographic_consistency(transaction, db)
        if not geo_check["passed"]:
            reasons.extend(geo_check.get("violations", []))
        
        merchant_check = compliance_agent.check_merchant_restrictions(transaction)
        if not merchant_check["passed"]:
            reasons.extend(merchant_check["violations"])
        
        # Auto-create case if high risk
        if score_result["risk_level"].value in ["high", "critical"]:
            investigation_agent = get_investigation_agent()
            try:
                case = investigation_agent.create_case_from_transaction(
                    transaction.id, db, owner_id=current_user.id
                )
                reasons.append(f"Case {case.case_id} auto-created")
            except Exception as e:
                pass  # Don't fail if case creation fails
        
        db.commit()
        
        # Audit log
        log_audit_event(
            db=db,
            action="score_transaction",
            resource_type="transaction",
            resource_id=str(transaction.id),
            actor_id=current_user.id,
            after_state={"risk_level": score_result["risk_level"].value},
            metadata={"anomaly_score": score_result["anomaly_score"]}
        )
        
        return TransactionScoreResponse(
            transaction_id=transaction.transaction_id,
            score=score_result["anomaly_score"],
            risk_level=score_result["risk_level"],
            decision=score_result["decision"],
            reasons=reasons,
            feature_contributions=score_result["feature_contributions"]
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a transaction by ID."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    risk_level: Optional[str] = None,
    customer_id: Optional[str] = None,
    merchant_id: Optional[str] = None,
    flagged: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List transactions with filters."""
    query = db.query(Transaction)
    
    if risk_level:
        query = query.join(Score).filter(Score.risk_level == risk_level)
    
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    
    if merchant_id:
        query = query.filter(Transaction.merchant_id == merchant_id)
    
    if flagged is not None:
        # Check if transaction is linked to any case
        from app.models import CaseTransaction
        if flagged:
            tx_ids = db.query(CaseTransaction.transaction_id).distinct().all()
            tx_ids = [tx[0] for tx in tx_ids]
            query = query.filter(Transaction.id.in_(tx_ids))
        else:
            tx_ids = db.query(CaseTransaction.transaction_id).distinct().all()
            tx_ids = [tx[0] for tx in tx_ids]
            query = query.filter(~Transaction.id.in_(tx_ids))
    
    transactions = query.order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
    return transactions


@router.post("/{transaction_id}/flag")
async def flag_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INVESTIGATOR, UserRole.ADMIN))
):
    """Flag a transaction and create a case."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check if case already exists
    from app.models import CaseTransaction
    existing_case = db.query(CaseTransaction).filter(
        CaseTransaction.transaction_id == transaction_id
    ).first()
    
    if existing_case:
        raise HTTPException(status_code=400, detail="Transaction already flagged")
    
    # Create case
    investigation_agent = get_investigation_agent()
    case = investigation_agent.create_case_from_transaction(
        transaction_id, db, owner_id=current_user.id,
        title=f"Flagged Transaction - {transaction.transaction_id}"
    )
    
    log_audit_event(
        db=db,
        action="flag_transaction",
        resource_type="transaction",
        resource_id=str(transaction_id),
        actor_id=current_user.id,
        metadata={"case_id": case.case_id}
    )
    
    return {"message": "Transaction flagged", "case_id": case.case_id}

