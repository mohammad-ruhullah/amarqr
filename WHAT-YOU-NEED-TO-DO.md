# What You Need to Do — Step by Step

---

## ✅ Already Done by Me

| # | Task | Status |
|---|---|---|
| 1 | Full Next.js project with all components | ✅ Done |
| 2 | QR builder with 8 content types | ✅ Done |
| 3 | All customization (colors, eyes, size, logo, error correction) | ✅ Done |
| 4 | Pixel-style scanner animation | ✅ Done |
| 5 | Download PNG / SVG / JPG | ✅ Done |
| 6 | Post-download review popup | ✅ Done |
| 7 | Review section with NeonDB | ✅ Done |
| 8 | Usage counter | ✅ Done |
| 9 | Vercel Analytics | ✅ Done |
| 10 | About page with your story | ✅ Done |

---

## 🔧 What YOU Need to Do

### Step 1: Install Git (if not already)
```bash
# Open cmd or PowerShell and check:
git --version
# If not installed: https://git-scm.com/download/win
```

### Step 2: Create GitHub Repository
```
1. Go to https://github.com
2. Click + → "New repository"
3. Name: amarqr
4. Keep Public
5. Do NOT initialize with README
6. Click "Create repository"
```

### Step 3: Push the Code to GitHub
```bash
# Open PowerShell in C:\Users\erfan\Desktop\Autolinium\amarQR

git init
git add .
git commit -m "Initial commit - Amar QR website"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/amarqr.git
git branch -M main
git push -u origin main
```

### Step 4: Create Vercel Account
```
1. Go to https://vercel.com
2. Sign Up → "Continue with GitHub"
3. Authorize GitHub access
```

### Step 5: Set Up NeonDB Database
```
1. Go to https://neon.tech
2. Sign up (free)
3. Create new project → name: "amarqr"
4. Region: choose closest
5. Copy the connection string (neon gives you one)
   Format: postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 6: Create Database Tables
In NeonDB dashboard → SQL Editor, run these queries:

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_counter (
  id INT PRIMARY KEY DEFAULT 1,
  count BIGINT DEFAULT 0
);

INSERT INTO usage_counter (id, count) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
```

**Important:** If your connection string is different from mine, update it in the Vercel environment variables (next step).

### Step 7: Deploy on Vercel
```
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import "amarqr" from GitHub
4. Under "Environment Variables", add:
   Name:  DATABASE_URL
   Value: (paste your NeonDB connection string)
5. Click "Deploy"
6. Wait ~2 minutes
```

### Step 8: Add Your Domain
```
1. In Vercel dashboard → Project → "Settings" → "Domains"
2. Enter: amarqr.online
3. Follow Vercel's DNS instructions
```

### Step 9: Verify
```
Visit your site → Generate a QR → Download → Submit a review
Check NeonDB to see if data is stored
```

---

## 🎯 Quick Checklist

| # | Task | Done? |
|---|---|---|
| 1 | Install Git | ☐ |
| 2 | Create GitHub repo "amarqr" | ☐ |
| 3 | Push code to GitHub | ☐ |
| 4 | Create Vercel account | ☐ |
| 5 | Create NeonDB project + run SQL queries | ☐ |
| 6 | Deploy on Vercel (with DATABASE_URL) | ☐ |
| 7 | Add amarqr.online domain | ☐ |
| 8 | Test everything works | ☐ |

**Need help with any step? Just ask me!**
