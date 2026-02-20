from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, errors
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

# 4. CORS configuration
# Allow multiple origins separated by comma
frontend_origins = os.getenv('FRONTEND_ORIGINS', 'https://taskmanager-lilac-ten.vercel.app').split(',')
CORS(app, resources={r"/*": {"origins": frontend_origins}})

# 1 & 2. MongoDB URI strict check
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    logger.error("MONGO_URI environment variable is missing!")
    # In production, we should probably exit or handle this gracefully
    # For now, we'll let it fail later or set a dummy to avoid crash during import
    MONGO_URI = "mongodb://localhost:27017/placeholder_if_missing"

try:
    # serverSelectionTimeoutMS=5000 means it will fail after 5s if can't connect
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    
    # Try to get default db, fallback to 'daily_task_list' if not specified in URI
    try:
        db = client.get_default_database()
        if db is None:
            db = client.daily_task_list
    except:
        db = client.daily_task_list
        
    logger.info(f"Successfully connected to MongoDB Atlas. Using database: {db.name}")
except errors.ServerSelectionTimeoutError as err:
    logger.error(f"Could not connect to MongoDB: {err}")
    db = None
except Exception as e:
    logger.error(f"An unexpected error occurred while connecting to MongoDB: {e}")
    db = None

# Fallback collection access (will fail at runtime if db is None, but won't crash Gunicorn on start)
users = db.users if db is not None else None
tasks = db.tasks if db is not None else None

def _fix_id(d):
    if not d:
        return None
    d['_id'] = str(d['_id'])
    return d

# 7. Add a root "/" route
@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "message": "Task Manager API is running",
        "version": "1.0.0"
    }), 200

# 6. Safe validation for /register and /login
@app.route('/register', methods=['POST'])
def register():
    if db is None:
        return jsonify({"error": "Database connection unavailable"}), 503
    
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON mapping"}), 400
        
    uname = data.get('username')
    pwd = data.get('password')

    if not uname or not pwd:
        return jsonify({"error": "Username and password are required"}), 400

    try:
        if users.find_one({"username": uname}):
            return jsonify({"error": "Username already exists"}), 409

        h = generate_password_hash(pwd)
        new_id = users.insert_one({"username": uname, "password": h}).inserted_id
        return jsonify({"message": "User registered successfully", "user_id": str(new_id)}), 201
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/login', methods=['POST'])
def login():
    if db is None:
        return jsonify({"error": "Database connection unavailable"}), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON mapping"}), 400
        
    uname = data.get('username')
    pwd = data.get('password')

    if not uname or not pwd:
        return jsonify({"error": "Username and password are required"}), 400

    try:
        user = users.find_one({"username": uname})
        if user and check_password_hash(user.get('password', ''), pwd):
            return jsonify({
                "message": "Login successful", 
                "user_id": str(user['_id']), 
                "username": user['username']
            }), 200

        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/tasks', methods=['GET'])
def get_tasks():
    if db is None:
        return jsonify({"error": "Database connection unavailable"}), 503
        
    uid = request.args.get('user_id')
    if not uid:
        return jsonify({"error": "User ID is required"}), 400

    try:
        all_tasks = list(tasks.find({"user_id": uid}))
        out = [_fix_id(t) for t in all_tasks]
        return jsonify(out), 200
    except Exception as e:
        logger.error(f"Get tasks error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/tasks', methods=['POST'])
def add_task():
    if db is None:
        return jsonify({"error": "Database connection unavailable"}), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
        
    title = data.get('title')
    uid = data.get('user_id')
    priority = data.get('priority', 'Medium')
    due = data.get('due_date')

    if not title or not uid:
        return jsonify({"error": "Title and User ID are required"}), 400

    try:
        tid = tasks.insert_one({
            "title": title,
            "completed": False,
            "user_id": uid,
            "priority": priority,
            "due_date": due
        }).inserted_id

        return jsonify({
            "message": "Task added", 
            "task_id": str(tid), 
            "title": title, 
            "completed": False, 
            "priority": priority, 
            "due_date": due
        }), 201
    except Exception as e:
        logger.error(f"Add task error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/tasks/<id>', methods=['PUT'])
def update_task(id):
    if db is None:
        return jsonify({"error": "Database connection unavailable"}), 503

    data = request.get_json(silent=True)
    if not data or 'completed' not in data:
        return jsonify({"error": "Missing 'completed' field"}), 400

    try:
        res = tasks.update_one({"_id": ObjectId(id)}, {"$set": {"completed": data['completed']}})
        if res.matched_count == 0:
            return jsonify({"error": "Task not found"}), 404
        return jsonify({"message": "Task updated"}), 200
    except Exception as e:
        logger.error(f"Update task error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/tasks/<id>', methods=['DELETE'])
def delete_task(id):
    if db is None:
        return jsonify({"error": "Database connection unavailable"}), 503

    try:
        res = tasks.delete_one({"_id": ObjectId(id)})
        if res.deleted_count == 0:
            return jsonify({"error": "Task not found"}), 404
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        logger.error(f"Delete task error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    # For local development
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
