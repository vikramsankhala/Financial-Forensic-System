"""Demo data feed utilities for live + static transaction ingestion."""
from __future__ import annotations

import argparse
import json
import logging
import random
import threading
import time
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import httpx

from app.database import SessionLocal
from app.models import (
    Transaction,
    Score,
    RiskLevel,
    Entity,
    EntityLink,
    Case,
    CaseTransaction,
    CaseStatus,
)
from app.services.entity_sync import sync_entity_to_graph, sync_entity_link_to_graph

logger = logging.getLogger(__name__)

COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets"
BINANCE_TICKER_URL = "https://api.binance.com/api/v3/ticker/24hr"
KRAKEN_TICKER_URL = "https://api.kraken.com/0/public/Ticker"

DEFAULT_ASSETS = [
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "ripple",
    "litecoin",
    "chainlink",
]

BINANCE_SYMBOLS = [
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
    "ADAUSDT",
    "XRPUSDT",
    "LTCUSDT",
    "LINKUSDT",
]

KRAKEN_PAIRS = [
    "XBTUSD",
    "ETHUSD",
    "SOLUSD",
    "ADAUSD",
    "XRPUSD",
    "LTCUSD",
    "LINKUSD",
]

MERCHANTS: List[Tuple[str, str, str]] = [
    ("m_001", "FinCloud Payments", "fintech"),
    ("m_002", "Northwind Retail", "retail"),
    ("m_003", "Skyline Travel", "travel"),
    ("m_004", "Metro Fuel", "fuel"),
    ("m_005", "BrightMart", "retail"),
    ("m_006", "HealthPlus Pharmacy", "healthcare"),
    ("m_007", "WaveMobile", "telecom"),
    ("m_008", "CityEats", "food"),
]

CHANNELS = ["online", "pos", "atm", "mobile"]

COUNTRIES = [
    ("US", ["New York", "San Francisco", "Austin", "Miami"]),
    ("GB", ["London", "Manchester", "Bristol"]),
    ("DE", ["Berlin", "Munich", "Hamburg"]),
    ("IN", ["Mumbai", "Bengaluru", "Delhi"]),
    ("SG", ["Singapore"]),
    ("AU", ["Sydney", "Melbourne", "Brisbane"]),
]


@dataclass
class FeedSettings:
    mode: str = "auto"
    assets: List[str] = None
    currency: str = "usd"
    live_source: str = "binance"
    batch_size: int = 25
    interval: int = 10
    seed: int = 42
    case_rate: float = 0.35
    create_cases: bool = True
    create_entities: bool = True

    def __post_init__(self):
        if self.assets is None:
            self.assets = default_assets_for_source(self.live_source)


def fetch_coingecko_assets(asset_ids: List[str], vs_currency: str = "usd") -> List[Dict[str, float]]:
    """Fetch live market data from CoinGecko."""
    params = {
        "vs_currency": vs_currency,
        "ids": ",".join(asset_ids),
        "price_change_percentage": "1h",
    }
    with httpx.Client(timeout=10.0) as client:
        response = client.get(COINGECKO_MARKETS_URL, params=params)
        response.raise_for_status()
        data = response.json()

    assets = []
    for item in data:
        assets.append(
            {
                "asset": item.get("id") or "unknown",
                "symbol": (item.get("symbol") or "na").upper(),
                "price": float(item.get("current_price") or 0.0),
                "change_pct": float(item.get("price_change_percentage_1h_in_currency") or 0.0),
                "change_window": "1h",
                "exchange": "coingecko",
            }
        )
    return assets


