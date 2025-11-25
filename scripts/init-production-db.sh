#!/bin/bash
# One-time script to initialize production database
# Run this after setting up DATABASE_URL in Vercel

echo "Running database migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Database initialized!"
echo ""
echo "Next step: Import your data using scripts/import-to-postgres.ts"
