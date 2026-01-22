"""Dashboard metrics API endpoints with Redis caching."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, text
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models import Transaction, Score, Case, CaseStatus
from app.auth import get_current_user, User
from app.cache import get_cache, set_cache, CacheKeys
from app.routers.metrics import router as prometheus_router

router = APIRouter(prefix="/metrics", tags=["dashboard-metrics"])


@router.get("/dashboard")
async def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard KPI metrics. Cached for 10 seconds."""
    cache_key = CacheKeys.METRICS_DASHBOARD
    cached_metrics = get_cache(cache_key)
    if cached_metrics:
        return cached_metrics
    
    # Calculate today's date range
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Total transactions today
    total_transactions_today = db.query(Transaction).filter(
        Transaction.timestamp >= today_start
    ).count()
    
    # High-risk transactions today
    high_risk_today = db.query(Transaction).join(Score).filter(
        and_(
            Transaction.timestamp >= today_start,
            Score.risk_level.in_(["high", "critical"])
        )
    ).count()
    
    # Open cases
    open_cases = db.query(Case).filter(Case.status != CaseStatus.CLOSED).count()
    
    # Calculate alerts (high-risk transactions not yet in cases)
    # This is a simplified calculation
    alerts_generated = high_risk_today
    
    # False positive rate (simplified - would need case resolution tracking)
    false_positive_rate = 0.0  # Placeholder
    
    # Average response time (simplified - would need case event tracking)
    average_response_time = 0.0  # Placeholder
    
    metrics = {
        "total_transactions_today": total_transactions_today,
        "high_risk_transactions": high_risk_today,
        "alerts_generated": alerts_generated,
        "open_cases": open_cases,
        "false_positive_rate": false_positive_rate,
        "average_response_time": average_response_time
    }
    
    # Cache for 10 seconds
    set_cache(cache_key, metrics, ttl=10)
    
    return metrics


@router.get("/risk-distribution")
async def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get risk level distribution. Cached for 30 seconds."""
    cache_key = CacheKeys.METRICS_RISK_DIST
    cached_dist = get_cache(cache_key)
    if cached_dist:
        return cached_dist
    
    # Count by risk level
    risk_counts = db.query(
        Score.risk_level,
        func.count(Score.id).label('count')
    ).group_by(Score.risk_level).all()
    
    total = sum(count for _, count in risk_counts)
    
    distribution = {
        "critical": {"count": 0, "percentage": 0.0},
        "high": {"count": 0, "percentage": 0.0},
        "medium": {"count": 0, "percentage": 0.0},
        "low": {"count": 0, "percentage": 0.0}
    }
    
    for risk_level, count in risk_counts:
        level = risk_level.value if hasattr(risk_level, 'value') else str(risk_level)
        distribution[level] = {
            "count": count,
            "percentage": (count / total * 100) if total > 0 else 0.0
        }
    
    # Cache for 30 seconds
    set_cache(cache_key, distribution, ttl=30)
    
    return distribution


@router.get("/transactions-over-time")
async def get_transactions_over_time(
    interval: str = Query("15m", regex="^(15m|1h|1d)$"),
    hours: int = Query(24, ge=1, le=168),  # Max 7 days
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transaction counts over time. Uses TimescaleDB time_bucket if available."""
    cache_key = f"{CacheKeys.METRICS_TRANSACTIONS_TIME}:{interval}:{hours}"
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data
    
    # Calculate time range
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=hours)
    
    # Determine interval in minutes
    interval_minutes = {
        "15m": 15,
        "1h": 60,
        "1d": 1440
    }[interval]
    
    # Try TimescaleDB time_bucket function first
    try:
        # Check if TimescaleDB is available
        # Use text() with safe parameter substitution
        query = text(f"""
            SELECT 
                time_bucket(INTERVAL '{interval_minutes} minutes', timestamp) as bucket,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE EXISTS (
                    SELECT 1 FROM scores s 
                    WHERE s.transaction_id = transactions.id 
                    AND s.risk_level IN ('high', 'critical')
                )) as high_risk
            FROM transactions
            WHERE timestamp >= :start_time AND timestamp <= :end_time
            GROUP BY bucket
            ORDER BY bucket
        """)
        result = db.execute(
            query,
            {"start_time": start_time, "end_time": end_time}
        )
        
        data = [
            {
                "timestamp": row.bucket.isoformat(),
                "total": row.total,
                "high_risk": row.high_risk,
                "alerts": row.high_risk  # Simplified
            }
            for row in result
        ]
    except Exception:
        # Fallback to PostgreSQL-only query (less efficient)
        # Group by time intervals manually
        data = []
        current_time = start_time
        
        while current_time <= end_time:
            next_time = current_time + timedelta(minutes=interval_minutes)
            
            total = db.query(Transaction).filter(
                and_(
                    Transaction.timestamp >= current_time,
                    Transaction.timestamp < next_time
                )
            ).count()
            
            high_risk = db.query(Transaction).join(Score).filter(
                and_(
                    Transaction.timestamp >= current_time,
                    Transaction.timestamp < next_time,
                    Score.risk_level.in_(["high", "critical"])
                )
            ).count()
            
            data.append({
                "timestamp": current_time.isoformat(),
                "total": total,
                "high_risk": high_risk,
                "alerts": high_risk
            })
            
            current_time = next_time
    
    # Cache for 1 minute
    set_cache(cache_key, data, ttl=60)
    
    return data