def fetch_binance_assets(symbols: List[str]) -> List[Dict[str, float]]:
    """Fetch live ticker data from Binance public API."""
    if not symbols:
        return []
    params = {"symbols": json.dumps(symbols)}
    with httpx.Client(timeout=10.0) as client:
        response = client.get(BINANCE_TICKER_URL, params=params)
        response.raise_for_status()
        data = response.json()

    assets = []
    for item in data:
        symbol = item.get("symbol") or "NA"
        base_symbol = symbol.replace("USDT", "")
        assets.append(
            {
                "asset": f"binance:{symbol}",
                "symbol": base_symbol,
                "price": float(item.get("lastPrice") or 0.0),
                "change_pct": float(item.get("priceChangePercent") or 0.0),
                "change_window": "24h",
                "exchange": "binance",
            }
        )
    return assets


def fetch_kraken_assets(pairs: List[str]) -> List[Dict[str, float]]:
    """Fetch live ticker data from Kraken public API."""
    if not pairs:
        return []
    params = {"pair": ",".join(pairs)}
    with httpx.Client(timeout=10.0) as client:
        response = client.get(KRAKEN_TICKER_URL, params=params)
        response.raise_for_status()
        payload = response.json()
    data = payload.get("result", {}) if isinstance(payload, dict) else {}

    assets = []
    for pair, values in data.items():
        symbol = pair.replace("USD", "").replace("XBT", "BTC")
        last_trade = values.get("c", ["0"])[0]
        change_pct = values.get("p", [0, 0])[1]
        assets.append(
            {
                "asset": f"kraken:{pair}",
                "symbol": symbol,
                "price": float(last_trade or 0.0),
                "change_pct": float(change_pct or 0.0),
                "change_window": "24h",
                "exchange": "kraken",
            }
        )
    return assets


def default_assets_for_source(source: str) -> List[str]:
    if source == "binance":
        return BINANCE_SYMBOLS.copy()
    if source == "kraken":
        return KRAKEN_PAIRS.copy()
    return DEFAULT_ASSETS.copy()


def fetch_live_assets(settings: FeedSettings) -> List[Dict[str, float]]:
    if settings.live_source == "binance":
        return fetch_binance_assets(settings.assets)
    if settings.live_source == "kraken":
        return fetch_kraken_assets(settings.assets)
    if settings.live_source == "coingecko":
        return fetch_coingecko_assets(settings.assets, settings.currency)
    if settings.live_source == "multi":
        try:
            assets = fetch_binance_assets(settings.assets or BINANCE_SYMBOLS)
            if assets:
                return assets
        except Exception:
            pass
        try:
            assets = fetch_kraken_assets(settings.assets or KRAKEN_PAIRS)
            if assets:
                return assets
        except Exception:
            pass
        return fetch_coingecko_assets(settings.assets or DEFAULT_ASSETS, settings.currency)
    return fetch_coingecko_assets(settings.assets, settings.currency)


def random_ip(rng: random.Random) -> str:
    """Generate a random IPv4 address."""
    return ".".join(str(rng.randint(1, 254)) for _ in range(4))


def build_transaction_payload(
    rng: random.Random,
    amount: float,
    currency: str,
    merchant: Optional[tuple] = None,
    customer_id: Optional[str] = None,
    timestamp: Optional[datetime] = None,
    source_label: str = "DEMO",
    metadata: Optional[Dict[str, str]] = None,
) -> Dict[str, object]:
    """Create a transaction payload suitable for the DB model."""
    merchant_id, merchant_name, merchant_category = merchant or rng.choice(MERCHANTS)
    country, cities = rng.choice(COUNTRIES)

    return {
        "transaction_id": f"{source_label}-{uuid.uuid4().hex[:12]}",
        "amount": round(max(amount, 1.0), 2),
        "currency": currency,
        "merchant_id": merchant_id,
        "merchant_name": merchant_name,
        "merchant_category": merchant_category,
        "channel": rng.choice(CHANNELS),
        "customer_id": customer_id or f"cust_{rng.randint(1000, 9999)}",
        "account_id": f"acct_{rng.randint(100, 999)}",
        "device_id": f"dev_{rng.randint(100, 999)}",
        "ip_address": random_ip(rng),
        "geo_country": country,
        "geo_city": rng.choice(cities),
        "timestamp": timestamp or datetime.utcnow(),
        "metadata": metadata or {},
    }


