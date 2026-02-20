import os
from pymongo import MongoClient, errors
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
print(f"Testing URI: {MONGO_URI}")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ismaster')
    print("SUCCESS: Connected to MongoDB!")
    db = client.get_default_database()
    print(f"Default DB: {db.name if db else 'None'}")
except errors.ServerSelectionTimeoutError as err:
    print(f"FAILED: Connection Timeout. This usually means the IP is not whitelisted on MongoDB Atlas. Error: {err}")
except Exception as e:
    print(f"FAILED: An unexpected error occurred: {e}")
