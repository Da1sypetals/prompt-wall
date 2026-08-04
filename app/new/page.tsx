'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowIcon, BackIcon } from '@/components/icons';
import { useReveal } from '@/lib/useReveal';

export default function NewPromptPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (localStorage.getItem('prompt-wall-auth') !== 'true') {
      router.replace('/');
      return;
    }
    setAuthed(true);
  }, [router]);

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(260, ta.scrollHeight)}px`;
  }, [content]);

  useReveal([authed]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      });
      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [title, content, saving, router]);

  if (!authed) return null;

  return (
    <>
      {/* FLOATING ISLAND NAV */}
      <nav className="nav-shell">
        <div className="nav-core">
          <Link className="nav-logo" href="/">
            Prompt <em>Wall</em>
          </Link>
          <Link className="btn-ghost" href="/">
            <BackIcon />
            返回墙
          </Link>
        </div>
      </nav>

      <main className="editor">
        <div className="editor-head reveal">
          <div className="eyebrow">
            <span className="dot" />
            New Prompt
          </div>
          <input
            className="title-input"
            type="text"
            placeholder="给这条提示词起个名字"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="content-shell reveal">
          <div className="content-core">
            <label className="content-label" htmlFor="contentInput">
              Prompt 内容
            </label>
            <textarea
              className="content-input"
              id="contentInput"
              ref={textareaRef}
              placeholder="在这里编写完整的提示词……"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="content-foot">
              <span>{content.length} 字</span>
              <span>支持多行文本</span>
            </div>
          </div>
        </div>

        <div className="actions reveal">
          <Link className="btn-ghost" href="/">
            取消
          </Link>
          <button
            className="btn-pill"
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
          >
            <span>{saving ? '保存中…' : '保存 Prompt'}</span>
            <span className="icon-orb">
              {saving ? <span className="spinner spinner-sm spinner-light" /> : <ArrowIcon />}
            </span>
          </button>
        </div>
      </main>

      <footer>
        <span className="f-serif">Prompt Wall</span>
      </footer>
    </>
  );
}
