"""Feature engineering for transaction scoring."""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sklearn.preprocessing import StandardScaler
import pickle
import os


class FeatureEngineer:
    """Feature engineering pipeline for transactions."""
    
    def __init__(self, scaler_path: Optional[str] = None):
        """Initialize feature engineer.
        
        Args:
            scaler_path: Path to saved scaler (for inference). If None, creates new scaler.
        """
        self.scaler_path = scaler_path
        self.scaler = None
        self.feature_names = None
        
        if scaler_path and os.path.exists(scaler_path):
            self.load_scaler()
    
    def build_features(self, transaction: Dict[str, Any], 
                      historical_stats: Optional[Dict[str, Any]] = None) -> np.ndarray:
        """Build feature vector from transaction data.
        
        Args:
            transaction: Transaction dictionary with fields:
                - amount, currency, merchant_id, merchant_category, channel
                - customer_id, account_id, device_id, ip_address
                - geo_country, geo_city, timestamp
            historical_stats: Optional historical statistics for the customer/account
        
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Amount features
        amount = float(transaction.get("amount", 0))
        features.append(amount)
        features.append(np.log1p(amount))  # Log-transformed amount
        
        # Normalized amount (if historical stats available)
        if historical_stats:
            avg_amount = historical_stats.get("avg_amount", amount)
            std_amount = historical_stats.get("std_amount", 1.0)
            if std_amount > 0:
                features.append((amount - avg_amount) / std_amount)
            else:
                features.append(0.0)
        else:
            features.append(0.0)
        
        # Time features (cyclic encoding)
        timestamp = transaction.get("timestamp")
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        elif not isinstance(timestamp, datetime):
            timestamp = datetime.now()
        
        # Hour of day (0-23) -> sin/cos encoding
        hour = timestamp.hour
        features.append(np.sin(2 * np.pi * hour / 24))
        features.append(np.cos(2 * np.pi * hour / 24))
        
        # Day of week (0-6) -> sin/cos encoding
        day_of_week = timestamp.weekday()
        features.append(np.sin(2 * np.pi * day_of_week / 7))
        features.append(np.cos(2 * np.pi * day_of_week / 7))
        
        # Day of month (1-31) -> sin/cos encoding
        day_of_month = timestamp.day
        features.append(np.sin(2 * np.pi * day_of_month / 31))
        features.append(np.cos(2 * np.pi * day_of_month / 31))
        
        # Merchant category encoding (simple hash-based)
        merchant_category = str(transaction.get("merchant_category", "unknown"))
        category_hash = hash(merchant_category) % 100 / 100.0  # Normalize to [0, 1]
        features.append(category_hash)
        
        # Channel encoding
        channel = str(transaction.get("channel", "unknown")).lower()
        channel_map = {"online": 0.0, "pos": 0.33, "atm": 0.66, "mobile": 0.5, "unknown": 0.25}
        features.append(channel_map.get(channel, 0.25))
        
        # Geographic features (simple country encoding)
        geo_country = str(transaction.get("geo_country", "unknown"))
        country_hash = hash(geo_country) % 100 / 100.0
        features.append(country_hash)
        
        # IP address encoding (simple hash)
        ip_address = str(transaction.get("ip_address", "0.0.0.0"))
        ip_hash = hash(ip_address) % 1000 / 1000.0
        features.append(ip_hash)
        
        # Device ID encoding
        device_id = str(transaction.get("device_id", "unknown"))
        device_hash = hash(device_id) % 1000 / 1000.0
        features.append(device_hash)
        
        # Recency features (if historical stats available)
        if historical_stats:
            last_transaction_hours = historical_stats.get("last_transaction_hours", 24.0)
            features.append(np.log1p(last_transaction_hours))
            
            transaction_count_24h = historical_stats.get("transaction_count_24h", 0)
            features.append(transaction_count_24h)
            
            transaction_count_7d = historical_stats.get("transaction_count_7d", 0)
            features.append(np.log1p(transaction_count_7d))
        else:
            features.extend([np.log1p(24.0), 0.0, 0.0])
        
        # Currency encoding (simple)
        currency = str(transaction.get("currency", "USD")).upper()
        currency_map = {"USD": 0.0, "EUR": 0.2, "GBP": 0.4, "JPY": 0.6, "OTHER": 0.8}
        features.append(currency_map.get(currency, 0.8))
        
        feature_vector = np.array(features, dtype=np.float32)
        self.feature_names = [
            "amount", "log_amount", "normalized_amount",
            "hour_sin", "hour_cos", "dow_sin", "dow_cos", "dom_sin", "dom_cos",
            "merchant_category", "channel", "geo_country", "ip_address", "device_id",
            "last_transaction_hours", "tx_count_24h", "tx_count_7d", "currency"
        ]
        
        return feature_vector
    
    def fit_scaler(self, feature_matrix: np.ndarray):
        """Fit scaler on training data.
        
        Args:
            feature_matrix: 2D array of features (n_samples, n_features)
        """
        self.scaler = StandardScaler()
        self.scaler.fit(feature_matrix)
    
    def transform(self, feature_vector: np.ndarray) -> np.ndarray:
        """Transform features using fitted scaler.
        
        Args:
            feature_vector: Feature vector or matrix
        
        Returns:
            Scaled feature vector/matrix
        """
        if self.scaler is None:
            raise ValueError("Scaler not fitted. Call fit_scaler() first or load from file.")
        
        # Reshape if single vector
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)
        
        scaled = self.scaler.transform(feature_vector)
        
        # Return original shape
        if scaled.shape[0] == 1:
            return scaled[0]
        return scaled
    
    def save_scaler(self, path: str):
        """Save scaler to file.
        
        Args:
            path: Path to save scaler
        """
        if self.scaler is None:
            raise ValueError("No scaler to save. Fit scaler first.")
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({
                "scaler": self.scaler,
                "feature_names": self.feature_names
            }, f)
    
    def load_scaler(self):
        """Load scaler from file."""
        if not self.scaler_path or not os.path.exists(self.scaler_path):
            raise ValueError(f"Scaler file not found: {self.scaler_path}")
        
        with open(self.scaler_path, "rb") as f:
            data = pickle.load(f)
            self.scaler = data["scaler"]
            self.feature_names = data.get("feature_names")
    
    def get_feature_contributions(self, feature_vector: np.ndarray, 
                                  reconstruction_error: float) -> Dict[str, float]:
        """Compute feature contributions to reconstruction error.
        
        Simple attribution: each feature's contribution is proportional to its magnitude
        weighted by the reconstruction error.
        
        Args:
            feature_vector: Original feature vector
            reconstruction_error: Total reconstruction error
        
        Returns:
            Dictionary mapping feature names to contribution scores
        """
        if self.feature_names is None:
            self.feature_names = [f"feature_{i}" for i in range(len(feature_vector))]
        
        # Simple attribution: normalize feature magnitudes
        abs_features = np.abs(feature_vector)
        if abs_features.sum() > 0:
            contributions = (abs_features / abs_features.sum()) * reconstruction_error
        else:
            contributions = np.zeros_like(feature_vector)
        
        return {
            name: float(contrib)
            for name, contrib in zip(self.feature_names, contributions)
        }

