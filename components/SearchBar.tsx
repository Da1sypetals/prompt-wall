'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  contentQuery: string;
  titleQuery: string;
  onContentChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({
  contentQuery,
  titleQuery,
  onContentChange,
  onTitleChange,
  onClear,
}: SearchBarProps) {
  const hasFilters = contentQuery || titleQuery;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
        <Input
          placeholder="Search by title substring"
          value={titleQuery}
          onChange={(e) => onTitleChange(e.target.value)}
          className="pl-10 border-pink-200 focus:border-pink-400"
        />
      </div>
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
        <Input
          placeholder="Search by content substring"
          value={contentQuery}
          onChange={(e) => onContentChange(e.target.value)}
          className="pl-10 border-pink-200 focus:border-pink-400"
        />
      </div>
      <Button
        variant="outline"
        onClick={onClear}
        disabled={!hasFilters}
        className="border-pink-200 hover:bg-pink-50"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  );
}
