"""Script to seed database with initial data."""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import User, UserRole
from app.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)


def seed_users():
    """Seed initial users."""
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Users already exist, skipping seed.")
            return
        
        users = [
            User(
                username="admin",
                email="admin@frauddetection.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                role=UserRole.ADMIN,
                is_active=True
            ),
            User(
                username="investigator",
                email="investigator@frauddetection.com",
                hashed_password=get_password_hash("investigator123"),
                full_name="Investigator User",
                role=UserRole.INVESTIGATOR,
                is_active=True
            ),
            User(
                username="analyst",
                email="analyst@frauddetection.com",
                hashed_password=get_password_hash("analyst123"),
                full_name="Analyst User",
                role=UserRole.ANALYST,
                is_active=True
            ),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print(f"Seeded {len(users)} users.")
    except Exception as e:
        print(f"Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database...")
    seed_users()
    print("Done!")

