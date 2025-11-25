import '@testing-library/jest-dom';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Before running any tests, generate Prisma Client with SQLite provider
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const testSchemaPath = path.join(__dirname, '../prisma/schema-test.prisma');

const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const testSchema = schemaContent.replace('provider = "postgresql"', 'provider = "sqlite"');
fs.writeFileSync(testSchemaPath, testSchema);

try {
  execSync('npx prisma generate --schema=./prisma/schema-test.prisma', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('✓ Generated Prisma Client with SQLite for tests');
} catch (error) {
  console.error('Failed to generate Prisma Client for tests:', error);
  throw error;
}
