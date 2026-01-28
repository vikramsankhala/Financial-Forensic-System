"""Control service to start/stop backend container."""
from __future__ import annotations

import os
from typing import Optional, Dict, Any, List

import docker
from docker.errors import DockerException
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Control Service", version="1.0.0")

SERVICE_NAME = os.environ.get("CONTROL_SERVICE_NAME", "backend")
PROJECT_NAME = os.environ.get("CONTROL_PROJECT")


class ControlStatus(BaseModel):
    service: str
    container: Optional[str]
    running: bool
    status: Optional[str]


def _get_client():
    try:
        return docker.from_env()
    except DockerException as exc:  # pragma: no cover - startup failure
        raise HTTPException(status_code=500, detail=f"Docker client error: {exc}") from exc


def _find_service_containers(client) -> List[Any]:
    labels = [f"com.docker.compose.service={SERVICE_NAME}"]
    if PROJECT_NAME:
        labels.append(f"com.docker.compose.project={PROJECT_NAME}")

    return client.containers.list(all=True, filters={"label": labels})


def _pick_container(containers: List[Any]) -> Optional[Any]:
    if not containers:
        return None
    # Prefer running container if multiple exist
    for container in containers:
        container.reload()
        if container.status == "running":
            return container
    return containers[0]


@app.get("/healthz")
def health():
    return {"status": "ok"}


@app.get("/control/backend/status", response_model=ControlStatus)
def backend_status():
    client = _get_client()
    containers = _find_service_containers(client)
    container = _pick_container(containers)
    if not container:
        return ControlStatus(service=SERVICE_NAME, container=None, running=False, status=None)

    container.reload()
    return ControlStatus(
        service=SERVICE_NAME,
        container=container.name,
        running=container.status == "running",
        status=container.status,
    )


@app.post("/control/backend/start", response_model=ControlStatus)
def backend_start():
    client = _get_client()
    containers = _find_service_containers(client)
    container = _pick_container(containers)
    if not container:
        raise HTTPException(status_code=404, detail="Backend container not found")

    try:
        container.start()
        container.reload()
    except DockerException as exc:
        raise HTTPException(status_code=500, detail=f"Failed to start: {exc}") from exc

    return ControlStatus(
        service=SERVICE_NAME,
        container=container.name,
        running=container.status == "running",
        status=container.status,
    )


@app.post("/control/backend/stop", response_model=ControlStatus)
def backend_stop():
    client = _get_client()
    containers = _find_service_containers(client)
    container = _pick_container(containers)
    if not container:
        raise HTTPException(status_code=404, detail="Backend container not found")

    try:
        container.stop(timeout=30)
        container.reload()
    except DockerException as exc:
        raise HTTPException(status_code=500, detail=f"Failed to stop: {exc}") from exc

    return ControlStatus(
        service=SERVICE_NAME,
        container=container.name,
        running=container.status == "running",
        status=container.status,
    )
