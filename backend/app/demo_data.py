"""Demo data loader and adapters for API responses."""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

from app.models import CaseStatus

logger = logging.getLogger(__name__)

DEMO_DATA_PATH = Path(__file__).resolve().parents[2] / "docs" / "DEMO_DATA.json"


def _parse_datetime(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime.now(tz=timezone.utc)


def _slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip()).strip("_").lower()
    return cleaned or "unknown"


@lru_cache(maxsize=1)
def load_demo_data() -> Dict[str, Any]:
    if not DEMO_DATA_PATH.exists():
        logger.warning("Demo data file not found: %s", DEMO_DATA_PATH)
        return {"datasets": {"cases": [], "alerts": [], "transactions": []}}
    with DEMO_DATA_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def get_demo_cases() -> List[Dict[str, Any]]:
    data = load_demo_data().get("datasets", {}).get("cases", [])
    cases: List[Dict[str, Any]] = []
    status_map = {
        "open": CaseStatus.OPEN,
        "in_review": CaseStatus.INVESTIGATION,
        "investigation": CaseStatus.INVESTIGATION,
        "closed": CaseStatus.CLOSED,
    }
    for index, record in enumerate(data, start=1):
        created_at = _parse_datetime(record.get("created_at", ""))
        updated_at = _parse_datetime(record.get("updated_at", "")) if record.get("updated_at") else created_at
        cases.append(
            {
                "id": index,
                "case_id": record.get("id"),
                "title": record.get("title"),
                "description": record.get("summary"),
                "status": status_map.get(record.get("status", "open"), CaseStatus.OPEN),
                "priority": record.get("priority", "medium"),
                "owner_id": None,
                "tags": None,
                "created_at": created_at,
                "updated_at": updated_at,
                "closed_at": None,
            }
        )
    return cases


def get_demo_transactions() -> List[Dict[str, Any]]:
    data = load_demo_data().get("datasets", {}).get("transactions", [])
    transactions: List[Dict[str, Any]] = []
    for index, record in enumerate(data, start=1):
        member = record.get("member") or "Unknown"
        merchant_name = record.get("merchant")
        merchant_slug = _slugify(merchant_name or "merchant")
        created_at = _parse_datetime(record.get("created_at", ""))
        transactions.append(
            {
                "id": index,
                "transaction_id": record.get("id"),
                "amount": record.get("amount", 0),
                "currency": "USD",
                "merchant_id": f"demo_{merchant_slug}" if merchant_name else None,
                "merchant_name": merchant_name,
                "merchant_category": None,
                "channel": (record.get("channel") or "").lower() or None,
                "customer_id": f"demo_{_slugify(member)}",
                "account_id": f"acct_{_slugify(member)}",
                "device_id": None,
                "ip_address": None,
                "geo_country": None,
                "geo_city": None,
                "timestamp": created_at,
                "created_at": created_at,
            }
        )
    return transactions


def get_demo_payload() -> Dict[str, Any]:
    return load_demo_data()
