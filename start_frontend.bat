@echo off
echo Starting Frontend (diagnostic)...
echo Current directory: %cd%
echo Command echo ON for diagnostics
echo on
cd frontend
if %errorlevel% neq 0 (
    echo Error: Could not change directory to 'frontend'.
    pause
    exit /b
)


if not exist node_modules (
    echo Installing node modules...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: npm install failed.
        pause
        exit /b
    )
) else (
    echo node_modules found, skipping install.
)


echo Starting Vite Server...
call npm run dev
if %errorlevel% neq 0 (
    echo Error: npm run dev failed.
    pause
    exit /b
)

pause
