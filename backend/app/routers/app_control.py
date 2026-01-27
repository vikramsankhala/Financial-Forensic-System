"""App start/stop control endpoints."""
from fastapi import APIRouter, Depends

from app.auth import User, UserRole, require_role
from app.app_control import start_app, stop_app, app_status
from app.demo_feed import stop_feed

router = APIRouter(prefix="/app", tags=["app-control"])


@router.get("/status")
def get_status(current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.INVESTIGATOR))):
    """Get app running status."""
    return app_status()


@router.post("/start")
def start(current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.INVESTIGATOR))):
    """Start the application (enable API responses)."""
    return start_app()


@router.post("/stop")
def stop(current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.INVESTIGATOR))):
    """Stop the application (disable API responses)."""
    stop_feed()
    return stop_app()
