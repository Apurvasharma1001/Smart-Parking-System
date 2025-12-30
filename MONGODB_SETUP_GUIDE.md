# 📘 Complete MongoDB Setup Guide - Step by Step

## 🎯 Choose Your Option

- **Option 1: MongoDB Atlas (Cloud)** - ⭐ Recommended - No installation, works immediately
- **Option 2: Local MongoDB** - Install on your computer

---

# 🌐 Option 1: MongoDB Atlas (Cloud) - RECOMMENDED

## Why Choose Atlas?
- ✅ No installation required
- ✅ Free tier available (512MB storage)
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Easy to set up (5 minutes)

---

## Step-by-Step Setup:

### Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas Registration:**
   - **Link:** https://www.mongodb.com/cloud/atlas/register
   - Click "Try Free" or "Sign Up"

2. **Fill in the registration form:**
   - Email address
   - Password (must be at least 8 characters)
   - First Name
   - Last Name
   - Company (optional)
   - Click "Create your Atlas account"

3. **Verify your email:**
   - Check your email inbox
   - Click the verification link

---

### Step 2: Create a Free Cluster

1. **After logging in, you'll see "Deploy a cloud database":**
   - Click "Build a Database"

2. **Choose the FREE tier (M0):**
   - Select "M0 Sandbox" (FREE)
   - Click "Create"

3. **Choose Cloud Provider & Region:**
   - **Provider:** AWS (recommended) or any available
   - **Region:** Choose closest to you (e.g., `N. Virginia (us-east-1)`)
   - Click "Create Cluster"

4. **Wait for cluster creation:**
   - Takes 1-3 minutes
   - You'll see "Your cluster is being created"

---

### Step 3: Create Database User

1. **While cluster is creating, you'll see "Create Database User":**
   - **Username:** Enter a username (e.g., `parkitadmin`)
   - **Password:** Click "Autogenerate Secure Password" or create your own
   - **⚠️ IMPORTANT:** Copy and save the password! You'll need it.
   - Click "Create Database User"

2. **Network Access:**
   - Click "Add My Current IP Address"
   - **OR** Click "Allow Access from Anywhere" (for development)
     - Enter: `0.0.0.0/0`
     - Click "Confirm"
   - Click "Finish and Close"

---

### Step 4: Get Connection String

1. **After cluster is ready, click "Connect":**
   - You'll see a popup with connection options

2. **Click "Connect your application":**
   - Driver: **Node.js**
   - Version: **5.5 or later**

3. **Copy the connection string:**
   - It looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

4. **Replace placeholders:**
   - Replace `<username>` with your database username (e.g., `parkitadmin`)
   - Replace `<password>` with your database password
   - **Example:**
     ```
     mongodb+srv://parkitadmin:MyPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

---

### Step 5: Update Your .env File

1. **Open `server/.env` file:**
   - Navigate to: `C:\Users\apurv\OneDrive\Desktop\PROJECTS\Parkit Final\server\.env`

2. **Update MONGODB_URI:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://parkitadmin:MyPassword123@cluster0.xxxxx.mongodb.net/smart-parking?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long
   NODE_ENV=development
   ```

   **Important:** 
   - Replace `parkitadmin` with your actual username
   - Replace `MyPassword123` with your actual password
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
   - Add `/smart-parking` before the `?` to specify database name

3. **Save the file**

---

### Step 6: Test Connection

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Look for this message:**
   ```
   ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   📊 Database: smart-parking
   ```

3. **If you see errors:**
   - Double-check username and password in connection string
   - Verify Network Access allows your IP (or 0.0.0.0/0)
   - Make sure you added `/smart-parking` to the connection string

---

## ✅ Atlas Setup Complete!

Your MongoDB Atlas is now configured and ready to use!

---

# 💻 Option 2: Local MongoDB Installation

## Why Choose Local?
- ✅ Full control over your database
- ✅ No internet required (after installation)
- ✅ No storage limits (depends on your disk)
- ✅ Good for development

---

## Step-by-Step Installation:

### Step 1: Download MongoDB Community Server

1. **Go to MongoDB Download Page:**
   - **Link:** https://www.mongodb.com/try/download/community

2. **Select your options:**
   - **Version:** Latest (e.g., 7.0.x)
   - **Platform:** Windows
   - **Package:** MSI
   - Click "Download"

