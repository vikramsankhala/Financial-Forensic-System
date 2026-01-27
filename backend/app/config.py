"""Application configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        env_ignore_empty=True,
    )
    
    # Database - explicitly map DATABASE_URL env var
    database_url: str = Field(..., validation_alias="DATABASE_URL")
    
    # Redis - optional, defaults to None if not provided
    redis_url: Optional[str] = Field(None, validation_alias="REDIS_URL")
    redis_enabled: bool = Field(True, validation_alias="REDIS_ENABLED")
    redis_cache_ttl: int = Field(3600, validation_alias="REDIS_CACHE_TTL")  # Default 1 hour
    
    # Neo4j - optional, defaults to None if not provided
    neo4j_uri: Optional[str] = Field(None, validation_alias="NEO4J_URI")
    neo4j_user: Optional[str] = Field(None, validation_alias="NEO4J_USER")
    neo4j_password: Optional[str] = Field(None, validation_alias="NEO4J_PASSWORD")
    neo4j_enabled: bool = Field(False, validation_alias="NEO4J_ENABLED")
    
    # JWT - explicitly map JWT_SECRET env var
    jwt_secret: str = Field(..., validation_alias="JWT_SECRET")
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

    # Demo data
    demo_data_enabled: bool = Field(True, validation_alias="DEMO_DATA_ENABLED")
    
    # OpenAI (optional)
    openai_api_key: Optional[str] = Field(None, validation_alias="OPENAI_API_KEY")


settings = Settings()

