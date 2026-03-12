'use client';

import { useDraggable } from '@dnd-kit/core';
import { Prompt } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface PromptSourceItemProps {
  prompt: Prompt;
  index: number;
}

function PromptSourceItem({ prompt, index }: PromptSourceItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `source-${prompt.id}`,
    data: {
      type: 'predefined',
      promptId: prompt.id,
    },
  });

  // Get preview text: max 2 lines or 20 chars
  const getPreview = (content: string): string => {
    const lines = content.split('\n');
    if (lines.length > 2) {
      return lines.slice(0, 2).join('\n');
    }
    if (content.length > 20) {
      return content.slice(0, 20);
    }
    return content;
  };

  const preview = getPreview(prompt.content);
  const isTruncated = prompt.content.length > 20 || prompt.content.split('\n').length > 2;

  // Pink to magenta color spectrum (matching PromptCard)
  const cardColors = [
    { bg: 'bg-pink-50', border: 'border-pink-200', title: 'text-pink-800', text: 'text-pink-600' },
    { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-800', text: 'text-rose-600' },
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', title: 'text-fuchsia-800', text: 'text-fuchsia-600' },
    { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', text: 'text-purple-600' },
  ];
  const colors = cardColors[index % cardColors.length];

  return (
    <Card
      ref={setNodeRef}
      className={`${colors.bg} ${colors.border} border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? 'opacity-50 scale-105 shadow-lg' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className={`h-4 w-4 ${colors.text} mt-0.5 flex-shrink-0 opacity-50`} />
          <div className="min-w-0 flex-1">
            <h4 className={`font-semibold text-sm ${colors.title} truncate`}>
              {prompt.title}
            </h4>
            <p className={`text-xs ${colors.text} mt-1 whitespace-pre-wrap line-clamp-2`}>
              {preview}
              {isTruncated && '...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PromptSourcePanelProps {
  prompts: Prompt[];
}

export function PromptSourcePanel({ prompts }: PromptSourcePanelProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-pink-200 p-4 shadow-sm h-[calc(100vh-140px)] flex flex-col">
      <h3 className="text-lg font-bold text-pink-700 mb-3 flex items-center gap-2 shrink-0">
        <span>Predefined Prompts</span>
        <span className="text-xs font-normal text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">
          {prompts.length}
        </span>
      </h3>
      <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-pink-400 text-sm">
            暂无 predefined prompts
          </div>
        ) : (
          prompts.map((prompt, index) => (
            <PromptSourceItem key={prompt.id} prompt={prompt} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
