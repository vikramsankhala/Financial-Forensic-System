"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.config import settings
from app.routers import transactions, cases, auth, entities, metrics
from app.routers import dashboard_metrics
from app.database import engine, Base
from app.cache import get_redis_client
from app.graph import get_graph_driver

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Initializing services...")
    
    # Initialize Redis connection
    redis_client = get_redis_client()
    if redis_client:
        logger.info("Redis cache enabled")
    else:
        logger.info("Redis cache disabled (not configured)")
    
    # Initialize Neo4j connection
    graph_driver = get_graph_driver()
    if graph_driver:
        logger.info("Neo4j graph database enabled")
    else:
        logger.info("Neo4j graph database disabled (not configured)")
    
    yield
    
    # Shutdown
    logger.info("Shutting down services...")
    if graph_driver:
        graph_driver.close()
        logger.info("Neo4j connection closed")


# Create database tables (in production, use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fraud Detection Forensic Systems API",
    description="Production-grade real-time financial fraud detection and forensics platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router, prefix=settings.api_prefix)
app.include_router(cases.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(entities.router, prefix=settings.api_prefix)
app.include_router(metrics.router)
app.include_router(dashboard_metrics.router, prefix=settings.api_prefix)


@app.get("/healthz")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/readyz")
async def readiness_check():
    """Readiness check endpoint."""
    # In production, check database connectivity
    return {"status": "ready"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Fraud Detection Forensic Systems API",
        "version": "1.0.0",
        "docs": "/docs"
    }