def build_score(rng: random.Random, amount: float) -> Dict[str, object]:
    """Create a synthetic score payload."""
    base = min(amount / 5000.0, 1.0)
    anomaly_score = min(0.1 + base * 0.9 + rng.random() * 0.15, 1.0)
    reconstruction_error = anomaly_score + rng.random() * 0.05

    if amount > 5000 or anomaly_score > 0.85:
        risk_level = RiskLevel.CRITICAL
    elif amount > 2500 or anomaly_score > 0.7:
        risk_level = RiskLevel.HIGH
    elif amount > 900 or anomaly_score > 0.45:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW

    decision = "review" if risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL) else "monitor"
    if risk_level == RiskLevel.LOW:
        decision = "approve"

    feature_contributions = {
        "amount": round(anomaly_score * 0.45, 4),
        "geo_country": round(anomaly_score * 0.2, 4),
        "merchant_category": round(anomaly_score * 0.15, 4),
        "device_id": round(anomaly_score * 0.2, 4),
    }

    return {
        "anomaly_score": float(anomaly_score),
        "reconstruction_error": float(reconstruction_error),
        "classifier_score": None,
        "risk_level": risk_level,
        "decision": decision,
        "feature_contributions": feature_contributions,
    }


def ensure_entity(
    db,
    cache: Dict[str, Entity],
    entity_id: str,
    entity_type: str,
    name: Optional[str] = None,
    metadata: Optional[Dict[str, object]] = None,
) -> Entity:
    """Get or create an entity, with an in-memory cache."""
    cache_key = f"{entity_type}:{entity_id}"
    if cache_key in cache:
        return cache[cache_key]

    entity = db.query(Entity).filter(
        Entity.entity_id == entity_id, Entity.entity_type == entity_type
    ).first()
    if not entity:
        entity = Entity(
            entity_id=entity_id,
            entity_type=entity_type,
            name=name or entity_id,
            entity_metadata=metadata or {},
        )
        db.add(entity)
        db.flush()
        sync_entity_to_graph(entity)

    cache[cache_key] = entity
    return entity


def ensure_link(
    db,
    cache: Dict[str, EntityLink],
    from_entity: Entity,
    to_entity: Entity,
    relationship_type: str,
    metadata: Optional[Dict[str, object]] = None,
) -> None:
    """Get or create an entity link, with an in-memory cache."""
    cache_key = f"{from_entity.id}:{to_entity.id}:{relationship_type}"
    if cache_key in cache:
        return

    link = db.query(EntityLink).filter(
        EntityLink.from_entity_id == from_entity.id,
        EntityLink.to_entity_id == to_entity.id,
        EntityLink.relationship_type == relationship_type,
    ).first()
    if not link:
        link = EntityLink(
            from_entity_id=from_entity.id,
            to_entity_id=to_entity.id,
            relationship_type=relationship_type,
            link_metadata=metadata or {},
        )
        db.add(link)
        db.flush()
        sync_entity_link_to_graph(link, db)

    cache[cache_key] = link


def create_case_for_transaction(
    db,
    transaction: Transaction,
    score: Score,
    case_rate: float,
    rng: random.Random,
) -> Optional[Case]:
    """Optionally create a case for a high-risk transaction."""
    if score.risk_level not in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        return None
    if rng.random() > case_rate:
        return None

    case = Case(
        case_id=f"CASE-{uuid.uuid4().hex[:10]}",
        title=f"Review Transaction {transaction.transaction_id}",
        description="Auto-generated demo case from streaming feed.",
        status=CaseStatus.TRIAGE,
        priority="high" if score.risk_level == RiskLevel.HIGH else "critical",
    )
    db.add(case)
    db.flush()

    db.add(
        CaseTransaction(
            case_id=case.id,
            transaction_id=transaction.id,
        )
    )
    return case


