# backend/database/mongo.py
"""
MongoDB connection and collections.

Exports:
  - client
  - db
  - users, scans, feedbacks collections
  - ensure_indexes() helper (call at startup)
"""

import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ServerSelectionTimeoutError

# Environment variable name used in repo. If yours is different, change here.
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("DATABASE_URI") or None
DB_NAME = os.getenv("MONGO_DB_NAME") or os.getenv("DB_NAME") or "beingbulls"

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI environment variable not set. Set MONGO_URI before starting the backend."
    )

# Create client with sensible timeouts/connection pool
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
    maxPoolSize=50,
    minPoolSize=1,
)

# Test connection early (fail fast)
try:
    client.server_info()  # will raise if cannot connect
except ServerSelectionTimeoutError as e:
    # Don't crash on import in some dev scenarios; raise with helpful message
    raise RuntimeError(f"Cannot connect to MongoDB: {e}")

db = client[DB_NAME]

# Collections
users = db["users"]
scans = db["scans"]
feedbacks = db["feedbacks"]

def ensure_indexes():
    """
    Ensure commonly needed indexes exist.
    Call this once at backend startup (e.g., in main.py).
    """
    try:
        # users: unique email, subscription expiry for queries
        users.create_index([("email", ASCENDING)], unique=True, background=True)
        users.create_index([("isSubscribed", ASCENDING)], background=True)
        users.create_index([("subscription_expiry", DESCENDING)], background=True)

        # scans: fast lookup by user email + timestamp sort
        scans.create_index([("email", ASCENDING), ("timestamp", DESCENDING)], background=True)
        scans.create_index([("timestamp", DESCENDING)], background=True)

        # feedbacks: by user and timestamp
        feedbacks.create_index([("email", ASCENDING)], background=True)
        feedbacks.create_index([("timestamp", DESCENDING)], background=True)
    except Exception as e:
        print("[mongo] ensure_indexes warning:", e)


# Optional helper for tests or other modules
def get_db():
    return db


# If run as script, create indexes (helpful for local dev)
if __name__ == "__main__":
    print("Ensuring MongoDB indexes...")
    ensure_indexes()
    print("Done.")
