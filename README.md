# Daily Task List

A simple, clean, and functional full-stack web application designed to manage daily tasks.

## Features
- **User Authentication**: Simple registration and login.
- **Task Management**: Add, delete, and mark tasks as complete.
- **Clean UI**: Minimalist design with a focus on usability.

## Tech Stack
- **Frontend**: React.js (Vite)
- **Backend**: Python Flask
- **Database**: MongoDB
- **API**: Axios

## Prerequisites
- **Node.js**: Install from [nodejs.org](https://nodejs.org/)
- **Python**: Install from [python.org](https://www.python.org/)
- **MongoDB**: Ensure MongoDB is running locally on default port `27017` or update `MONGO_URI` in `backend/app.py`.

## Setup & Run

### 1. Backend Setup
Open a terminal in the project root:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The backend server will start on `http://localhost:5000`.

### 2. Frontend Setup
Open a **new** terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start (usually on `http://localhost:5173`).

## Usage
1. Open your browser and navigate to the frontend URL.
2. Register a new account.
3. Loign with your credentials.
4. Add tasks to your list, mark them complete, or delete them.
"# taskmanager" 
