"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import transactions, cases, auth, entities, metrics
from app.database import engine, Base

# Create database tables (in production, use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fraud Detection Forensic Systems API",
    description="Production-grade real-time financial fraud detection and forensics platform",
    version="1.0.0"
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

