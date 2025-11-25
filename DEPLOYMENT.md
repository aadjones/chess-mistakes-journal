# Vercel Deployment Guide

This guide walks you through deploying your Chess Mistake Journal to Vercel with password protection.

## Prerequisites

- Vercel account (free tier is fine)
- Your existing SQLite database with ~100 entries
- A password you want to use for site access

## Step-by-Step Deployment

### 1. Create PostgreSQL Database on Vercel

**Action Required: Do this in Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres" (Neon)
5. Name it something like "chess-journal-db"
6. Choose your preferred region
7. Click "Create"
8. Once created, go to the ".env.local" tab and copy the `POSTGRES_URL` value

### 2. Set Up Environment Variables

**Action Required: Do this in Vercel Dashboard**

1. In your Vercel project settings, go to "Settings" → "Environment Variables"
2. Add these four variables (for all environments: Production, Preview, Development):

   ```
   DATABASE_URL = <paste the POSTGRES_URL from step 1>
   ANTHROPIC_API_KEY = <your existing API key>
   SITE_PASSWORD = <choose a strong password for site access>
   SESSION_SECRET = <generate a random string, e.g., use: openssl rand -base64 32>
   ```

   **Important:**
   - `SITE_PASSWORD` is what you'll type to access the site
   - `SESSION_SECRET` should be a random string (run `openssl rand -base64 32` to generate one)

### 3. Push Code to GitHub

**Action Required: Do this locally**

```bash
# Add all new files
git add .

# Commit the changes
git commit -m "Add Vercel deployment with password protection"

# Push to GitHub
git push origin main
```

### 4. Deploy to Vercel

**Action Required: Do this in Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js
5. Click "Deploy"

The build will:

- Generate Prisma Client
- Run database migrations (creating empty tables)
- Build your Next.js app

### 5. Import Your Data

**Action Required: Do this locally AFTER first deploy**

Once your Vercel deployment is live and the database is set up:

1. Copy the `DATABASE_URL` from Vercel (the full Postgres connection string)
2. Temporarily set it in your local environment:

   ```bash
   export DATABASE_URL="<your-vercel-postgres-url>"
   ```

3. Run the import script:

   ```bash
   npx tsx scripts/import-to-postgres.ts
   ```

4. This will import all your games, mistakes, and insights from the SQLite export

### 6. Test Your Deployment

**Action Required: Do this in your browser**

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. You should be redirected to `/login`
3. Enter the password you set in `SITE_PASSWORD`
4. You should see your chess journal with all your data

## Security Notes

- Password is stored in environment variables (never in code)
- Session cookie lasts 30 days
- Cookie is httpOnly and secure in production
- All routes except `/login` are protected

## Troubleshooting

### "Invalid password" on login

- Double-check the `SITE_PASSWORD` environment variable in Vercel
- Make sure you redeployed after setting environment variables

### No data showing after import

- Verify the import script completed successfully
- Check that `DATABASE_URL` pointed to the correct Vercel Postgres database
- Try running the import script again

### Build fails

- Check Vercel build logs
- Ensure all environment variables are set
- Verify `DATABASE_URL` is valid

### Can't connect to database during import

- Make sure you copied the full Postgres URL (starts with `postgres://` or `postgresql://`)
- Verify your IP isn't blocked (Vercel Postgres allows all by default)

## Updating Your Deployment

After making code changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy.

## Backing Up Your Data

Your data is now in Vercel Postgres. To back up:

```bash
# Connect to your Vercel Postgres database
# (Use the connection string from Vercel)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Local Development with Postgres

If you want to test locally with Postgres before deploying:

1. Update your local `.env`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/chess_journal"
   SITE_PASSWORD="test123"
   SESSION_SECRET="local-dev-secret"
   ```

2. Run migrations:

   ```bash
   npx prisma migrate dev
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```
