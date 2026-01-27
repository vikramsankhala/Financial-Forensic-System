"""Demo feed control endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth import User, UserRole, require_role
from app.demo_feed import (
    FeedSettings,
    start_feed,
    stop_feed,
    get_feed_status,
    DEFAULT_ASSETS,
    BINANCE_SYMBOLS,
    KRAKEN_PAIRS,
)

router = APIRouter(prefix="/demo-feed", tags=["demo-feed"])


class DemoFeedStartRequest(BaseModel):
    mode: str = Field("auto", pattern="^(auto|stream|static)$")
    live_source: str = Field("binance", pattern="^(binance|kraken|coingecko|multi)$")
    assets: Optional[List[str]] = None
    currency: str = "usd"
    batch_size: int = 25
    interval: int = 10
    seed: int = 42
    case_rate: float = 0.35
    create_cases: bool = True
    create_entities: bool = True


@router.get("/status")
def feed_status(current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.INVESTIGATOR))):
    """Get current demo feed status."""
    return get_feed_status()


@router.post("/start")
def feed_start(
    payload: DemoFeedStartRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.INVESTIGATOR)),
):
    """Start the demo feed in the background."""
    settings = FeedSettings(
        mode=payload.mode,
        live_source=payload.live_source,
        assets=payload.assets,
        currency=payload.currency,
        batch_size=payload.batch_size,
        interval=payload.interval,
        seed=payload.seed,
        case_rate=payload.case_rate,
        create_cases=payload.create_cases,
        create_entities=payload.create_entities,
    )
    return start_feed(settings)


@router.post("/stop")
def feed_stop(current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.INVESTIGATOR))):
    """Stop the demo feed."""
    return stop_feed()