3. **File will download:**
   - File name: `mongodb-windows-x86_64-7.0.x-signed.msi`
   - Size: ~500 MB

---

### Step 2: Install MongoDB

1. **Run the installer:**
   - Double-click the downloaded `.msi` file
   - Click "Next" on the welcome screen

2. **Accept License Agreement:**
   - Check "I accept the terms in the License Agreement"
   - Click "Next"

3. **Choose Setup Type:**
   - Select **"Complete"** (recommended)
   - Click "Next"

4. **Service Configuration:**
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Run service as Network Service user"
   - Service Name: `MongoDB` (default)
   - Click "Next"

5. **Install MongoDB Compass (GUI):**
   - ✅ Check "Install MongoDB Compass" (recommended - useful GUI tool)
   - Click "Next"

6. **Ready to Install:**
   - Review settings
   - Click "Install"

7. **Wait for installation:**
   - Takes 2-5 minutes
   - Click "Finish" when done

---

### Step 3: Verify Installation

1. **Check if MongoDB service is running:**
   - Press `Win + R`
   - Type: `services.msc`
   - Press Enter
   - Look for "MongoDB" service
   - Status should be "Running"

2. **Or use PowerShell:**
   ```powershell
   Get-Service MongoDB
   ```
   - Should show: `Status: Running`

---

### Step 4: Test MongoDB Connection

1. **Open Command Prompt or PowerShell**

2. **Test MongoDB:**
   ```bash
   mongosh
   ```
   - If this works, you'll see: `Current Mongosh Log ID: ...`
   - Type `exit` to quit

3. **If `mongosh` doesn't work, try:**
   ```bash
   mongo
   ```

---

### Step 5: Update Your .env File

1. **Open `server/.env` file:**
   - Navigate to: `C:\Users\apurv\OneDrive\Desktop\PROJECTS\Parkit Final\server\.env`

2. **Your MONGODB_URI should be:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart-parking
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long
   NODE_ENV=development
   ```

   **Note:** This is already set correctly for local MongoDB!

---

### Step 6: Start MongoDB Service (if not running)

1. **Using PowerShell (Run as Administrator):**
   ```powershell
   Start-Service MongoDB
   ```

2. **Or use Services app:**
   - Press `Win + R`
   - Type: `services.msc`
   - Find "MongoDB"
   - Right-click → "Start"

3. **Or use our script:**
   ```powershell
   .\start-mongodb.ps1
   ```

---

### Step 7: Test Connection

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Look for this message:**
   ```
   ✅ MongoDB Connected: localhost
   📊 Database: smart-parking
   ```

3. **If you see connection errors:**
   - Make sure MongoDB service is running
   - Check if port 27017 is not blocked by firewall
   - Verify `.env` file has correct connection string

---

## ✅ Local MongoDB Setup Complete!

Your local MongoDB is now installed and ready to use!

---

# 🔧 Troubleshooting

## Common Issues:

### Issue 1: "connect ECONNREFUSED"
**Solution:**
- **Atlas:** Check Network Access settings, add your IP
- **Local:** Start MongoDB service: `Start-Service MongoDB`

### Issue 2: "Authentication failed"
**Solution:**
- **Atlas:** Double-check username and password in connection string
- **Local:** Usually not needed for local development

### Issue 3: "MongoDB service won't start"
**Solution:**
- Run PowerShell as Administrator
- Check if port 27017 is already in use
- Reinstall MongoDB if needed

### Issue 4: "mongosh command not found"
**Solution:**
- MongoDB might not be in PATH
- Use full path: `C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe`
- Or reinstall MongoDB

---

# 📞 Need Help?

1. **Check MongoDB Status:**
   ```powershell
   .\check-mongodb.ps1
   ```

2. **Start MongoDB (Local):**
   ```powershell
   .\start-mongodb.ps1
   ```

3. **Test Connection:**
   - Visit: http://localhost:5000/api/health
   - Should show database status

---

# 🎉 You're All Set!

Once MongoDB is connected, you can:
- Register new users
- Create parking lots
- Make bookings
- Use all features of the Smart Parking System!

**Next Step:** Run `npm run dev` or double-click `START_HERE.bat`


