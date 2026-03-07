import { NextRequest, NextResponse } from 'next/server';
import { getPromptWallData, setPromptWallData } from '@/lib/redis';
import { Prompt } from '@/lib/types';

// GET /api/prompts - Get all prompts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const titleQuery = searchParams.get('title')?.toLowerCase();
    const contentQuery = searchParams.get('content')?.toLowerCase();
    
    const data = await getPromptWallData();
    let prompts = data.prompts;
    
    // Filter by title substring
    if (titleQuery) {
      prompts = prompts.filter((p: Prompt) => 
        p.title.toLowerCase().includes(titleQuery)
      );
    }
    
    // Filter by content substring
    if (contentQuery) {
      prompts = prompts.filter((p: Prompt) => 
        p.content.toLowerCase().includes(contentQuery)
      );
    }
    
    return NextResponse.json({ success: true, data: prompts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const data = await getPromptWallData();
    
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    
    data.prompts.push(newPrompt);
    await setPromptWallData(data);
    
    return NextResponse.json({ success: true, data: newPrompt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
