@echo off
title Smart Parking System - All Services
color 0A

echo ========================================
echo   Smart Parking System - Starting ALL Services
echo ========================================
echo.

REM Check dependencies
echo Checking dependencies...

if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

REM Check OpenCV service setup
if not exist "server\opencv_service\venv" (
    echo OpenCV service virtual environment not found!
    echo Setting up OpenCV service...
    cd server\opencv_service
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..\..
)

echo.
echo ========================================
echo   Starting Services...
echo ========================================
echo.
echo Backend Server:  http://localhost:5000
echo Frontend Client: http://localhost:3000
echo OpenCV Service:  http://localhost:5001
echo.
echo Press Ctrl+C to stop all services
echo ========================================
echo.

REM Start OpenCV service in a new window
echo [1/3] Starting OpenCV Service...
start "OpenCV Service" cmd /k "cd /d %~dp0server\opencv_service && venv\Scripts\activate.bat && python service.py"

REM Wait a moment for OpenCV service to start
timeout /t 3 /nobreak >nul

REM Start Node.js services (backend and frontend)
echo [2/3] Starting Backend and Frontend...
call npm run dev

pause


