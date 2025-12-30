# 🚀 Service Startup Guide

Quick shortcuts to start all or individual services for the Smart Parking System.

## 🎯 Quick Start - All Services

### Option 1: Double-Click (Easiest) ⭐
- **Windows:** Double-click `start-all.bat`
- This starts Backend, Frontend, and OpenCV service together

### Option 2: PowerShell
```powershell
.\start-all.ps1
```

### Option 3: npm script
```bash
npm run dev:all
```

## 🔧 Individual Services

### Start Backend Only
Double-click: `start-backend.bat`

Or command line:
```bash
cd server
npm run dev
```
Runs on: **http://localhost:5000**

---

### Start Frontend Only
Double-click: `start-frontend.bat`

Or command line:
```bash
cd client
npm run dev
```
Runs on: **http://localhost:3000**

---

### Start OpenCV Service Only
Double-click: `start-opencv.bat`

Or command line:
```powershell
cd server\opencv_service
.\venv\Scripts\Activate.ps1
python service.py
```
Runs on: **http://localhost:5001**

---

## 📋 Service Summary

| Service | Port | Shortcut File | Description |
|---------|------|---------------|-------------|
| **Backend** | 5000 | `start-backend.bat` | Node.js/Express API server |
| **Frontend** | 3000 | `start-frontend.bat` | React client application |
| **OpenCV** | 5001 | `start-opencv.bat` | Python parking detection service |

## ⚠️ Important Notes

1. **First Time Setup:**
   - Make sure MongoDB is running (local or Atlas)
   - Run `npm run install-all` if dependencies not installed
   - For OpenCV service: Run `server\opencv_service\setup.bat` first time

2. **MongoDB Required:**
   - Backend needs MongoDB connection
   - See `MONGODB_SETUP_GUIDE.md` for setup

3. **Environment Variables:**
   - Backend: `server/.env` (MONGODB_URI, JWT_SECRET)
   - Frontend: `client/.env` (optional, defaults to localhost:5000)
   - OpenCV: Uses default port 5001 (or set OPENCV_SERVICE_URL in backend .env)

## 🛑 Stopping Services

- **All services:** Press `Ctrl+C` in the terminal
- **Individual windows:** Close the window or press `Ctrl+C`

## 🐛 Troubleshooting

### Port Already in Use?
```bash
# Windows - Find process using port
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### OpenCV Service Won't Start?
- Make sure virtual environment exists: `server\opencv_service\venv`
- Run setup: `cd server\opencv_service && setup.bat`
- Check Python is installed: `python --version`

### Backend/Frontend Won't Start?
- Install dependencies: `npm run install-all`
- Check Node.js is installed: `node --version`
- Check MongoDB is running


