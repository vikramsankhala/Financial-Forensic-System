"""Tests for feature engineering."""
import pytest
import numpy as np
from datetime import datetime
from app.features import FeatureEngineer


def test_build_features():
    """Test feature vector building."""
    engineer = FeatureEngineer()
    
    transaction = {
        "amount": 100.0,
        "currency": "USD",
        "merchant_category": "retail",
        "channel": "online",
        "customer_id": "C123",
        "device_id": "D456",
        "ip_address": "192.168.1.1",
        "geo_country": "US",
        "timestamp": datetime.now()
    }
    
    features = engineer.build_features(transaction)
    
    assert features.shape[0] > 0
    assert not np.isnan(features).any()
    assert not np.isinf(features).any()


def test_scaler_fit_transform():
    """Test scaler fitting and transformation."""
    engineer = FeatureEngineer()
    
    # Generate dummy feature matrix
    feature_matrix = np.random.randn(100, 18).astype(np.float32)
    
    # Fit scaler
    engineer.fit_scaler(feature_matrix)
    
    # Transform
    transformed = engineer.transform(feature_matrix[0])
    
    assert transformed.shape[0] == feature_matrix.shape[1]
    assert not np.isnan(transformed).any()


def test_feature_contributions():
    """Test feature contribution calculation."""
    engineer = FeatureEngineer()
    engineer.feature_names = [f"feature_{i}" for i in range(18)]
    
    feature_vector = np.random.randn(18).astype(np.float32)
    reconstruction_error = 0.5
    
    contributions = engineer.get_feature_contributions(feature_vector, reconstruction_error)
    
    assert len(contributions) == 18
    assert all(isinstance(v, float) for v in contributions.values())
    assert abs(sum(contributions.values()) - reconstruction_error) < 1e-6

