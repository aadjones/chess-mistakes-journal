import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.game.count();
  const games = await prisma.game.findMany({ select: { id: true }, take: 5 });
  console.log('Total games:', count);
  console.log('Sample game IDs:');
  games.forEach(g => console.log('  ', g.id));
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
