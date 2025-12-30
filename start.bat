@echo off
echo ========================================
echo   Smart Parking System - Starting...
echo ========================================
echo.

REM Check if .env file exists
if not exist "server\.env" (
    echo [WARNING] server\.env file not found!
    echo Please create server\.env with MONGODB_URI
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists in root
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

REM Check if server node_modules exists
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

REM Check if client node_modules exists
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Checking MongoDB connection...
echo.
echo NOTE: Make sure MongoDB is running!
echo   - Local: Start MongoDB service or run start-mongodb.ps1
echo   - Cloud: Use MongoDB Atlas (see setup-mongodb.md)
echo.
echo Starting Server and Client...
echo.
echo Server will run on: http://localhost:5000
echo Client will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

REM Start both server and client
call npm run dev

pause

