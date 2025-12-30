@echo off
title Smart Parking System - Backend Server
color 0B

echo ========================================
echo   Starting Backend Server Only
echo ========================================
echo.
echo Server will run on: http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd server
npm run dev

pause


