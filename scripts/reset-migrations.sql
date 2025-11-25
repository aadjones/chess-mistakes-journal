-- Reset Prisma migrations table
-- Run this against your Vercel Postgres database to clear failed migrations

-- Delete all migration records
DELETE FROM "_prisma_migrations";

-- Verify it's empty
SELECT * FROM "_prisma_migrations";
