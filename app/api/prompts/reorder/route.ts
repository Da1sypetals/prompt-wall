import { NextRequest, NextResponse } from 'next/server';
import { getPromptWallData, setPromptWallData } from '@/lib/redis';
import { Prompt } from '@/lib/types';

// PUT /api/prompts/reorder - Reorder all prompts by ids order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids }: { ids: string[] } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: 'ids must be an array' },
        { status: 400 }
      );
    }

    const data = await getPromptWallData();

    const stockIds = data.prompts.map((p: Prompt) => p.id).sort();
    const sortedIds = [...ids].sort();

    if (JSON.stringify(sortedIds) !== JSON.stringify(stockIds)) {
      return NextResponse.json(
        { success: false, error: 'ids mismatch' },
        { status: 409 }
      );
    }

    const orderById = new Map(ids.map((id, index) => [id, index]));
    for (const p of data.prompts) {
      p.order = orderById.get(p.id) ?? p.order;
    }

    await setPromptWallData(data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to reorder prompts' },
      { status: 500 }
    );
  }
}
