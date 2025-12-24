"""Fraud scoring engine."""
import numpy as np
from typing import Dict, Any, Optional, Tuple
from app.autoencoder import Autoencoder
from app.features import FeatureEngineer
from app.models import RiskLevel
import pickle
import os


class FraudScoringEngine:
    """Fraud scoring engine combining autoencoder and optional classifier."""
    
    def __init__(self, autoencoder: Autoencoder, feature_engineer: FeatureEngineer,
                 threshold_percentile: float = 95.0,
                 classifier: Optional[Any] = None):
        """Initialize scoring engine.
        
        Args:
            autoencoder: Trained autoencoder model
            feature_engineer: Feature engineering pipeline
            threshold_percentile: Percentile threshold for anomaly detection
            classifier: Optional second-stage classifier
        """
        self.autoencoder = autoencoder
        self.feature_engineer = feature_engineer
        self.threshold_percentile = threshold_percentile
        self.classifier = classifier
        self.threshold_value: Optional[float] = None
    
    def set_threshold(self, threshold_value: float):
        """Set anomaly threshold value.
        
        Args:
            threshold_value: Threshold value for reconstruction error
        """
        self.threshold_value = threshold_value
    
    def compute_threshold_from_data(self, scores: np.ndarray):
        """Compute threshold from historical scores.
        
        Args:
            scores: Array of historical anomaly scores
        """
        self.threshold_value = float(np.percentile(scores, self.threshold_percentile))
    
    def score_transaction(self, transaction: Dict[str, Any],
                         historical_stats: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Score a transaction for fraud.
        
        Args:
            transaction: Transaction dictionary
            historical_stats: Optional historical statistics
        
        Returns:
            Dictionary with:
                - anomaly_score: float
                - reconstruction_error: float
                - classifier_score: Optional[float]
                - risk_level: RiskLevel
                - decision: str
                - feature_contributions: Dict[str, float]
        """
        # Build features
        feature_vector = self.feature_engineer.build_features(transaction, historical_stats)
        
        # Scale features
        scaled_features = self.feature_engineer.transform(feature_vector)
        
        # Get autoencoder prediction
        anomaly_score, reconstruction_error = self.autoencoder.predict_anomaly_score(
            scaled_features
        )
        
        # Get feature contributions
        feature_contributions = self.feature_engineer.get_feature_contributions(
            feature_vector, reconstruction_error
        )
        
        # Apply threshold
        is_anomaly = False
        if self.threshold_value is not None:
            is_anomaly = reconstruction_error > self.threshold_value
        
        # Optional classifier stage
        classifier_score = None
        if self.classifier is not None and is_anomaly:
            try:
                classifier_score = float(self.classifier.predict_proba(
                    scaled_features.reshape(1, -1)
                )[0][1])  # Probability of fraud class
            except Exception:
                pass
        
        # Determine risk level
        if self.threshold_value is None:
            # Use percentile-based approach
            if anomaly_score > 0.8:
                risk_level = RiskLevel.CRITICAL
            elif anomaly_score > 0.6:
                risk_level = RiskLevel.HIGH
            elif anomaly_score > 0.4:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
        else:
            # Threshold-based
            if reconstruction_error > self.threshold_value * 2.0:
                risk_level = RiskLevel.CRITICAL
            elif reconstruction_error > self.threshold_value * 1.5:
                risk_level = RiskLevel.HIGH
            elif reconstruction_error > self.threshold_value:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
        
        # Decision logic
        if risk_level in [RiskLevel.CRITICAL, RiskLevel.HIGH]:
            decision = "review"
        elif risk_level == RiskLevel.MEDIUM:
            decision = "monitor"
        else:
            decision = "approve"
        
        return {
            "anomaly_score": anomaly_score,
            "reconstruction_error": reconstruction_error,
            "classifier_score": classifier_score,
            "risk_level": risk_level,
            "decision": decision,
            "feature_contributions": feature_contributions,
            "is_anomaly": is_anomaly
        }

