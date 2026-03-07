import { NextRequest, NextResponse } from 'next/server';
import { getPromptWallData, setPromptWallData } from '@/lib/redis';
import { Prompt } from '@/lib/types';

// GET /api/prompts/[id] - Get a single prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getPromptWallData();
    const prompt = data.prompts.find((p: Prompt) => p.id === id);
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: prompt });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - Update a prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;
    
    const data = await getPromptWallData();
    const promptIndex = data.prompts.findIndex((p: Prompt) => p.id === id);
    
    if (promptIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    data.prompts[promptIndex] = {
      ...data.prompts[promptIndex],
      title: title || data.prompts[promptIndex].title,
      content: content || data.prompts[promptIndex].content,
      updatedAt: new Date().toISOString(),
    };
    
    await setPromptWallData(data);
    
    return NextResponse.json({ success: true, data: data.prompts[promptIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getPromptWallData();
    const promptIndex = data.prompts.findIndex((p: Prompt) => p.id === id);
    
    if (promptIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    data.prompts.splice(promptIndex, 1);
    await setPromptWallData(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
