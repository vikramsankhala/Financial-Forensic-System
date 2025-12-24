"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Application
    environment: str = "development"
    log_level: str = "INFO"
    api_prefix: str = "/api"
    
    # Model Configuration
    autoencoder_model_path: str = "models/autoencoder.pth"
    feature_scaler_path: str = "models/feature_scaler.pkl"
    anomaly_threshold_percentile: float = 95.0
    classifier_model_path: Optional[str] = None
    
    # Monitoring
    metrics_enabled: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

