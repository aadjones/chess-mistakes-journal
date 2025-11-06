/**
 * Fix off-by-one error in moveIndex values
 * The original migration had the formulas swapped
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getActiveColorFromFEN(fen: string): 'w' | 'b' {
  const parts = fen.split(' ');
  return parts[1] as 'w' | 'b';
}

async function main() {
  console.log('Fixing moveIndex off-by-one error...');

  const mistakes = await prisma.mistake.findMany({
    select: {
      id: true,
      moveIndex: true,
      fenPosition: true,
    },
  });

  console.log(`Found ${mistakes.length} mistakes to check`);

  let fixedCount = 0;

  for (const mistake of mistakes) {
    const activeColor = getActiveColorFromFEN(mistake.fenPosition);

    // The FEN shows whose turn it is AFTER the mistake move
    // moveIndex should be the position AFTER the move was played

    // If it's White's turn in FEN, Black just moved (even moveIndex)
    // If it's Black's turn in FEN, White just moved (odd moveIndex)

    const shouldBeOdd = activeColor === 'b'; // White just moved
    const isOdd = mistake.moveIndex % 2 === 1;

    if (shouldBeOdd !== isOdd) {
      // Off by one! Increment it
      const newMoveIndex = mistake.moveIndex + 1;

      await prisma.mistake.update({
        where: { id: mistake.id },
        data: { moveIndex: newMoveIndex },
      });

      console.log(`✓ Fixed mistake ${mistake.id}: ${mistake.moveIndex} -> ${newMoveIndex}`);
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} mistakes`);
}

main()
  .catch(e => {
    console.error('Fix failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
