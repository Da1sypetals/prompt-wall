'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComposeItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

interface QueueItemProps {
  item: ComposeItem;
  index?: number;
  totalItems?: number;
  isOverlay?: boolean;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onUpdateContent: (id: string, content: string) => void;
}

export function QueueItem({
  item,
  index = 0,
  totalItems = 1,
  isOverlay = false,
  onRemove,
  onMove,
  onUpdateContent,
}: QueueItemProps) {
  // Auto-enter edit mode for custom items with empty content
  const [isEditing, setIsEditing] = useState(item.type === 'custom' && !item.content);
  const [editContent, setEditContent] = useState(item.content);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'queue-item',
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isFirst = index === 0;
  const isLast = index === totalItems - 1;

  // Get preview for display: max 2 lines or 20 chars
  const getDisplayContent = (content: string): string => {
    const lines = content.split('\n');
    if (lines.length > 2) {
      return lines.slice(0, 2).join('\n') + '\n...';
    }
    if (content.length > 20) {
      return content.slice(0, 20) + '...';
    }
    return content;
  };

  const displayContent = getDisplayContent(item.content);

  const handleSaveEdit = () => {
    onUpdateContent(item.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(item.content);
    setIsEditing(false);
  };

  // Color scheme based on type
  const colors =
    item.type === 'predefined'
      ? {
          bg: 'bg-pink-50',
          border: 'border-pink-200',
          headerBg: 'bg-pink-100/50',
          title: 'text-pink-800',
          text: 'text-pink-600',
          icon: 'text-pink-500',
        }
      : {
          bg: 'bg-green-50',
          border: 'border-green-200',
          headerBg: 'bg-green-100/50',
          title: 'text-green-800',
          text: 'text-green-600',
          icon: 'text-green-500',
        };

  if (isOverlay) {
    return (
      <Card className={`${colors.bg} ${colors.border} border-2 shadow-xl opacity-90 rotate-2 scale-105`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <GripVertical className={`h-5 w-5 ${colors.icon} mt-0.5`} />
            <div className="flex-1 min-w-0">
              {item.type === 'predefined' && item.title && (
                <h4 className={`font-semibold text-sm ${colors.title} truncate`}>
                  {item.title}
                </h4>
              )}
              <p className={`text-xs ${colors.text} mt-1 whitespace-pre-wrap`}>
                {displayContent.slice(0, 100)}
                {displayContent.length > 100 && '...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={`${colors.bg} ${colors.border} border-2 transition-all ${
          isDragging ? 'opacity-30 shadow-lg' : 'hover:shadow-md'
        }`}
      >
        <CardContent className="p-3">
          {/* Header */}
          <div className={`${colors.headerBg} -mx-3 -mt-3 px-3 py-2 rounded-t-lg mb-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div {...listeners} className="cursor-grab active:cursor-grabbing">
                  <GripVertical className={`h-4 w-4 ${colors.icon}`} />
                </div>
                {item.type === 'predefined' ? (
                  <>
                    <FileText className={`h-4 w-4 ${colors.icon}`} />
                    <span className={`text-xs font-medium ${colors.title}`}>
                      #{index + 1} {item.title}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`h-4 w-4 ${colors.icon}`} />
                    <span className={`text-xs font-medium ${colors.title}`}>
                      #{index + 1} Custom
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Move buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${colors.text} hover:bg-white/50`}
                  disabled={isFirst}
                  onClick={() => onMove(item.id, 'up')}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${colors.text} hover:bg-white/50`}
                  disabled={isLast}
                  onClick={() => onMove(item.id, 'down')}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* Edit button (only for custom) */}
                {item.type === 'custom' && !isEditing && !isConfirmingDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 text-xs ${colors.text} hover:bg-white/50`}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    edit
                  </Button>
                )}

                {/* Remove/Confirm button */}
                {item.type === 'custom' && isConfirmingDelete ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-medium"
                      onClick={() => {
                        onRemove(item.id);
                        setIsConfirmingDelete(false);
                      }}
                    >
                      confirm delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsConfirmingDelete(false)}
                    >
                      cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-pink-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (item.type === 'custom') {
                        setIsConfirmingDelete(true);
                      } else {
                        onRemove(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-white/70 border-pink-200 focus:border-pink-400 text-sm min-h-[80px] resize-none"
              />
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-pink-600 hover:bg-pink-100"
                  onClick={handleCancelEdit}
                >
                  <X className="h-3 w-3 mr-1" />
                  取消
                </Button>
                <Button
                  size="sm"
                  className="h-7 bg-pink-500 hover:bg-pink-600"
                  onClick={handleSaveEdit}
                >
                  <Check className="h-3 w-3 mr-1" />
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <p className={`text-xs ${colors.text} whitespace-pre-wrap`}>{displayContent}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
