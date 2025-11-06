/**
 * Migration script to populate moveIndex from moveNumber
 *
 * This script reads existing mistakes with moveNumber and FEN positions,
 * and calculates the correct moveIndex based on which player's turn it is
 * in the FEN position.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extracts whose turn it is from a FEN string
 * @param fen - FEN position string
 * @returns 'w' for white's turn, 'b' for black's turn
 */
function getActiveColorFromFEN(fen: string): 'w' | 'b' {
  const parts = fen.split(' ');
  return parts[1] as 'w' | 'b';
}

/**
 * Calculates moveIndex from moveNumber and active color in FEN
 *
 * The FEN shows the position AFTER the mistake was made, so:
 * - If FEN shows it's White's turn, the mistake was Black's last move
 * - If FEN shows it's Black's turn, the mistake was White's move
 *
 * @param moveNumber - The move number (1, 2, 3, etc.)
 * @param fenPosition - FEN string showing position after the mistake
 * @returns The moveIndex (0-based position in moves array)
 */
function calculateMoveIndex(moveNumber: number, fenPosition: string): number {
  const activeColor = getActiveColorFromFEN(fenPosition);

  if (activeColor === 'w') {
    // It's White's turn in the FEN, so the mistake was Black's previous move
    // Black's move number N ends at index N*2
    return moveNumber * 2;
  } else {
    // It's Black's turn in the FEN, so the mistake was White's move
    // White's move number N ends at index (N-1)*2 + 1
    return (moveNumber - 1) * 2 + 1;
  }
}

async function main() {
  console.log('Starting migration: moveNumber -> moveIndex');

  // Get all mistakes
  const mistakes = await prisma.mistake.findMany({
    select: {
      id: true,
      moveNumber: true,
      fenPosition: true,
    },
  });

  console.log(`Found ${mistakes.length} mistakes to migrate`);

  let successCount = 0;
  let errorCount = 0;

  for (const mistake of mistakes) {
    try {
      const moveIndex = calculateMoveIndex(mistake.moveNumber, mistake.fenPosition);

      await prisma.mistake.update({
        where: { id: mistake.id },
        data: { moveIndex },
      });

      console.log(
        `✓ Migrated mistake ${mistake.id}: moveNumber=${mistake.moveNumber} -> moveIndex=${moveIndex}`
      );
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to migrate mistake ${mistake.id}:`, error);
      errorCount++;
    }
  }

  console.log('\nMigration complete!');
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
