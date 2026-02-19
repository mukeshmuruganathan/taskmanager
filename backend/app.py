from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# simple db setup (local)
DB_URL = os.getenv('MONGO_URI', "mongodb://localhost:27017/daily_task_list")
client = MongoClient(DB_URL)
db = client.daily_task_list
users = db.users
tasks = db.tasks

# tiny helper to convert ObjectId -> string
def _fix_id(d):
    if not d:
        return None
    d['_id'] = str(d['_id'])
    return d


@app.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    uname = data.get('username')
    pwd = data.get('password')

    if not uname or not pwd:
        return jsonify({"error": "Username and password are required"}), 400

    if users.find_one({"username": uname}):
        return jsonify({"error": "Username already exists"}), 409

    h = generate_password_hash(pwd)
    new_id = users.insert_one({"username": uname, "password": h}).inserted_id
    return jsonify({"message": "User registered successfully", "user_id": str(new_id)}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    uname = data.get('username')
    pwd = data.get('password')

    user = users.find_one({"username": uname})
    if user and check_password_hash(user.get('password', ''), pwd):
        return jsonify({"message": "Login successful", "user_id": str(user['_id']), "username": user['username']}), 200

    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/tasks', methods=['GET'])
def get_tasks():
    uid = request.args.get('user_id')
    if not uid:
        return jsonify({"error": "User ID is required"}), 400

    all_tasks = list(tasks.find({"user_id": uid}))
    # convert ids
    out = []
    for t in all_tasks:
        out.append(_fix_id(t))
    return jsonify(out), 200


@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json or {}
    title = data.get('title')
    uid = data.get('user_id')
    priority = data.get('priority', 'Medium')
    due = data.get('due_date')

    if not title or not uid:
        return jsonify({"error": "Title and User ID are required"}), 400

    tid = tasks.insert_one({
        "title": title,
        "completed": False,
        "user_id": uid,
        "priority": priority,
        "due_date": due
    }).inserted_id

    return jsonify({"message": "Task added", "task_id": str(tid), "title": title, "completed": False, "priority": priority, "due_date": due}), 201


@app.route('/tasks/<id>', methods=['PUT'])
def update_task(id):
    data = request.json or {}
    if 'completed' not in data:
        return jsonify({"error": "Missing 'completed' field"}), 400

    res = tasks.update_one({"_id": ObjectId(id)}, {"$set": {"completed": data['completed']}})
    if res.matched_count == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task updated"}), 200


@app.route('/tasks/<id>', methods=['DELETE'])
def delete_task(id):
    res = tasks.delete_one({"_id": ObjectId(id)})
    if res.deleted_count == 0:
        return jsonify({"error": "Task not found"}), 404
    return jsonify({"message": "Task deleted"}), 200


if __name__ == '__main__':
    # run for development
    app.run(debug=True, host='0.0.0.0', port=5000)
