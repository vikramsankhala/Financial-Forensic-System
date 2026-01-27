"""Populate demo transactions from live feed or static fallback."""
import logging
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.demo_feed import build_parser, FeedSettings, run_feed_loop


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    parser = build_parser()
    args = parser.parse_args()
    settings = FeedSettings(
        mode=args.mode,
        live_source=args.live_source,
        assets=args.assets,
        currency=args.currency,
        batch_size=args.batch_size,
        interval=args.interval,
        seed=args.seed,
        case_rate=args.case_rate,
        create_cases=not args.no_cases,
        create_entities=not args.no_entities,
    )
    run_feed_loop(settings)
