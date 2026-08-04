'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowIcon, BackIcon } from '@/components/icons';
import { useReveal } from '@/lib/useReveal';
import { formatDate, sortPrompts } from '@/lib/format';
import type { Prompt } from '@/lib/types';

export default function EditPromptPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [promptIndex, setPromptIndex] = useState(-1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (localStorage.getItem('prompt-wall-auth') !== 'true') {
      router.replace('/');
      return;
    }
    setAuthed(true);

    let cancelled = false;
    const start = Date.now();
    fetch('/api/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          const list = sortPrompts(data.data);
          const index = list.findIndex((p: Prompt) => p.id === id);
          if (index === -1) {
            setNotFound(true);
          } else {
            setPromptIndex(index);
            setPrompt(list[index]);
            setTitle(list[index].title);
            setContent(list[index].content);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        // 加载态至少展示 500ms，避免转圈一闪而过
        const remain = 500 - (Date.now() - start);
        setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, Math.max(0, remain));
      });

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(260, ta.scrollHeight)}px`;
  }, [content, loading]);

  useReveal([prompt, authed]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      });
      if (res.ok) {
        router.push(`/prompts/${id}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [id, title, content, saving, router]);

  if (!authed) return null;

  return (
    <>
      {/* FLOATING ISLAND NAV */}
      <nav className="nav-shell">
        <div className="nav-core">
          <Link className="nav-logo" href="/">
            Prompt <em>Wall</em>
          </Link>
          <Link className="btn-ghost" href={`/prompts/${id}`}>
            <BackIcon />
            返回详情
          </Link>
        </div>
      </nav>

      <main className="editor">
        {loading ? (
          <div className="state-note">
            <span className="spinner" />
            加载中…
          </div>
        ) : notFound || !prompt ? (
          <div className="state-note">
            这条提示词不存在
            <br />
            <Link href="/">返回墙</Link>
          </div>
        ) : (
          <>
            <div className="editor-head reveal">
              <div className="eyebrow">
                <span className="dot" />
                Edit Prompt · No. {String(promptIndex + 1).padStart(3, '0')}
              </div>
              <input
                className="title-input"
                type="text"
                placeholder="给这条提示词起个名字"
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
                  <span>上次更新 {formatDate(prompt.updatedAt ?? prompt.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="actions reveal">
              <Link className="btn-ghost" href={`/prompts/${id}`}>
                取消
              </Link>
              <button
                className="btn-pill"
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
              >
                <span>{saving ? '保存中…' : '保存修改'}</span>
                <span className="icon-orb">
                  {saving ? <span className="spinner spinner-sm spinner-light" /> : <ArrowIcon />}
                </span>
              </button>
            </div>
          </>
        )}
      </main>

      <footer>
        <span className="f-serif">Prompt Wall</span>
      </footer>
    </>
  );
}
