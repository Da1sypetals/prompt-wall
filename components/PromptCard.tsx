'use client';

import { useState } from 'react';
import { Copy, Pencil, Trash2, Check, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Prompt } from '@/lib/types';

interface PromptCardProps {
  prompt?: Prompt;
  colorIndex: number;
  isAuthenticated: boolean;
  isEditing?: boolean;
  isNew?: boolean;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  onSave?: (title: string, content: string) => void;
  onDiscard?: () => void;
}

// Pink to magenta color spectrum
const cardColors = [
  { bg: 'bg-pink-50', border: 'border-pink-200', title: 'text-pink-700', text: 'text-pink-600', input: 'focus:border-pink-400 focus:ring-pink-200' },
  { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-700', text: 'text-rose-600', input: 'focus:border-rose-400 focus:ring-rose-200' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', title: 'text-fuchsia-700', text: 'text-fuchsia-600', input: 'focus:border-fuchsia-400 focus:ring-fuchsia-200' },
  { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-700', text: 'text-purple-600', input: 'focus:border-purple-400 focus:ring-purple-200' },
  { bg: 'bg-pink-100', border: 'border-pink-300', title: 'text-pink-800', text: 'text-pink-700', input: 'focus:border-pink-500 focus:ring-pink-300' },
  { bg: 'bg-rose-100', border: 'border-rose-300', title: 'text-rose-800', text: 'text-rose-700', input: 'focus:border-rose-500 focus:ring-rose-300' },
];

// Get preview text with max 100 chars OR max 8 lines, whichever comes first
// Ellipsis on separate line
function getPreviewContent(content: string): { text: string; isTruncated: boolean } {
  const maxChars = 150;
  const maxLines = 8;
  
  const lines = content.split('\n');
  
  // Check line limit first
  if (lines.length > maxLines) {
    const truncatedLines = lines.slice(0, maxLines);
    return { text: truncatedLines.join('\n'), isTruncated: true };
  }
  
  // Check char limit
  if (content.length > maxChars) {
    return { text: content.slice(0, maxChars), isTruncated: true };
  }
  
  return { text: content, isTruncated: false };
}

export function PromptCard({
  prompt,
  colorIndex,
  isAuthenticated,
  isEditing = false,
  isNew = false,
  onEdit,
  onDelete,
  onSave,
  onDiscard,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(prompt?.title || '');
  const [editContent, setEditContent] = useState(prompt?.content || '');
  const colors = cardColors[colorIndex % cardColors.length];

  const handleCopy = async () => {
    if (!prompt) return;
    const textToCopy = `# ${prompt.title}\n\n${prompt.content}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    onSave?.(editTitle.trim(), editContent.trim());
  };

  const handleDiscard = () => {
    setEditTitle(prompt?.title || '');
    setEditContent(prompt?.content || '');
    onDiscard?.();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Editing mode
  if (isEditing || isNew) {
    return (
      <Card className={`${colors.bg} ${colors.border} border-2 shadow-lg`}>
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="Edit Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className={`text-xl font-bold bg-white/70 border-${colors.border.split('-')[1]}-200 ${colors.input}`}
          />
          <Textarea
            placeholder="Edit content..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={`bg-white/70 border-${colors.border.split('-')[1]}-200 ${colors.input} resize-none [field-sizing:content] max-h-[24rem] overflow-y-auto`}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="border-pink-300 text-pink-600 hover:bg-pink-100"
            >
              <X className="h-4 w-4 mr-1" />
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editTitle.trim() || !editContent.trim()}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // View mode
  if (!prompt) return null;

  const { text: previewText, isTruncated } = getPreviewContent(prompt.content);
  const needsExpandButton = isTruncated || prompt.content.length > 100 || prompt.content.split('\n').length > 8;
  const displayContent = isExpanded ? prompt.content : previewText;

  return (
    <Card 
      className={`${colors.bg} ${colors.border} border-2 transition-all hover:shadow-lg`}
      onClick={handleCopy}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className={`text-xl font-bold ${colors.title}`}>{prompt.title}</h3>
          <div className="flex gap-2 cursor-default" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={`h-10 w-10 ${colors.text} hover:${colors.bg}`}
              title="Copy prompt"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
            {needsExpandButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className={`h-10 w-10 ${colors.text} hover:${colors.bg}`}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            )}
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(prompt)}
                  className={`h-10 w-10 ${colors.text} hover:${colors.bg}`}
                  title="Edit prompt"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete?.(prompt.id)}
                  className={`h-10 w-10 ${colors.text} hover:${colors.bg} hover:text-red-500`}
                  title="Delete prompt"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`${colors.text} whitespace-pre-wrap`}>{displayContent}</p>
        {!isExpanded && isTruncated && (
          <p className={`${colors.text} mt-1`}>...</p>
        )}
      </CardContent>
    </Card>
  );
}
