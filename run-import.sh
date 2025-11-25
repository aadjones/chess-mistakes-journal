#!/bin/bash
# Temporary script to run the import

export DATABASE_URL="postgresql://neondb_owner:npg_tqlyUs05hcMN@ep-odd-hill-adngocwy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

npx tsx scripts/import-to-postgres.ts
