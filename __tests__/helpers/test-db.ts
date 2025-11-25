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

  // Create a temporary schema file for SQLite tests
  const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
  const testSchemaPath = path.join(__dirname, '../../prisma/schema-test.prisma');

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const testSchema = schemaContent.replace('provider = "postgresql"', 'provider = "sqlite"');
  fs.writeFileSync(testSchemaPath, testSchema);

  try {
    // Generate Prisma Client with SQLite provider
    execSync('npx prisma generate --schema=./prisma/schema-test.prisma', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '../..'),
    });

    // Use db push instead of migrate deploy for tests - it's simpler and doesn't track migration history
    execSync('npx prisma db push --skip-generate --schema=./prisma/schema-test.prisma', {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'pipe',
      cwd: path.join(__dirname, '../..'),
    });
  } catch (error) {
    console.error('Failed to setup test database:', error);
    fs.unlinkSync(testSchemaPath);
    throw error;
  } finally {
    // Clean up the temporary schema file
    try {
      fs.unlinkSync(testSchemaPath);
    } catch {
      // Ignore
    }
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
