/**
 * Script to import data from SQLite export to PostgreSQL
 * Run this after setting up your Postgres database on Vercel
 *
 * Usage:
 * 1. Set DATABASE_URL to your Vercel Postgres connection string
 * 2. Run: npx tsx scripts/import-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting import to PostgreSQL...\n');

  // Read the SQLite export
  const exportPath = path.join(__dirname, '../prisma/export-data.sql');

  if (!fs.existsSync(exportPath)) {
    console.error('Error: export-data.sql not found!');
    console.error('Run: sqlite3 prisma/dev.db ".dump" > prisma/export-data.sql');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(exportPath, 'utf-8');

  // Extract INSERT statements for each table
  const gameInserts = extractInserts(sqlContent, 'Game');
  const mistakeInserts = extractInserts(sqlContent, 'Mistake');
  const insightInserts = extractInserts(sqlContent, 'Insight');

  console.log(`Found ${gameInserts.length} games`);
  console.log(`Found ${mistakeInserts.length} mistakes`);
  console.log(`Found ${insightInserts.length} insights\n`);

  // Parse and import each type
  await importGames(gameInserts);
  await importMistakes(mistakeInserts);
  await importInsights(insightInserts);

  console.log('\n✅ Import complete!');
}

function extractInserts(sql: string, tableName: string): string[] {
  const regex = new RegExp(`INSERT INTO "${tableName}"[^;]+;`, 'g');
  return sql.match(regex) || [];
}

async function importGames(inserts: string[]) {
  console.log('Importing games...');
  for (const insert of inserts) {
    const values = parseInsertValues(insert);
    if (values) {
      await prisma.game.create({
        data: {
          id: values[0],
          pgn: values[1],
          playerColor: values[2],
          opponentRating: values[3] ? parseInt(values[3]) : null,
          timeControl: values[4],
          datePlayed: values[5] ? new Date(values[5]) : null,
          createdAt: new Date(values[6]),
        },
      });
    }
  }
  console.log(`✓ Imported ${inserts.length} games`);
}

async function importMistakes(inserts: string[]) {
  console.log('Importing mistakes...');
  for (const insert of inserts) {
    const values = parseInsertValues(insert);
    if (values) {
      await prisma.mistake.create({
        data: {
          id: values[0],
          gameId: values[1],
          moveIndex: parseInt(values[2]),
          fenPosition: values[3],
          briefDescription: values[4],
          primaryTag: values[5],
          detailedReflection: values[6],
          createdAt: new Date(values[7]),
          updatedAt: new Date(values[8]),
        },
      });
    }
  }
  console.log(`✓ Imported ${inserts.length} mistakes`);
}

async function importInsights(inserts: string[]) {
  console.log('Importing insights...');
  for (const insert of inserts) {
    const values = parseInsertValues(insert);
    if (values) {
      await prisma.insight.create({
        data: {
          id: values[0],
          content: values[1],
          mistakesAnalyzed: parseInt(values[2]),
          mistakeIdsMap: values[3],
          createdAt: new Date(values[4]),
        },
      });
    }
  }
  console.log(`✓ Imported ${inserts.length} insights`);
}

function parseInsertValues(insert: string): string[] | null {
  const match = insert.match(/VALUES\s*\((.*?)\);/s);
  if (!match) return null;

  const valuesStr = match[1];
  const values: string[] = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];

    if (escape) {
      current += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      continue;
    }

    if (char === ',' && !inString) {
      values.push(current.trim() === 'NULL' ? '' : current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim() === 'NULL' ? '' : current.trim());
  return values;
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
