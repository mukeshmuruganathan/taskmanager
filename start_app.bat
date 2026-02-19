@echo off
echo ==========================================
echo       Daily Task List - Launcher
echo ==========================================

echo [1/4] Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo [2/4] Starting Backend Server...
:: Opens a new window for Backend
start "Backend Server (Flask)" cmd /k "cd backend && echo Installing Python dependencies... && pip install -r requirements.txt && echo Starting Flask App... && python app.py"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 >nul

echo [3/4] Starting Frontend Server...
:: Opens a new window for Frontend
start "Frontend Server (Vite)" cmd /k "cd frontend && if not exist node_modules (echo Installing Node dependencies... && npm install) else (echo node_modules found, skipping install.) && echo Starting Vite Dev Server... && npm run dev"

echo [4/4] Opening Application in Browser...
timeout /t 3 >nul
start http://localhost:5173

echo ==========================================
echo           Application Started!
echo ==========================================
echo Please check the two new windows for any errors.
echo If the browser shows 'Refused to connect', wait a few moments and reload.
pause
