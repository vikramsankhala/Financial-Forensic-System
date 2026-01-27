"""Demo data endpoints."""
from fastapi import APIRouter, Depends

from app.auth import get_current_user, User
from app.demo_data import get_demo_payload

router = APIRouter(prefix="/demo-data", tags=["demo-data"])


@router.get("")
def demo_data(current_user: User = Depends(get_current_user)):
    """Return demo data and source notes."""
    return get_demo_payload()
