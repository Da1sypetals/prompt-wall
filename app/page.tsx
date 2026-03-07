'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, LogOut, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/PromptCard';
import { SearchBar } from '@/components/SearchBar';
import { LoginDialog } from '@/components/LoginDialog';
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
  };

  // Clear filters
  const handleClear = () => {
    setContentQuery('');
    setTitleQuery('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-pink-600">Prompt Wall</h1>
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

        {/* New Prompt Button & Loading Indicator */}
        {(isAuthenticated || loading) && !isCreating && (
          <div className="mb-6 flex items-center justify-between">
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setIsCreating(true);
                }}
                className="border-pink-300 text-pink-600 hover:bg-pink-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Prompt
              </Button>
            ) : (
              <div />
            )}
            {loading && (
              <div className="flex items-center text-pink-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Prompts Grid */}
        <div className="grid gap-4">
            {/* New Prompt Card (always at top when creating) */}
            {isCreating && (
              <PromptCard
                colorIndex={0}
                isAuthenticated={isAuthenticated}
                isNew={true}
                onSave={handleCreate}
                onDiscard={handleDiscard}
              />
            )}

            {/* Existing Prompts */}
            {prompts.length === 0 && !isCreating && !loading ? (
              <div className="text-center py-12 text-pink-400">
                {contentQuery || titleQuery
                  ? 'No prompts match your search'
                  : 'No prompts yet. Create one!'}
              </div>
            ) : (
              prompts.map((prompt, index) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  colorIndex={isCreating ? index + 1 : index}
                  isAuthenticated={isAuthenticated}
                  isEditing={editingId === prompt.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSave={(title, content) => handleUpdate(prompt.id, title, content)}
                  onDiscard={handleDiscard}
                />
              ))
            )}
          </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog isOpen={showLogin} onLogin={handleLogin} />
    </main>
  );
}
