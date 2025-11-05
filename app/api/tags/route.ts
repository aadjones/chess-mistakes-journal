import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as mistakesRepo from '@/lib/db/mistakes-repository';

const prisma = new PrismaClient();

/**
 * GET /api/tags
 * Get all unique tags (for autocomplete)
 */
export async function GET() {
  try {
    const tags = await mistakesRepo.getUniqueTags(prisma);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
