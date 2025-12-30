# 🚀 Terminal Commands to Start Services

Simple commands you can type in your terminal to start services.

## ⚡ Start All Services (Backend + Frontend + OpenCV)

### Option 1: npm script (Recommended)
```bash
npm run dev:all
```

### Option 2: Alternative command
```bash
npm run start:all
```

Both commands start:
- ✅ Backend Server (http://localhost:5000)
- ✅ Frontend Client (http://localhost:3000)
- ✅ OpenCV Service (http://localhost:5001)

---

## 🔧 Start Individual Services

### Backend Only
```bash
npm run server
```
or
```bash
cd server && npm run dev
```

### Frontend Only
```bash
npm run client
```
or
```bash
cd client && npm run dev
```

### OpenCV Service Only
```bash
npm run opencv
```
or
```powershell
# Windows PowerShell
cd server\opencv_service
.\venv\Scripts\Activate.ps1
python service.py
```

---

## 📋 Quick Reference

| Command | What It Starts |
|---------|----------------|
| `npm run dev:all` | All services (Backend + Frontend + OpenCV) |
| `npm run dev` | Backend + Frontend only |
| `npm run server` | Backend only |
| `npm run client` | Frontend only |
| `npm run opencv` | OpenCV service only |

---

## 💡 Tips

- All commands must be run from the project root directory
- Press `Ctrl+C` to stop all services
- Services run in the same terminal with color-coded labels


