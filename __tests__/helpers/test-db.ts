import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';

export async function createTestDatabase() {
  const dbDir = path.join(__dirname, '../test-dbs');
  fs.mkdirSync(dbDir, { recursive: true });

  const dbPath = path.join(dbDir, `test-${randomUUID()}.db`);
  const dbUrl = `file:${dbPath}`;

  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'pipe',
      cwd: path.join(__dirname, '../..'),
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: [],
  });

  return {
    prisma,
    cleanup: async () => {
      await prisma.$disconnect();
      try {
        fs.unlinkSync(dbPath);
      } catch {
        // Ignore
      }
    },
  };
}
