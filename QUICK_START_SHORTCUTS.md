# 🚀 Quick Start Shortcuts

Easy-to-use shortcuts to start all services for the Smart Parking System.

## ⚡ Fastest Way to Start Everything

### Double-Click Method (Windows)
**Just double-click: `start-all.bat`**

This starts:
- ✅ Backend Server (http://localhost:5000)
- ✅ Frontend Client (http://localhost:3000)  
- ✅ OpenCV Service (http://localhost:5001)

---

## 📁 Available Shortcuts

| File | What It Does |
|------|--------------|
| **`start-all.bat`** | ⭐ Starts ALL services (Backend + Frontend + OpenCV) |
| **`start-backend.bat`** | Starts Backend Server only |
| **`start-frontend.bat`** | Starts Frontend Client only |
| **`start-opencv.bat`** | Starts OpenCV Service only |
| **`start.bat`** | Starts Backend + Frontend (original, without OpenCV) |

---

## 🎯 Quick Reference

### Start All Services
```
Double-click: start-all.bat
```

**Or use terminal command:**
```bash
npm run dev:all
```

### Start Backend Only
```
Double-click: start-backend.bat
```
Or command line:
```bash
cd server
npm run dev
```

### Start Frontend Only
```
Double-click: start-frontend.bat
```
Or command line:
```bash
cd client
npm run dev
```

### Start OpenCV Service Only
```
Double-click: start-opencv.bat
```
Or command line:
```powershell
cd server\opencv_service
.\venv\Scripts\Activate.ps1
python service.py
```

---

## 🌐 Service URLs

After starting, access:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **OpenCV Service:** http://localhost:5001
- **Health Check:** http://localhost:5000/api/health

---

## ⚠️ Prerequisites

Before starting:
1. ✅ MongoDB must be running (local or Atlas)
2. ✅ Dependencies installed: `npm run install-all`
3. ✅ OpenCV service setup: `cd server\opencv_service && setup.bat`

See `START_SERVICES.md` for detailed documentation.

