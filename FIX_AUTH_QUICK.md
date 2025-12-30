# ⚡ Quick Fix for Authentication Error

## The Problem:
```
❌ MongoDB Connection Error: bad auth : authentication failed
```

## The Solution (Choose One):

### 🎯 Option 1: Reset Password in Atlas (Easiest)

1. **Go to MongoDB Atlas:**
   - Login: https://cloud.mongodb.com/
   - Click "Database Access" (left sidebar)

2. **Reset Password:**
   - Find user: `apurvasharmahk`
   - Click "Edit" → "Edit Password"
   - Enter new password (save it!)
   - Click "Update User"

3. **Update .env file:**
   - Open: `server/.env`
   - Replace password in connection string
   - Save file

4. **Test:**
   ```bash
   npm run dev
   ```

---

### 🎯 Option 2: Use Password Encoder Script

If your password has special characters:

1. **Run the encoder:**
   ```powershell
   .\encode-password.ps1
   ```

2. **Enter your password when prompted**

3. **It will:**
   - Encode special characters
   - Show you the connection string
   - Optionally update your .env file

---

### 🎯 Option 3: Get Fresh Connection String

1. **In MongoDB Atlas:**
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string

2. **Replace `<password>` with your actual password**

3. **Add `/smart-parking` before the `?`**

4. **Update `server/.env`**

---

## ✅ After Fixing:

You should see:
```
✅ MongoDB Connected: parkit.or61wwr.mongodb.net
📊 Database: smart-parking
```

---

## 🔍 Common Issues:

- **Wrong password:** Double-check in Atlas
- **Special characters:** Use the encoder script
- **Password changed:** Update .env file
- **User doesn't exist:** Create new user in Atlas


