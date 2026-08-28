import { NextRequest, NextResponse } from 'next/server';
import { getPromptWallData } from '@/lib/redis';
import { sortPrompts } from '@/lib/format';

// GET /api/raw/order/[index] - 按 order 排序后取第 index 张卡片
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  const { index } = await params;

  if (!/^\d+$/.test(index)) {
    return NextResponse.json(
      { success: false, error: 'Invalid index' },
      { status: 400 }
    );
  }

  const position = Number(index);
  const data = await getPromptWallData();
  const prompts = sortPrompts(data.prompts);

  if (position >= prompts.length) {
    return NextResponse.json(
      { success: false, error: 'Index out of range' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: prompts[position] });
}
