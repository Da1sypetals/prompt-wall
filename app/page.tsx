'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, LogOut, LogIn, Loader2, Puzzle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/PromptCard';
import { SearchBar } from '@/components/SearchBar';
import { LoginDialog } from '@/components/LoginDialog';
import { ViewModeSlider } from '@/components/ViewModeSlider';
import { Prompt } from '@/lib/types';

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [contentQuery, setContentQuery] = useState('');
  const [titleQuery, setTitleQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'triple'>('triple');

  // Check auth status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('prompt-wall-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch prompts
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (contentQuery) params.append('content', contentQuery);
      if (titleQuery) params.append('title', titleQuery);

      const response = await fetch(`/api/prompts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPrompts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [contentQuery, titleQuery]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Login handler
  const handleLogin = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('prompt-wall-auth', 'true');
        setShowLogin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('prompt-wall-auth');
    setEditingId(null);
    setIsCreating(false);
  };

  // Create prompt
  const handleCreate = async (title: string, content: string) => {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      setIsCreating(false);
      setNewPromptTitle('');
      setNewPromptContent('');
      fetchPrompts();
    }
  };

  // Update prompt
  const handleUpdate = async (id: string, title: string, content: string) => {
    const response = await fetch(`/api/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      setEditingId(null);
      fetchPrompts();
    }
  };

  // Delete prompt
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    const response = await fetch(`/api/prompts/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchPrompts();
    }
  };

  // Edit handler
  const handleEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setIsCreating(false);
  };

  // Discard edit/create
  const handleDiscard = () => {
    setEditingId(null);
    setIsCreating(false);
    // Note: We don't clear newPromptTitle/Content here to preserve them for next time
  };

  // Toggle new prompt creation
  const toggleNewPrompt = () => {
    if (isCreating) {
      // Close the new prompt form (like discard)
      setIsCreating(false);
    } else {
      // Open the new prompt form
      setEditingId(null);
      setIsCreating(true);
    }
  };

  // Clear filters
  const handleClear = () => {
    setContentQuery('');
    setTitleQuery('');
  };

  // Get preview limits based on view mode
  const getPreviewLimits = () => {
    switch (viewMode) {
      case 'single':
        return { maxChars: 192, maxLines: 8 };
      case 'double':
        return { maxChars: 192, maxLines: 6 };
      case 'triple':
        return { maxChars: 192, maxLines: 4 };
    }
  };

  // Get column count based on view mode
  const getColumnCount = () => {
    switch (viewMode) {
      case 'single':
        return 1;
      case 'double':
        return 2;
      case 'triple':
        return 3;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-pink-600">Prompt Wall</h1>
          <div className="flex items-center gap-3">
            <Link href="/compose">
              <Button
                variant="outline"
                className="border-pink-300 text-pink-600 hover:bg-pink-100"
              >
                <Puzzle className="h-4 w-4 mr-2" />
                拼好prompt
              </Button>
            </Link>
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-pink-300 text-pink-600 hover:bg-pink-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLogin(true)}
                className="border-pink-300 text-pink-600 hover:bg-pink-100"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            contentQuery={contentQuery}
            titleQuery={titleQuery}
            onContentChange={setContentQuery}
            onTitleChange={setTitleQuery}
            onClear={handleClear}
          />
        </div>

        {/* New Prompt Button, View Mode Slider & Loading Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={toggleNewPrompt}
                className="border-pink-300 text-pink-600 hover:bg-pink-100"
              >
                {isCreating ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isCreating ? 'Discard' : 'New Prompt'}
              </Button>
            )}
            <ViewModeSlider mode={viewMode} onChange={setViewMode} />
          </div>
          {loading && (
            <div className="flex items-center text-pink-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Prompts Grid - CSS Masonry Layout */}
        <div 
          className="gap-4"
          style={{
            columnCount: getColumnCount(),
            columnGap: '1rem',
          }}
        >
          {/* New Prompt Card (always at top when creating) */}
          {isCreating && (
            <div style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
              <PromptCard
                colorIndex={0}
                isAuthenticated={isAuthenticated}
                isNew={true}
                initialTitle={newPromptTitle}
                initialContent={newPromptContent}
                onSave={handleCreate}
                onDiscard={handleDiscard}
                onChange={(title, content) => {
                  setNewPromptTitle(title);
                  setNewPromptContent(content);
                }}
              />
            </div>
          )}

          {/* Empty State */}
          {prompts.length === 0 && !isCreating && !loading && (
            <div className="text-center py-12 text-pink-400">
              {contentQuery || titleQuery
                ? 'No prompts match your search'
                : 'No prompts yet. Create one!'}
            </div>
          )}

          {/* Existing Prompts */}
          {prompts.map((prompt, index) => (
            <div key={prompt.id} style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
              <PromptCard
                prompt={prompt}
                colorIndex={index}
                isAuthenticated={isAuthenticated}
                isEditing={editingId === prompt.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={(title, content) => handleUpdate(prompt.id, title, content)}
                onDiscard={handleDiscard}
                previewLimits={getPreviewLimits()}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog isOpen={showLogin} onLogin={handleLogin} />
    </main>
  );
}
