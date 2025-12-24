#!/usr/bin/env python
"""Script to run database migrations."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from alembic.config import main
from alembic import command
from alembic.config import Config

if __name__ == "__main__":
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    print("Migrations completed successfully!")

