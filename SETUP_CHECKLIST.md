# ✅ MongoDB Setup Checklist

## Quick Reference

### 🌐 MongoDB Atlas (Cloud) - 5 Minutes

- [ ] Step 1: Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Step 2: Create account and verify email
- [ ] Step 3: Create free M0 cluster
- [ ] Step 4: Create database user (save username & password!)
- [ ] Step 5: Add IP address (0.0.0.0/0 for development)
- [ ] Step 6: Get connection string from "Connect your application"
- [ ] Step 7: Update `server/.env` with connection string
- [ ] Step 8: Add `/smart-parking` to connection string before `?`
- [ ] Step 9: Test with `npm run dev`
- [ ] Step 10: See ✅ MongoDB Connected message

**Download Link:** https://www.mongodb.com/cloud/atlas/register

---

### 💻 Local MongoDB - 10 Minutes

- [ ] Step 1: Go to https://www.mongodb.com/try/download/community
- [ ] Step 2: Download Windows MSI installer
- [ ] Step 3: Run installer, choose "Complete" installation
- [ ] Step 4: Check "Install MongoDB as a Service"
- [ ] Step 5: Check "Install MongoDB Compass"
- [ ] Step 6: Complete installation
- [ ] Step 7: Verify MongoDB service is running
- [ ] Step 8: Check `server/.env` has: `mongodb://localhost:27017/smart-parking`
- [ ] Step 9: Test with `npm run dev`
- [ ] Step 10: See ✅ MongoDB Connected message

**Download Link:** https://www.mongodb.com/try/download/community

---

## Connection String Examples

### Atlas:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-parking?retryWrites=true&w=majority
```

### Local:
```
mongodb://localhost:27017/smart-parking
```

---

## Quick Commands

```powershell
# Check MongoDB status
.\check-mongodb.ps1

# Start MongoDB service (local)
.\start-mongodb.ps1

# Start application
npm run dev
```

---

## Success Indicators

✅ **You're connected when you see:**
```
✅ MongoDB Connected: ...
📊 Database: smart-parking
```

❌ **If you see errors, check:**
- MongoDB service is running (local)
- Connection string is correct
- Network access is configured (Atlas)
- Username/password are correct (Atlas)


