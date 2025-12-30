# 🚀 Quick Start Guide

## Step 1: Setup MongoDB (Choose One)

### Option A: MongoDB Atlas (Cloud - Easiest) ⭐ Recommended

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create free cluster (M0)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Edit `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-parking?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your Atlas credentials
6. In Atlas: "Network Access" → "Add IP Address" → "Allow Access from Anywhere"

**✅ Done! No installation needed.**

---

### Option B: Local MongoDB

1. **Check if MongoDB is installed:**
   ```powershell
   .\check-mongodb.ps1
   ```

2. **If not installed:**
   - Download: https://www.mongodb.com/try/download/community
   - Install with default settings
   - Make sure "Install as Service" is checked

3. **Start MongoDB:**
   ```powershell
   .\start-mongodb.ps1
   ```
   Or manually: Open Services (services.msc) → Start "MongoDB" service

---

## Step 2: Start the Application

### Windows (Easiest):
Double-click `START_HERE.bat`

### Or use command line:
```bash
npm run dev
```

---

## Step 3: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## Troubleshooting

### MongoDB Connection Error?

1. **Check MongoDB status:**
   ```powershell
   .\check-mongodb.ps1
   ```

2. **For Local MongoDB:**
   ```powershell
   .\start-mongodb.ps1
   ```

3. **For MongoDB Atlas:**
   - Verify connection string in `server/.env`
   - Check Network Access settings in Atlas
   - Verify username/password

### Still having issues?

See `setup-mongodb.md` for detailed instructions.


