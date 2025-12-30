# Smart Parking System - Deployment Guide

This guide explains how to deploy the **Frontend (React)** to Vercel, the **Backend (Node.js)** to Render, and the **Database** to MongoDB Atlas.

> [!IMPORTANT]
> The **OpenCV Service** is designed to run **LOCALLY** (on a laptop or edge device) because it needs direct access to hardware cameras. It will not be deployed to the cloud.

---

## 🛠️ 0. GitHub Setup (Prerequisite)

Before deploying, you must push your code to GitHub. Choose **Option A** (Command Line) or **Option B** (GitHub Desktop).

### Option A: Command Line (Git Bash / Terminal)
1.  **Initialize & Push:**
    ```bash
    git init
    git add .
    git commit -m "Initial deployment setup"
    # Create a new repo on GitHub.com called 'smart-parking-system'
    git remote add origin https://github.com/<YOUR_USERNAME>/smart-parking-system.git
    git branch -M main
    git push -u origin main
    ```

### Option B: GitHub Desktop (Easier)
1.  **Download:** Install [GitHub Desktop](https://desktop.github.com/).
2.  **Add Project:**
    *   Open GitHub Desktop.
    *   Go to **File** -> **Add Local Repository**.
    *   Click **Choose...** and select your project folder: `C:\Users\apurv\OneDrive\Desktop\PROJECTS\Parkit Final`.
    *   Click **Add Repository**.
3.  **Create Repository:**
    *   You might see a warning: *"This directory does not appear to be a Git repository"*.
    *   Click **create a repository** in that warning message.
    *   Keep the default settings and click **Create Repository**.
4.  **Publish:**
    *   Click the **Publish repository** button in the top toolbar.
    *   **Name**: `smart-parking-system` (or whatever you prefer).
    *   **Keep this code private**: Uncheck if you want it public (required for free Render/Vercel mostly).
    *   Click **Publish Repository**.
5.  **Done!** Your code is now on GitHub.

---

## 🏗️ 1. Database (MongoDB Atlas)

1.  **Create Account:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/login.
2.  **Create Cluster:** Create a **FREE** shared cluster (M0 Sandbox).
3.  **Create User:** In "Database Access", create a user with a password. **Remember these credentials**.
4.  **Network Access:** In "Network Access", allow access from anywhere (`0.0.0.0/0`) to allow the Render server to connect.
5.  **Get Connection String:**
    *   Click "Connect" -> "Drivers".
    *   Copy the connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/...`).
    *   Replace `<password>` with your actual password.

---

## 🚀 2. Backend (Render)

1.  **Push Code:** Ensure your latest code is pushed to GitHub.
2.  **Create Service:**
    *   Go to [Render Dashboard](https://dashboard.render.com/).
    *   Click "New +" -> "Web Service".
    *   Connect your GitHub repository.
3.  **Configure Settings:**
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
    *   **Environment Variables:** Add the following:
        *   `NODE_ENV`: `production`
        *   `MONGODB_URI`: (Your Atlas connection string from Step 1)
        *   `JWT_SECRET`: (A long random string)
        *   `CLIENT_URL`: `https://<your-frontend-app-name>.vercel.app` (You will update this *after* deploying frontend, or set to `*` temporarily).
4.  **Deploy:** Click "Create Web Service".
5.  **Copy URL:** Once deployed, copy your backend URL (e.g., `https://smart-parking-api.onrender.com`).

---

## 🌐 3. Frontend (Vercel)

1.  **Create Project:**
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click "Add New..." -> "Project".
    *   Import your GitHub repository.
2.  **Configure Settings:**
    *   **Root Directory:** `client` (Click "Edit" next to "Root Directory" and select `client`).
    *   **Framework Preset:** Vite (should be auto-detected).
    *   **Environment Variables:**
        *   `VITE_API_URL`: (Your Render Backend URL from Step 2, e.g., `https://smart-parking-api.onrender.com/api`)
3.  **Deploy:** Click "Deploy".
4.  **Update Backend:** Go back to Render Dashboard -> Environment Variables -> Edit `CLIENT_URL` with your new Vercel domain.

---

## 📷 4. OpenCV Service (Local/Edge)

This service runs on the computer physically connected to the cameras.

1.  **Setup:** Follow the instructions in `server/opencv_service/README.md`.
2.  **Run:**
    ```bash
    cd server/opencv_service
    # Windows
    start-opencv.bat
    ```
3.  **Connection:**
    *   The cloud backend cannot *directly* talk to your localhost unless you use a tunnel.
    *   **Solution**: Use [ngrok](https://ngrok.com/) to expose your local OpenCV service.
    *   Run: `ngrok http 5001`
    *   Update Render Environment Variable `OPENCV_SERVICE_URL` with the ngrok URL.

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created & Network Access allowed (`0.0.0.0/0`).
- [ ] Backend deployed on Render with `MONGODB_URI` and `JWT_SECRET`.
- [ ] Frontend deployed on Vercel with `VITE_API_URL` pointing to Render.
- [ ] Backend `CLIENT_URL` updated with Vercel domain.
- [ ] App works! (Try Register/Login).
