@echo off
echo Starting Project...

:: Start Backend
start "Backend Server" cmd /k "call start_backend.bat"

:: Wait for backend to initialize
timeout /t 5

:: Start Frontend
start "Frontend Server" cmd /k "call start_frontend.bat"

echo Backend and Frontend started in separate windows.
pause
