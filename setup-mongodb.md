# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start) 🌐

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-parking?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your Atlas credentials
7. In Atlas, go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

**✅ No installation needed!**

---

## Option 2: Local MongoDB Installation 💻

### Windows Installation:

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download and run the installer

2. **Installation Steps:**
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Service Name: MongoDB
   - Check "Install MongoDB Compass" (GUI tool)

3. **Verify Installation:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service MongoDB
   
   # Or check in Services app (services.msc)
   # Look for "MongoDB" service
   ```

4. **Start MongoDB Service:**
   ```powershell
   # Start MongoDB service
   Start-Service MongoDB
   
   # Or use Services app (services.msc)
   # Right-click MongoDB → Start
   ```

5. **Test Connection:**
   ```powershell
   # Open MongoDB shell
   mongosh
   
   # Or if mongosh is not available:
   mongo
   ```

### Manual Start (if service doesn't work):

```powershell
# Navigate to MongoDB bin directory (usually):
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

**Note:** Create `C:\data\db` directory first if it doesn't exist.

---

## Option 3: Using Docker 🐳

If you have Docker installed:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use: `mongodb://localhost:27017/smart-parking`

---

## Verify Connection

After setup, test the connection:

1. Start your server: `npm run dev`
2. Look for: `✅ MongoDB Connected: ...`
3. Or visit: http://localhost:5000/api/health

---

## Troubleshooting

### Error: "connect ECONNREFUSED"
- MongoDB is not running
- Start MongoDB service or use MongoDB Atlas

### Error: "Authentication failed"
- Check username/password in connection string
- For Atlas: Verify database user credentials

### Error: "Network access denied"
- For Atlas: Add your IP address in Network Access settings

---

## Quick Test Script

Run `check-mongodb.ps1` to check MongoDB status.


