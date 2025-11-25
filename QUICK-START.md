# Quick Start: Deploy to Vercel

Your app is ready to deploy! Here's what you need to do on your end:

## 📋 Checklist

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Vercel deployment with password protection"
git push origin main
```

### Step 2: Create Vercel Postgres Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Storage"** tab → **"Create Database"**
3. Select **"Postgres"** (Neon)
4. Name it: `chess-journal-db`
5. Click **"Create"**
6. Copy the **`POSTGRES_URL`** from the ".env.local" tab

### Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Before deploying, add these **Environment Variables**:

   ```
   DATABASE_URL = <paste POSTGRES_URL from step 2>
   ANTHROPIC_API_KEY = <your existing API key from .env>
   SITE_PASSWORD = <choose your password>
   SESSION_SECRET = <run: openssl rand -base64 32>
   ```

4. Click **"Deploy"**

### Step 4: Import Your Data (After Deploy)

```bash
# Set the Vercel Postgres URL temporarily
export DATABASE_URL="<your-vercel-postgres-url>"

# Run the import script
npx tsx scripts/import-to-postgres.ts
```

### Step 5: Test It!

1. Visit your Vercel URL
2. You'll be redirected to `/login`
3. Enter your `SITE_PASSWORD`
4. Your journal should load with all your data!

---

## 🔐 Security Features

- ✅ Password-protected site
- ✅ 30-day session cookies
- ✅ All routes protected except login
- ✅ Logout button in header

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

## 🆘 Need Help?

Common issues:

- **Can't login**: Check `SITE_PASSWORD` env var in Vercel
- **No data**: Run the import script again with correct `DATABASE_URL`
- **Build fails**: Check Vercel build logs for missing env vars
