'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BackIcon, CopyIcon, EditIcon } from '@/components/icons';
import { useReveal } from '@/lib/useReveal';
import { formatDate, sortPrompts } from '@/lib/format';
import type { Prompt } from '@/lib/types';

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    fetch('/api/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) setPrompts(sortPrompts(data.data));
        else setPrompts([]);
      })
      .catch(() => {
        if (!cancelled) setPrompts([]);
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
  }, [id]);

  useReveal([prompts, loading]);

  const index = prompts ? prompts.findIndex((p) => p.id === id) : -1;
  const prompt = prompts && index >= 0 ? prompts[index] : null;

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch (error) {
      console.error('Copy failed:', error);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [prompt]);

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

      <main className="detail">
        {loading ? (
          <div className="state-note">
            <span className="spinner" />
            加载中…
          </div>
        ) : !prompt ? (
          <div className="state-note">
            这条提示词不存在
            <br />
            <Link href="/">返回墙</Link>
          </div>
        ) : (
          <>
            <div className="detail-head reveal">
              <div>
                <div className="detail-index">
                  <span className="dot" />
                  No. {String(index + 1).padStart(3, '0')}
                </div>
                <h1>{prompt.title}</h1>
                <div className="detail-meta">
                  <span>{formatDate(prompt.createdAt)}</span>
                  {prompt.updatedAt && (
                    <>
                      <span className="sep" />
                      <span>Updated {formatDate(prompt.updatedAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="head-actions">
                <Link className="btn-edit" href={`/prompts/${id}/edit`}>
                  <EditIcon />
                  编辑
                </Link>
                <button
                  type="button"
                  className={`btn-copy${copied ? ' copied' : ''}`}
                  onClick={handleCopy}
                >
                  <span>{copied ? '已复制' : '复制 Prompt'}</span>
                  <span className="icon-orb">
                    <CopyIcon />
                  </span>
                </button>
              </div>
            </div>

            <div className="content-shell reveal" style={{ transitionDelay: '100ms' }}>
              <div className="content-core">
                <div className="content-body">{prompt.content}</div>
              </div>
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
