"""Tests for fraud scoring."""
import pytest
import numpy as np
from datetime import datetime
from app.scoring import FraudScoringEngine
from app.autoencoder import Autoencoder
from app.features import FeatureEngineer
from app.models import RiskLevel


@pytest.fixture
def scoring_engine():
    """Create a test scoring engine."""
    input_dim = 18
    autoencoder = Autoencoder(input_dim=input_dim, latent_dim=6)
    feature_engineer = FeatureEngineer()
    
    # Fit scaler on dummy data
    dummy_features = np.random.randn(100, input_dim).astype(np.float32)
    feature_engineer.fit_scaler(dummy_features)
    
    engine = FraudScoringEngine(
        autoencoder=autoencoder,
        feature_engineer=feature_engineer,
        threshold_percentile=95.0
    )
    
    # Set a dummy threshold
    engine.set_threshold(0.1)
    
    return engine


def test_score_transaction(scoring_engine):
    """Test transaction scoring."""
    transaction = {
        "amount": 1000.0,
        "currency": "USD",
        "merchant_category": "retail",
        "channel": "online",
        "customer_id": "C123",
        "device_id": "D456",
        "ip_address": "192.168.1.1",
        "geo_country": "US",
        "timestamp": datetime.now()
    }
    
    result = scoring_engine.score_transaction(transaction)
    
    assert "anomaly_score" in result
    assert "reconstruction_error" in result
    assert "risk_level" in result
    assert isinstance(result["risk_level"], RiskLevel)
    assert "decision" in result
    assert result["decision"] in ["approve", "monitor", "review"]
    assert "feature_contributions" in result


def test_threshold_computation(scoring_engine):
    """Test threshold computation from scores."""
    scores = np.array([0.01, 0.02, 0.03, 0.04, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5])
    
    scoring_engine.compute_threshold_from_data(scores)
    
    assert scoring_engine.threshold_value is not None
    assert scoring_engine.threshold_value > 0

