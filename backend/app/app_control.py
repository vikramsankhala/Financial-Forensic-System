"""Application start/stop control state."""
from __future__ import annotations

from datetime import datetime
from threading import Lock
from typing import Dict

_lock = Lock()
_state: Dict[str, object] = {
    "running": True,
    "last_started_at": None,
    "last_stopped_at": None,
}


def start_app() -> Dict[str, object]:
    """Mark app as running."""
    with _lock:
        _state["running"] = True
        _state["last_started_at"] = datetime.utcnow().isoformat()
        return _state.copy()


def stop_app() -> Dict[str, object]:
    """Mark app as stopped (requests will be rejected)."""
    with _lock:
        _state["running"] = False
        _state["last_stopped_at"] = datetime.utcnow().isoformat()
        return _state.copy()


def app_status() -> Dict[str, object]:
    """Return current app state."""
    with _lock:
        return _state.copy()
