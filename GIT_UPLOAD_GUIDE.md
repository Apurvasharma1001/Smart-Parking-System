# Git Upload Guide - Smart Parking System

This guide will help you upload your Smart Parking System project to GitHub.

## Prerequisites

### Step 1: Install Git (if not already installed)

1. Download Git from: https://git-scm.com/download/win
2. Run the installer and follow the setup wizard
3. Use default settings (recommended)
4. After installation, restart your terminal/PowerShell

**Verify Git installation:**
```powershell
git --version
```

### Step 2: Configure Git (First Time Only)

Set your name and email (this will appear in your commits):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Create a GitHub Repository

1. Go to https://github.com
2. Sign in to your account (or create one if you don't have it)
3. Click the **"+"** icon in the top-right corner
4. Select **"New repository"**
5. Fill in the details:
   - **Repository name**: `smart-parking-system` (or your preferred name)
   - **Description**: "Smart Parking System with OpenCV, Node.js, and MongoDB"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**
7. **Copy the repository URL** (it will look like: `https://github.com/yourusername/smart-parking-system.git`)

---

## Upload Commands

### Step 4: Initialize Git Repository

Open PowerShell in your project directory and run:

```powershell
cd "c:\Users\apurv\OneDrive\Desktop\PROJECTS\Parkit Final"
```

Initialize Git:
```powershell
git init
```

### Step 5: Add All Files

Add all files to staging (respecting .gitignore):
```powershell
git add .
```

**Check what will be committed:**
```powershell
git status
```

> [!NOTE]
> Files listed in `.gitignore` (like `node_modules/`, `.env`, etc.) will NOT be added.

### Step 6: Create First Commit

```powershell
git commit -m "Initial commit: Smart Parking System with OpenCV integration"
```

### Step 7: Add Remote Repository

Replace `YOUR_GITHUB_URL` with the URL you copied from GitHub:

```powershell
git remote add origin YOUR_GITHUB_URL
```

**Example:**
```powershell
git remote add origin https://github.com/yourusername/smart-parking-system.git
```

**Verify remote:**
```powershell
git remote -v
```

### Step 8: Push to GitHub

For the first push, use:
```powershell
git push -u origin main
```

> [!IMPORTANT]
> If you get an error about "master" vs "main", try:
> ```powershell
> git branch -M main
> git push -u origin main
> ```

### Step 9: Enter GitHub Credentials

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)

#### How to Create a Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Smart Parking Upload"
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## Quick Reference - All Commands in Order

```powershell
# Navigate to project
cd "c:\Users\apurv\OneDrive\Desktop\PROJECTS\Parkit Final"

# Initialize Git
git init

# Add all files
git add .

# Check status
git status

# Create first commit
git commit -m "Initial commit: Smart Parking System with OpenCV integration"

# Add remote (replace with your URL)
git remote add origin https://github.com/yourusername/smart-parking-system.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Future Updates

After the initial upload, when you make changes:

```powershell
# Check what changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

---

## Common Issues & Solutions

### Issue 1: "git is not recognized"
**Solution**: Install Git from https://git-scm.com/download/win and restart your terminal.

### Issue 2: Authentication failed
**Solution**: Use a Personal Access Token instead of your password (see Step 9).

### Issue 3: "failed to push some refs"
**Solution**: Pull first, then push:
```powershell
git pull origin main --rebase
git push origin main
```

### Issue 4: Large files error
**Solution**: Make sure `.gitignore` is working. Check:
```powershell
git status
```
If you see `node_modules/` or large video files, they shouldn't be there.

### Issue 5: Want to undo last commit (before push)
**Solution**:
```powershell
git reset --soft HEAD~1
```

---

## What Gets Uploaded?

✅ **Included:**
- Source code (`client/`, `server/`, `admin/`)
- Configuration files (`package.json`, `.env.example`)
- Documentation (`.md` files)
- `.gitignore` file
- Batch scripts (`.bat`, `.ps1`)

❌ **Excluded (by .gitignore):**
- `node_modules/` (dependencies)
- `.env` (sensitive environment variables)
- `.venv/` (Python virtual environment)
- `__pycache__/` (Python cache)
- Build artifacts
- Log files
- Temporary files
- Large media files (`.mp4`, `.avi`, etc.)

---

## Next Steps After Upload

1. **Add a README badge** to show it's deployed
2. **Set up GitHub Actions** for CI/CD (optional)
3. **Enable GitHub Pages** for documentation (optional)
4. **Invite collaborators** if working in a team

---

## Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf
