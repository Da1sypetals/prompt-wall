'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ComposeItem } from '@/lib/types';
import { QueueItem } from './QueueItem';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Trash2, Plus, Sparkles, Copy, Check } from 'lucide-react';

interface ComposeQueueProps {
  items: ComposeItem[];
  insertIndex: number | null;
  resultText: string;
  isDraggingPredefined?: boolean;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onUpdateContent: (id: string, content: string) => void;
  onClear: () => void;
  onAddCustom: (index?: number) => void;
}

// Insert slot component - shows insert button on hover, or just line when dragging
function InsertSlot({
  isActive,
  onAddCustom,
}: {
  isActive: boolean;
  onAddCustom: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-6 -my-1 z-10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isHovered && onAddCustom()}
    >
      {/* Always show line when active (dragging), or show button on hover */}
      {isActive && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="h-0.5 flex-1 bg-pink-400" />
        </div>
      )}
      {isHovered && !isActive && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="h-0.5 flex-1 bg-pink-400" />
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 mx-2 bg-white border-pink-400 text-pink-600 hover:bg-pink-50 text-xs whitespace-nowrap"
          >
            <Plus className="h-3 w-3 mr-1" />
            插入 Custom
          </Button>
          <div className="h-0.5 flex-1 bg-pink-400" />
        </div>
      )}
    </div>
  );
}

export function ComposeQueue({
  items,
  insertIndex,
  resultText,
  isDraggingPredefined = false,
  onRemove,
  onMove,
  onUpdateContent,
  onClear,
  onAddCustom,
}: ComposeQueueProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'queue-container',
    data: {
      type: 'queue-container',
    },
  });
  const [copied, setCopied] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Show focus effect when dragging predefined (either over container or over items)
  const showFocus = isOver || (isDraggingPredefined && insertIndex !== null);

  const handleCopy = async () => {
    if (!resultText.trim()) return;
    await navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      ref={setNodeRef}
      className={`bg-white/60 backdrop-blur-sm border-2 transition-all h-[calc(100vh-140px)] flex flex-col ${
        showFocus ? 'border-pink-400 bg-pink-50/80 shadow-lg' : 'border-pink-200'
      }`}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-2xl font-extrabold text-pink-700 flex items-center gap-2">
            <Layers className="h-6 w-6" />
            组装队列
            <span className="text-sm font-normal text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </h3>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!resultText.trim()}
              className={`border-pink-300 transition-all ${
                copied
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'text-pink-600 hover:bg-pink-100'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddCustom()}
              className="border-pink-300 text-pink-600 hover:bg-pink-100"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              添加 Custom
            </Button>
            {items.length > 0 && (
              isConfirmingClear ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsConfirmingClear(false)}
                  >
                    cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-medium"
                    onClick={() => {
                      onClear();
                      setIsConfirmingClear(false);
                    }}
                  >
                    confirm clear
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfirmingClear(true)}
                  className="text-pink-500 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  清空
                </Button>
              )
            )}
          </div>
        </div>

        <div className="space-y-0 overflow-y-auto flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="text-center py-16 text-pink-400 border-2 border-dashed border-pink-200 rounded-lg">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>拖拽左侧 prompt 到此处</p>
              <p className="text-sm mt-1 opacity-70">或点击上方"添加 Custom"</p>
            </div>
          ) : (
            <>
              {/* Insert slot at the very beginning */}
              <InsertSlot isActive={insertIndex === 0} onAddCustom={() => onAddCustom(0)} />

              {items.map((item, index) => (
                <div key={item.id}>
                  <QueueItem
                    item={item}
                    index={index}
                    totalItems={items.length}
                    colorIndex={item.colorIndex}
                    onRemove={onRemove}
                    onMove={onMove}
                    onUpdateContent={onUpdateContent}
                  />
                  {/* Insert slot after this item */}
                  <InsertSlot isActive={insertIndex === index + 1} onAddCustom={() => onAddCustom(index + 1)} />
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
