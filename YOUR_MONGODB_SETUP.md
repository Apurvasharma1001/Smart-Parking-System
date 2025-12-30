# 🎯 Your MongoDB Atlas Setup - Customized

## Your Username: `apurvasharmahk`

---

## 📝 Step-by-Step for Your Setup:

### Step 1: Create MongoDB Atlas Account ✅
- Go to: https://www.mongodb.com/cloud/atlas/register
- Create account and verify email

### Step 2: Create Free Cluster ✅
- Click "Build a Database"
- Select "M0 Sandbox" (FREE)
- Choose region and create cluster

### Step 3: Create Database User ✅
- **Username:** `apurvasharmahk` (you've already set this)
- **Password:** (your password - make sure you saved it!)
- Click "Create Database User"

### Step 4: Network Access ✅
- Click "Add My Current IP Address"
- OR "Allow Access from Anywhere" → Enter `0.0.0.0/0`
- Click "Confirm"

### Step 5: Get Connection String ✅
- Click "Connect" on your cluster
- Click "Connect your application"
- Copy the connection string

### Step 6: Update Your `server/.env` File

**Your connection string should look like this:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://apurvasharmahk:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-parking?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long
NODE_ENV=development
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual MongoDB password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Make sure `/smart-parking` is added before the `?`

---

## 🔍 Example Connection String:

If your cluster URL is `cluster0.abc123.mongodb.net` and your password is `MyPass123`, your connection string would be:

```
mongodb+srv://apurvasharmahk:MyPass123@cluster0.abc123.mongodb.net/smart-parking?retryWrites=true&w=majority
```

---

## ✅ Quick Checklist:

- [ ] Username: `apurvasharmahk` ✅
- [ ] Password saved securely
- [ ] Cluster created
- [ ] Network access configured (0.0.0.0/0 or your IP)
- [ ] Connection string copied
- [ ] `server/.env` file updated with:
  - Username: `apurvasharmahk`
  - Your password
  - Your cluster URL
  - `/smart-parking` added before `?`

---

## 🧪 Test Your Connection:

1. **Open `server/.env` file:**
   ```
   C:\Users\apurv\OneDrive\Desktop\PROJECTS\Parkit Final\server\.env
   ```

2. **Make sure it looks like this:**
   ```env
   MONGODB_URI=mongodb+srv://apurvasharmahk:YOUR_ACTUAL_PASSWORD@YOUR_CLUSTER_URL/smart-parking?retryWrites=true&w=majority
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Look for:**
   ```
   ✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
   📊 Database: smart-parking
   ```

---

## ❓ Troubleshooting:

### If connection fails:

1. **Check username:** Should be `apurvasharmahk` (no typos)
2. **Check password:** Make sure it's correct (case-sensitive)
3. **Check cluster URL:** Should match your Atlas cluster
4. **Check Network Access:** Make sure your IP is allowed
5. **Check database name:** Should have `/smart-parking` in the URL

### Common mistakes:

❌ Wrong: `mongodb+srv://apurvasharmahk:pass@cluster.net/?retryWrites=true`
✅ Correct: `mongodb+srv://apurvasharmahk:pass@cluster.net/smart-parking?retryWrites=true`

Notice the `/smart-parking` before the `?`!

---

## 🎉 You're All Set!

Once you see `✅ MongoDB Connected`, you're ready to use the Smart Parking System!


