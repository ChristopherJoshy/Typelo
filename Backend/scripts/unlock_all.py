
import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.constants import CURSORS, EFFECTS, PROFILE_BACKGROUNDS, PROFILE_EFFECTS, PROFILE_BORDERS

# Load env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "evotaion")

TARGET_USER_UID = "xOAB2eOuwpcsSBgbLxOfGMEWF5f1"
EXPECTED_DISPLAY_NAME = "Christopher Joshy"

async def unlock_all():
    print(f"Connecting to MongoDB: {MONGODB_DATABASE}...")
    client = AsyncMongoClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    
    try:
        await client.admin.command('ping')
        print("Connected.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    account = await db.users.find_one(
        {"firebase_uid": TARGET_USER_UID}, {"display_name": 1, "_id": 0}
    )
    if not account or account.get("display_name") != EXPECTED_DISPLAY_NAME:
        print("The target account did not match the signed-in profile; no changes made.")
        await client.close()
        return

    # Prepare all items
    all_items = {
        "unlocked_cursors": list(CURSORS),
        "unlocked_effects": list(EFFECTS),
        "unlocked_backgrounds": list(PROFILE_BACKGROUNDS),
        "unlocked_profile_effects": list(PROFILE_EFFECTS),
        "unlocked_borders": list(PROFILE_BORDERS),
    }

    print(f"Adding the complete cosmetic catalog for the target account in {MONGODB_DATABASE}...")

    result = await db.users.update_one(
        {"firebase_uid": TARGET_USER_UID},
        {"$addToSet": {field: {"$each": item_ids} for field, item_ids in all_items.items()}},
    )
    
    if result.matched_count > 0:
        print("Success! The catalog is unlocked for the target account.")
        print("Existing inventory, coins, equipment, and match stats were preserved.")
        if result.modified_count == 0:
            print("The account already had every catalog item.")
    else:
        print("User not found!")
        
    await client.close()

if __name__ == "__main__":
    asyncio.run(unlock_all())