def insert_transactions(
    payloads: List[Dict[str, object]],
    create_entities: bool,
    create_cases: bool,
    case_rate: float,
    rng: random.Random,
) -> int:
    """Insert transactions and associated scores into the database."""
    db = SessionLocal()
    created = 0
    entity_cache: Dict[str, Entity] = {}
    link_cache: Dict[str, EntityLink] = {}

    try:
        for payload in payloads:
            metadata = payload.pop("metadata", {})
            transaction = Transaction(**payload)
            db.add(transaction)
            db.flush()

            score_payload = build_score(rng, transaction.amount)
            score = Score(
                transaction_id=transaction.id,
                anomaly_score=score_payload["anomaly_score"],
                reconstruction_error=score_payload["reconstruction_error"],
                classifier_score=score_payload["classifier_score"],
                risk_level=score_payload["risk_level"],
                decision=score_payload["decision"],
                feature_contributions=score_payload["feature_contributions"],
            )
            db.add(score)

            if create_cases:
                create_case_for_transaction(db, transaction, score, case_rate, rng)

            if create_entities:
                customer = ensure_entity(
                    db, entity_cache, transaction.customer_id, "customer", transaction.customer_id
                )
                merchant = ensure_entity(
                    db, entity_cache, transaction.merchant_id, "merchant", transaction.merchant_name
                )
                device = ensure_entity(
                    db, entity_cache, transaction.device_id, "device", transaction.device_id
                )
                account = ensure_entity(
                    db, entity_cache, transaction.account_id, "account", transaction.account_id
                )
                ip_address = ensure_entity(
                    db, entity_cache, transaction.ip_address, "ip", transaction.ip_address
                )

                ensure_link(db, link_cache, customer, merchant, "transacted_with", metadata)
                ensure_link(db, link_cache, customer, device, "uses_device", metadata)
                ensure_link(db, link_cache, customer, account, "owns_account", metadata)
                ensure_link(db, link_cache, account, device, "linked_device", metadata)
                ensure_link(db, link_cache, customer, ip_address, "logged_in_from", metadata)

            created += 1

        db.commit()
        logger.info("Inserted %s transactions", created)
    except Exception as exc:
        db.rollback()
        logger.error("Failed inserting transactions: %s", exc)
    finally:
        db.close()

    return created


def build_live_payloads(
    rng: random.Random,
    assets: List[Dict[str, float]],
    batch_size: int,
) -> List[Dict[str, object]]:
    """Build payloads from live asset data."""
    if not assets:
        return []

    picks = rng.choices(assets, k=batch_size)
    payloads = []
    for asset in picks:
        merchant = rng.choice(MERCHANTS)
        amount = max(asset["price"] * rng.uniform(0.1, 2.5), 5.0)
        change_pct = asset.get("change_pct", 0.0)
        change_window = asset.get("change_window", "1h")
        payloads.append(
            build_transaction_payload(
                rng=rng,
                amount=amount,
                currency="USD",
                merchant=merchant,
                customer_id=f"cust_{rng.randint(1000, 9999)}",
                source_label=f"LIVE-{asset['symbol']}",
                metadata={
                    "asset": asset["asset"],
                    "asset_symbol": asset["symbol"],
                    "exchange": asset.get("exchange", "unknown"),
                    "price_change_pct": f"{change_pct:.2f}",
                    "price_change_window": change_window,
                },
            )
        )
    return payloads


def build_static_payloads(rng: random.Random, batch_size: int) -> List[Dict[str, object]]:
    """Build payloads from static synthetic data."""
    payloads = []
    for _ in range(batch_size):
        base_amount = rng.uniform(5.0, 6000.0)
        payloads.append(
            build_transaction_payload(
                rng=rng,
                amount=base_amount,
                currency=rng.choice(["USD", "EUR", "GBP"]),
                source_label="STATIC",
            )
        )
    return payloads


