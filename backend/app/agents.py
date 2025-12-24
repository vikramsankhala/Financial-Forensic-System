"""Forensic agents for fraud detection and investigation."""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.models import CaseStatus, RiskLevel, Transaction, Score, Case
from sqlalchemy.orm import Session
from app.scoring import FraudScoringEngine


class AnomalyAgent:
    """Agent for anomaly detection and scoring."""
    
    def __init__(self, scoring_engine: FraudScoringEngine):
        """Initialize anomaly agent.
        
        Args:
            scoring_engine: Fraud scoring engine
        """
        self.scoring_engine = scoring_engine
    
    def score_transaction(self, transaction_data: Dict[str, Any],
                         db: Session,
                         historical_stats: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Score a transaction and store results.
        
        Args:
            transaction_data: Transaction data
            db: Database session
            historical_stats: Optional historical statistics
        
        Returns:
            Scoring results dictionary
        """
        # Score transaction
        score_result = self.scoring_engine.score_transaction(
            transaction_data, historical_stats
        )
        
        return score_result


class ComplianceAgent:
    """Agent for compliance and rule-based checks."""
    
    def __init__(self):
        """Initialize compliance agent."""
        # Mock sanctions/PEP lists (in production, these would be external services)
        self.sanctions_list = set()  # Would be loaded from external source
        self.pep_list = set()  # Politically Exposed Persons
    
    def check_velocity(self, customer_id: str, db: Session,
                      time_window_hours: int = 24) -> Dict[str, Any]:
        """Check transaction velocity for a customer.
        
        Args:
            customer_id: Customer ID
            db: Database session
            time_window_hours: Time window in hours
        
        Returns:
            Velocity check results
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=time_window_hours)
        
        count = db.query(Transaction).filter(
            Transaction.customer_id == customer_id,
            Transaction.timestamp >= cutoff_time
        ).count()
        
        # Simple velocity rules
        thresholds = {
            24: 50,  # Max 50 transactions in 24h
            1: 10    # Max 10 transactions in 1h
        }
        
        violations = []
        if count > thresholds.get(24, 50):
            violations.append(f"High transaction count ({count}) in 24h")
        
        return {
            "customer_id": customer_id,
            "transaction_count": count,
            "time_window_hours": time_window_hours,
            "violations": violations,
            "passed": len(violations) == 0
        }
    
    def check_geographic_consistency(self, transaction: Transaction,
                                   db: Session) -> Dict[str, Any]:
        """Check for impossible travel scenarios.
        
        Args:
            transaction: Transaction to check
            db: Database session
        
        Returns:
            Geographic consistency check results
        """
        if not transaction.customer_id or not transaction.geo_country:
            return {"passed": True, "reason": "Insufficient data"}
        
        # Get previous transaction for this customer
        prev_tx = db.query(Transaction).filter(
            Transaction.customer_id == transaction.customer_id,
            Transaction.timestamp < transaction.timestamp
        ).order_by(Transaction.timestamp.desc()).first()
        
        if not prev_tx or not prev_tx.geo_country:
            return {"passed": True, "reason": "No previous transaction"}
        
        # Check if countries are different
        if prev_tx.geo_country != transaction.geo_country:
            time_diff = (transaction.timestamp - prev_tx.timestamp).total_seconds() / 3600
            
            # Flag if transactions are less than 2 hours apart in different countries
            if time_diff < 2.0:
                return {
                    "passed": False,
                    "violations": [f"Impossible travel: {prev_tx.geo_country} -> {transaction.geo_country} in {time_diff:.1f}h"],
                    "previous_country": prev_tx.geo_country,
                    "current_country": transaction.geo_country,
                    "time_diff_hours": time_diff
                }
        
        return {"passed": True}
    
    def check_sanctions(self, entity_id: str, entity_type: str) -> Dict[str, Any]:
        """Check entity against sanctions list (stub).
        
        Args:
            entity_id: Entity ID
            entity_type: Entity type
        
        Returns:
            Sanctions check results
        """
        # Mock implementation
        is_sanctioned = entity_id in self.sanctions_list
        return {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "is_sanctioned": is_sanctioned,
            "passed": not is_sanctioned
        }
    
    def check_merchant_restrictions(self, transaction: Transaction) -> Dict[str, Any]:
        """Check merchant category restrictions.
        
        Args:
            transaction: Transaction to check
        
        Returns:
            Merchant restriction check results
        """
        # Mock restricted categories
        restricted_categories = {"gambling", "adult", "crypto"}
        
        category = transaction.merchant_category or ""
        is_restricted = category.lower() in restricted_categories
        
        violations = []
        if is_restricted:
            violations.append(f"Restricted merchant category: {category}")
        
        return {
            "merchant_category": category,
            "is_restricted": is_restricted,
            "violations": violations,
            "passed": not is_restricted
        }


