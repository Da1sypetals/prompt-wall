'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Prompt, ComposeItem } from '@/lib/types';
import { PromptSourcePanel } from './PromptSourcePanel';
import { ComposeQueue } from './ComposeQueue';
import { QueueItem } from './QueueItem';

export function ComposeContainer() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [queueItems, setQueueItems] = useState<ComposeItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ComposeItem | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [isDraggingPredefined, setIsDraggingPredefined] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        const data = await response.json();
        if (data.success) {
          setPrompts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const activeData = active.data.current;
    if (activeData?.type === 'predefined') {
      setIsDraggingPredefined(true);
      const prompt = prompts.find((p) => p.id === activeData.promptId);
      if (prompt) {
        setActiveItem({
          id: generateId(),
          type: 'predefined',
          promptId: prompt.id,
          title: prompt.title,
          content: prompt.content,
        });
      }
    } else if (activeData?.type === 'queue-item') {
      const item = queueItems.find((i) => i.id === active.id);
      if (item) {
        setActiveItem(item);
      }
    }
  }, [prompts, queueItems]);

  // Handle drag over - for showing insert indicator when dragging predefined
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setInsertIndex(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Show insert indicator when dragging predefined over queue items
    if (activeData?.type === 'predefined' && overData?.type === 'queue-item') {
      const overIndex = queueItems.findIndex((i) => i.id === over.id);
      if (overIndex !== -1) {
        setInsertIndex(overIndex);
      }
    } else if (activeData?.type === 'predefined' && overData?.type === 'queue-container') {
      setInsertIndex(queueItems.length);
    } else {
      setInsertIndex(null);
    }
  }, [queueItems]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);
    setInsertIndex(null);
    setIsDraggingPredefined(false);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Dropping predefined prompt into queue - insert at specific position
    if (activeData?.type === 'predefined') {
      const prompt = prompts.find((p) => p.id === activeData.promptId);
      if (!prompt) return;

      const newItem: ComposeItem = {
        id: generateId(),
        type: 'predefined',
        promptId: prompt.id,
        title: prompt.title,
        content: prompt.content,
      };

      let targetIndex: number;
      if (overData?.type === 'queue-item') {
        targetIndex = queueItems.findIndex((i) => i.id === over.id);
      } else {
        targetIndex = queueItems.length;
      }

      setQueueItems((prev) => {
        const newItems = [...prev];
        newItems.splice(targetIndex, 0, newItem);
        return newItems;
      });
      return;
    }

    // Reordering within queue
    if (activeData?.type === 'queue-item' && overData?.type === 'queue-item') {
      const oldIndex = queueItems.findIndex((i) => i.id === active.id);
      const newIndex = queueItems.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setQueueItems((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  }, [prompts, queueItems]);

  // Add custom prompt to queue at specific index
  const addCustomPrompt = useCallback((index?: number) => {
    const newItem: ComposeItem = {
      id: generateId(),
      type: 'custom',
      content: '', // Start empty, user edits in place
    };

    setQueueItems((prev) => {
      const targetIndex = index !== undefined ? index : prev.length;
      const newItems = [...prev];
      newItems.splice(targetIndex, 0, newItem);
      return newItems;
    });
  }, []);

  // Remove item from queue
  const removeQueueItem = useCallback((id: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Move item up/down in queue
  const moveItem = useCallback((id: string, direction: 'up' | 'down') => {
    setQueueItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index > 0) {
        return arrayMove(prev, index, index - 1);
      }
      if (direction === 'down' && index < prev.length - 1) {
        return arrayMove(prev, index, index + 1);
      }
      return prev;
    });
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueueItems([]);
  }, []);

  // Update custom item content
  const updateItemContent = useCallback((id: string, newContent: string) => {
    setQueueItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: newContent } : item))
    );
  }, []);

  // Computed result text
  const resultText = useMemo(() => {
    return queueItems.map((item) => item.content).join('\n\n');
  }, [queueItems]);

  // Drop animation config
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-pink-500 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full">
        {/* Left Panel - Source */}
        <div className="lg:col-span-3">
          <PromptSourcePanel prompts={prompts} />
        </div>

        {/* Right Panel - Queue */}
        <div className="lg:col-span-7">
          <SortableContext
            items={queueItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ComposeQueue
              items={queueItems}
              insertIndex={insertIndex}
              resultText={resultText}
              isDraggingPredefined={isDraggingPredefined}
              onRemove={removeQueueItem}
              onMove={moveItem}
              onUpdateContent={updateItemContent}
              onClear={clearQueue}
              onAddCustom={addCustomPrompt}
            />
          </SortableContext>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem && (
          <QueueItem
            item={activeItem}
            isOverlay
            onRemove={() => {}}
            onMove={() => {}}
            onUpdateContent={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
