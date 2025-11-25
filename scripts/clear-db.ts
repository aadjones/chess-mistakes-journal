import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing database...');

  // Delete in order due to foreign key constraints
  await prisma.mistake.deleteMany({});
  console.log('Deleted all mistakes');

  await prisma.game.deleteMany({});
  console.log('Deleted all games');

  await prisma.insight.deleteMany({});
  console.log('Deleted all insights');

  console.log('✅ Database cleared!');
}

clearDatabase()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