class InvestigationAgent:
    """Agent for case management and investigation workflows."""
    
    def create_case_from_transaction(self, transaction_id: int, db: Session,
                                    owner_id: Optional[int] = None,
                                    title: Optional[str] = None) -> Case:
        """Create a case from a flagged transaction.
        
        Args:
            transaction_id: Transaction ID
            db: Database session
            owner_id: Optional owner user ID
            title: Optional case title
        
        Returns:
            Created case
        """
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise ValueError(f"Transaction {transaction_id} not found")
        
        score = db.query(Score).filter(Score.transaction_id == transaction_id).first()
        
        if not title:
            title = f"Fraud Investigation - Transaction {transaction.transaction_id}"
        
        case = Case(
            case_id=f"CASE-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{transaction_id}",
            title=title,
            description=f"Auto-created from transaction {transaction.transaction_id}",
            status=CaseStatus.TRIAGE,
            priority=self._determine_priority(score),
            owner_id=owner_id
        )
        
        db.add(case)
        db.flush()
        
        # Link transaction to case
        from app.models import CaseTransaction
        case_tx = CaseTransaction(
            case_id=case.id,
            transaction_id=transaction_id,
            added_by_id=owner_id
        )
        db.add(case_tx)
        
        # Extract and link entities
        self._link_entities_from_transaction(case, transaction, db)
        
        db.commit()
        db.refresh(case)
        
        return case
    
    def _determine_priority(self, score: Optional[Score]) -> str:
        """Determine case priority from score.
        
        Args:
            score: Score object
        
        Returns:
            Priority string
        """
        if not score:
            return "medium"
        
        if score.risk_level == RiskLevel.CRITICAL:
            return "critical"
        elif score.risk_level == RiskLevel.HIGH:
            return "high"
        elif score.risk_level == RiskLevel.MEDIUM:
            return "medium"
        else:
            return "low"
    
    def _link_entities_from_transaction(self, case: Case, transaction: Transaction,
                                       db: Session):
        """Link entities from transaction to case.
        
        Args:
            case: Case object
            transaction: Transaction object
            db: Database session
        """
        from app.models import Entity, CaseEntity
        
        entity_types = {
            "customer": transaction.customer_id,
            "merchant": transaction.merchant_id,
            "device": transaction.device_id,
            "account": transaction.account_id,
        }
        
        for entity_type, entity_id in entity_types.items():
            if not entity_id:
                continue
            
            # Find or create entity
            entity = db.query(Entity).filter(
                Entity.entity_id == entity_id,
                Entity.entity_type == entity_type
            ).first()
            
            if not entity:
                entity = Entity(
                    entity_id=entity_id,
                    entity_type=entity_type,
                    name=f"{entity_type}_{entity_id}"
                )
                db.add(entity)
                db.flush()
            
            # Link to case
            case_entity = CaseEntity(
                case_id=case.id,
                entity_id=entity.id
            )
            db.add(case_entity)
    
    def update_case_status(self, case_id: int, new_status: CaseStatus,
                          db: Session, user_id: int) -> Case:
        """Update case status.
        
        Args:
            case_id: Case ID
            new_status: New status
            db: Database session
            user_id: User ID making the change
        
        Returns:
            Updated case
        """
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError(f"Case {case_id} not found")
        
        old_status = case.status
        case.status = new_status
        
        if new_status == CaseStatus.CLOSED:
            case.closed_at = datetime.utcnow()
        
        # Log status change event
        from app.models import CaseEvent
        event = CaseEvent(
            case_id=case.id,
            event_type="status_change",
            title=f"Status changed: {old_status.value} -> {new_status.value}",
            created_by_id=user_id,
            metadata={"old_status": old_status.value, "new_status": new_status.value}
        )
        db.add(event)
        
        db.commit()
        db.refresh(case)
        
        return case


class MonitoringAgent:
    """Agent for monitoring model performance and drift."""
    
    def __init__(self):
        """Initialize monitoring agent."""
        self.score_history: List[float] = []
        self.max_history = 10000
    
    def record_score(self, score: float):
        """Record a score for drift monitoring.
        
        Args:
            score: Anomaly score
        """
        self.score_history.append(score)
        if len(self.score_history) > self.max_history:
            self.score_history.pop(0)
    
    def compute_drift_metrics(self) -> Dict[str, Any]:
        """Compute concept drift metrics.
        
        Returns:
            Dictionary with drift metrics
        """
        if len(self.score_history) < 100:
            return {"status": "insufficient_data"}
        
        recent_scores = self.score_history[-1000:]
        older_scores = self.score_history[-5000:-1000] if len(self.score_history) >= 5000 else self.score_history[:-1000]
        
        if len(older_scores) == 0:
            return {"status": "insufficient_data"}
        
        recent_mean = sum(recent_scores) / len(recent_scores)
        older_mean = sum(older_scores) / len(older_scores)
        
        drift_ratio = recent_mean / older_mean if older_mean > 0 else 1.0
        
        return {
            "recent_mean": recent_mean,
            "older_mean": older_mean,
            "drift_ratio": drift_ratio,
            "drift_detected": abs(drift_ratio - 1.0) > 0.2,  # 20% change threshold
            "sample_size_recent": len(recent_scores),
            "sample_size_older": len(older_scores)
        }

