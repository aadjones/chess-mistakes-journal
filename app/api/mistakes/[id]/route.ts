import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as mistakesRepo from '@/lib/db/mistakes-repository';
import type { UpdateMistakeInput } from '@/types/mistake';

const prisma = new PrismaClient();

type RouteContext = {
  params: { id: string };
};

/**
 * GET /api/mistakes/[id]
 * Get a single mistake
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const mistake = await mistakesRepo.getMistakeById(prisma, id);

    if (!mistake) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    return NextResponse.json({ mistake });
  } catch (error) {
    console.error('Failed to fetch mistake:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/mistakes/[id]
 * Update a mistake
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();
    const { briefDescription, primaryTag, detailedReflection } = body;

    const update: UpdateMistakeInput = {
      briefDescription,
      primaryTag,
      detailedReflection,
    };

    const mistake = await mistakesRepo.updateMistake(prisma, id, update);

    if (!mistake) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    return NextResponse.json({ mistake });
  } catch (error) {
    console.error('Failed to update mistake:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/mistakes/[id]
 * Delete a mistake
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    await mistakesRepo.deleteMistake(prisma, id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete mistake:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
