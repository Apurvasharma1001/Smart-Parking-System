# 🔧 Fix MongoDB Authentication Error

## Error: "bad auth : authentication failed"

This means your MongoDB Atlas password is incorrect or needs special encoding.

---

## ✅ Solution 1: Verify Password in MongoDB Atlas

### Step 1: Go to MongoDB Atlas
1. Login to: https://cloud.mongodb.com/
2. Go to your cluster

### Step 2: Check Database User
1. Click "Database Access" (left sidebar)
2. Find your user: `apurvasharmahk`
3. Click the "Edit" button (pencil icon)
4. You can either:
   - **Option A:** View/verify the password (if you saved it)
   - **Option B:** Reset the password (recommended)

### Step 3: Reset Password (Recommended)
1. Click "Edit" on your user
2. Click "Edit Password"
3. Enter a new password (save it securely!)
4. Click "Update User"

### Step 4: Update .env File
1. Open `server/.env`
2. Update the password in the connection string:
   ```env
   MONGODB_URI=mongodb+srv://apurvasharmahk:YOUR_NEW_PASSWORD@parkit.or61wwr.mongodb.net/smart-parking?retryWrites=true&w=majority
   ```

---

## ✅ Solution 2: URL Encode Special Characters

If your password has special characters, they need to be URL encoded:

### Common Special Characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- ` ` (space) → `%20`

### Example:
If your password is: `My@Pass#123`
Encoded: `My%40Pass%23123`

Connection string:
```
mongodb+srv://apurvasharmahk:My%40Pass%23123@parkit.or61wwr.mongodb.net/smart-parking?retryWrites=true&w=majority
```

---

## ✅ Solution 3: Get Fresh Connection String from Atlas

### Step 1: Get New Connection String
1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Copy the connection string

### Step 2: Replace Password
1. The connection string will have: `<password>`
2. Replace it with your actual password
3. Add `/smart-parking` before the `?`

### Step 3: Update .env
```env
MONGODB_URI=mongodb+srv://apurvasharmahk:YOUR_PASSWORD@parkit.or61wwr.mongodb.net/smart-parking?retryWrites=true&w=majority
```

---

## 🧪 Test After Fixing

1. Save the `.env` file
2. Restart your server:
   ```bash
   npm run dev
   ```
3. Look for:
   ```
   ✅ MongoDB Connected: parkit.or61wwr.mongodb.net
   📊 Database: smart-parking
   ```

---

## 💡 Quick Fix Script

I'll create a helper script to encode your password automatically.