def run_feed_loop(settings: FeedSettings, stop_event: Optional[threading.Event] = None) -> None:
    """Run the data feed loop."""
    rng = random.Random(settings.seed)
    stop_event = stop_event or threading.Event()

    while not stop_event.is_set():
        payloads: List[Dict[str, object]] = []
        used_live = False

        if settings.mode in {"auto", "stream"}:
            try:
                assets = fetch_live_assets(settings)
                payloads = build_live_payloads(rng, assets, settings.batch_size)
                used_live = True
            except Exception as exc:
                logger.warning("Live feed unavailable (%s). Using static fallback.", exc)

        if not payloads:
            payloads = build_static_payloads(rng, settings.batch_size)

        inserted = insert_transactions(
            payloads,
            create_entities=settings.create_entities,
            create_cases=settings.create_cases,
            case_rate=settings.case_rate,
            rng=rng,
        )

        source = "live" if used_live else "static"
        logger.info("Batch complete: %s transactions (%s)", inserted, source)

        stop_event.wait(settings.interval)


_feed_lock = threading.Lock()
_feed_thread: Optional[threading.Thread] = None
_feed_stop_event = threading.Event()
_feed_status: Dict[str, object] = {
    "running": False,
    "settings": {},
    "last_started_at": None,
    "last_stopped_at": None,
    "last_error": None,
}


def start_feed(settings: FeedSettings) -> Dict[str, object]:
    """Start the background feed thread."""
    global _feed_thread
    with _feed_lock:
        if _feed_thread and _feed_thread.is_alive():
            _feed_status["running"] = True
            return _feed_status.copy()

        _feed_stop_event.clear()

        def _runner():
            try:
                run_feed_loop(settings, _feed_stop_event)
            except Exception as exc:  # pragma: no cover - safety net
                _feed_status["last_error"] = str(exc)
            finally:
                _feed_status["running"] = False
                _feed_status["last_stopped_at"] = datetime.utcnow().isoformat()

        _feed_thread = threading.Thread(target=_runner, daemon=True)
        _feed_thread.start()

        _feed_status["running"] = True
        _feed_status["settings"] = json.loads(json.dumps(settings.__dict__))
        _feed_status["last_started_at"] = datetime.utcnow().isoformat()
        _feed_status["last_error"] = None
        return _feed_status.copy()


def stop_feed() -> Dict[str, object]:
    """Stop the background feed thread."""
    with _feed_lock:
        _feed_stop_event.set()
        _feed_status["running"] = False
        _feed_status["last_stopped_at"] = datetime.utcnow().isoformat()
        return _feed_status.copy()


def get_feed_status() -> Dict[str, object]:
    """Return current feed status."""
    with _feed_lock:
        running = _feed_thread is not None and _feed_thread.is_alive()
        _feed_status["running"] = running
        return _feed_status.copy()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Demo data feed (live + static fallback).")
    parser.add_argument(
        "--mode",
        choices=["auto", "stream", "static"],
        default="auto",
        help="Feed mode: auto tries live then falls back; static forces static.",
    )
    parser.add_argument(
        "--live-source",
        choices=["binance", "kraken", "coingecko", "multi"],
        default="binance",
        help="Live market source for streaming demo data.",
    )
    parser.add_argument(
        "--assets",
        nargs="+",
        default=None,
        help="Asset symbols/pairs for selected live source (e.g. BTCUSDT, XBTUSD).",
    )
    parser.add_argument("--currency", default="usd", help="Quote currency for live feed.")
    parser.add_argument("--batch-size", type=int, default=25, help="Transactions per batch.")
    parser.add_argument("--interval", type=int, default=10, help="Seconds between batches.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    parser.add_argument("--case-rate", type=float, default=0.35, help="Rate to open demo cases.")
    parser.add_argument("--no-cases", action="store_true", help="Disable case creation.")
    parser.add_argument("--no-entities", action="store_true", help="Disable entity/link creation.")
    return parser
