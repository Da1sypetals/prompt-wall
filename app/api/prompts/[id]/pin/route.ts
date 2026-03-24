import { NextRequest, NextResponse } from 'next/server';
import { getPromptWallData, setPromptWallData } from '@/lib/redis';
import { Prompt } from '@/lib/types';

// PATCH /api/prompts/[id]/pin - Pin, bubble, or unpin a prompt
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action }: { action: 'pin' | 'bubble' | 'unpin' } = body;

    if (!['pin', 'bubble', 'unpin'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be pin, bubble, or unpin' },
        { status: 400 }
      );
    }

    const data = await getPromptWallData();
    const promptIndex = data.prompts.findIndex((p: Prompt) => p.id === id);

    if (promptIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (action === 'pin') {
      const maxOrder = data.prompts.reduce(
        (max: number, p: Prompt) =>
          p.pinnedOrder !== undefined ? Math.max(max, p.pinnedOrder) : max,
        -1
      );
      data.prompts[promptIndex].pinnedOrder = maxOrder + 1;
      data.prompts[promptIndex].updatedAt = new Date().toISOString();
    } else if (action === 'bubble') {
      // Increment all existing pinned cards' order by 1
      for (const p of data.prompts) {
        if (p.pinnedOrder !== undefined) {
          p.pinnedOrder += 1;
        }
      }
      // Place this card at the front (order 0)
      data.prompts[promptIndex].pinnedOrder = 0;
      data.prompts[promptIndex].updatedAt = new Date().toISOString();
    } else if (action === 'unpin') {
      delete data.prompts[promptIndex].pinnedOrder;
      data.prompts[promptIndex].updatedAt = new Date().toISOString();
    }

    await setPromptWallData(data);

    return NextResponse.json({ success: true, data: data.prompts[promptIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update pin status' },
      { status: 500 }
    );
  }
}
