"""Metrics API endpoint."""
from fastapi import APIRouter, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from app.agents import MonitoringAgent

router = APIRouter(prefix="/metrics", tags=["metrics"])

# Prometheus metrics
request_count = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

request_latency = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"]
)

model_inference_latency = Histogram(
    "model_inference_duration_seconds",
    "Model inference latency"
)

model_inference_errors = Counter(
    "model_inference_errors_total",
    "Total model inference errors"
)


@router.get("")
async def get_metrics():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

