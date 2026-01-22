"""Script to train the autoencoder model on synthetic data."""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.autoencoder import Autoencoder, train_autoencoder
from app.features import FeatureEngineer
from app.scoring import FraudScoringEngine
from app.config import settings


def generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    """Generate synthetic transaction data for training.
    
    Args:
        n_samples: Number of samples to generate
    
    Returns:
        DataFrame with synthetic transactions
    """
    np.random.seed(42)
    
    transactions = []
    base_time = datetime.now() - timedelta(days=30)
    
    for i in range(n_samples):
        tx_time = base_time + timedelta(
            hours=np.random.randint(0, 24 * 30),
            minutes=np.random.randint(0, 60)
        )
        
        # Generate normal transaction
        amount = np.random.lognormal(mean=4.0, sigma=1.5)
        if np.random.random() < 0.05:  # 5% anomalies
            amount *= np.random.uniform(5, 20)  # Unusually large amounts
        
        transaction = {
            "transaction_id": f"TX{i:08d}",
            "amount": float(amount),
            "currency": np.random.choice(["USD", "EUR", "GBP"], p=[0.7, 0.2, 0.1]),
            "merchant_id": f"M{np.random.randint(1, 100)}",
            "merchant_name": f"Merchant {np.random.randint(1, 100)}",
            "merchant_category": np.random.choice(
                ["retail", "restaurant", "gas", "online", "grocery"],
                p=[0.3, 0.2, 0.15, 0.2, 0.15]
            ),
            "channel": np.random.choice(["online", "pos", "atm", "mobile"], p=[0.4, 0.4, 0.1, 0.1]),
            "customer_id": f"C{np.random.randint(1, 500)}",
            "account_id": f"A{np.random.randint(1, 1000)}",
            "device_id": f"D{np.random.randint(1, 200)}",
            "ip_address": f"{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}",
            "geo_country": np.random.choice(["US", "GB", "FR", "DE"], p=[0.6, 0.2, 0.1, 0.1]),
            "geo_city": f"City{np.random.randint(1, 50)}",
            "timestamp": tx_time.isoformat()
        }
        transactions.append(transaction)
    
    return pd.DataFrame(transactions)


def main():
    """Main training function."""
    print("Generating synthetic training data...")
    df = generate_synthetic_data(n_samples=10000)
    
    print("Building features...")
    feature_engineer = FeatureEngineer()
    
    # Build feature matrix
    feature_matrix = []
    for _, row in df.iterrows():
        features = feature_engineer.build_features(row.to_dict())
        feature_matrix.append(features)
    
    feature_matrix = np.array(feature_matrix)
    print(f"Feature matrix shape: {feature_matrix.shape}")
    
    # Fit scaler
    print("Fitting feature scaler...")
    feature_engineer.fit_scaler(feature_matrix)
    
    # Transform features
    scaled_features = feature_engineer.transform(feature_matrix)
    
    # Create and train autoencoder
    print("Training autoencoder...")
    input_dim = scaled_features.shape[1]
    autoencoder = Autoencoder(input_dim=input_dim, latent_dim=max(input_dim // 3, 8))
    
    losses = train_autoencoder(
        autoencoder,
        scaled_features,
        epochs=50,
        batch_size=32,
        learning_rate=0.001
    )
    
    print(f"Final training loss: {losses[-1]:.6f}")
    
    # Save models
    print("Saving models...")
    os.makedirs("models", exist_ok=True)
    
    autoencoder.save(settings.autoencoder_model_path)
    feature_engineer.save_scaler(settings.feature_scaler_path)
    
    # Compute threshold
    print("Computing threshold...")
    scoring_engine = FraudScoringEngine(
        autoencoder=autoencoder,
        feature_engineer=feature_engineer,
        threshold_percentile=settings.anomaly_threshold_percentile
    )
    
    # Compute scores for all training data
    scores = []
    for i in range(len(scaled_features)):
        score, error = autoencoder.predict_anomaly_score(scaled_features[i])
        scores.append(error)
    
    scores = np.array(scores)
    scoring_engine.compute_threshold_from_data(scores)
    
    print(f"Anomaly threshold (percentile {settings.anomaly_threshold_percentile}): {scoring_engine.threshold_value:.6f}")
    print("Training complete!")


if __name__ == "__main__":
    main()

