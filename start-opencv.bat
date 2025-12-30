@echo off
title Smart Parking System - OpenCV Service
color 0E

echo ========================================
echo   Starting OpenCV Service Only
echo ========================================
echo.
echo OpenCV Service will run on: http://localhost:5001
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd server\opencv_service

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    echo Please run: server\opencv_service\setup.bat first
    pause
    exit /b 1
)

REM Start the service
python service.py

pause


