@echo off
echo Debugging start_frontend.bat
echo Current directory: %cd%
cd frontend || (echo Error: cd frontend failed & pause & exit /b)
echo After cd: %cd%
echo Checking node_modules existence...
if not exist node_modules (
    echo Installing node modules ^(this may take a while^)...
    call npm install
    echo npm install returned %errorlevel%
    if %errorlevel% neq 0 (
        echo Error: npm install failed.
        pause
        exit /b
    )
) else (
    echo node_modules exists
)

echo Starting Vite Server...
call npm run dev
echo npm run dev returned %errorlevel%
if %errorlevel% neq 0 (
    echo Error: npm run dev failed.
    pause
    exit /b
)

echo Debug script finished.
pause
