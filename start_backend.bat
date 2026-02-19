@echo off
echo Starting Backend...
cd backend
if %errorlevel% neq 0 (
    echo Error: Could not change directory to 'backend'.
    pause
    exit /b
)

echo Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install python dependencies.
    pause
    exit /b
)

echo Running Flask App...
python app.py
if %errorlevel% neq 0 (
    echo Error: Flask app crashed or failed to start.
    pause
    exit /b
)

pause
