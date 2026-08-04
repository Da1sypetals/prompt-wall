'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowIcon, CloseIcon, CopyIcon, EditIcon } from '@/components/icons';
import { CodeEditor, CodeRows } from '@/components/CodeEditor';
import { formatDate } from '@/lib/format';
import type { Prompt } from '@/lib/types';

/* ---------- 侧边抽屉：详情 / 编辑 同一骨架，切换时文本框不动，仅头部按钮原位替换 ---------- */

export function PromptDrawer({
  prompt,
  index,
  onClose,
  onSaved,
  onDeleted,
}: {
  prompt: Prompt;
  index: number;
  onClose: () => void;
  onSaved: (updated: Prompt) => void;
  onDeleted: (id: string) => void;
}) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [saving, setSaving] = useState(false);

  const confirmingRef = useRef(confirming);
  useEffect(() => {
    confirmingRef.current = confirming;
  }, [confirming]);

  const requestClose = useCallback(() => {
    setOpen(false);
    window.setTimeout(onClose, 450);
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmingRef.current) setConfirming(false);
        else requestClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [requestClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch (error) {
      console.error('Copy failed:', error);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [prompt.content]);

  const handleCancel = useCallback(() => {
    setTitle(prompt.title);
    setContent(prompt.content);
    setMode('view');
  }, [prompt.title, prompt.content]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSaved(data.data);
        setMode('view');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [title, content, saving, prompt.id, onSaved]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted(prompt.id);
        return;
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  }, [deleting, prompt.id, onDeleted]);

  const editing = mode === 'edit';

  return (
    <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={requestClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={requestClose} title="关闭">
          <CloseIcon />
        </button>
        <div className="drawer-scroll">
          <div className="detail">
            <div className="detail-head">
              <div>
                <div className="detail-index">
                  <span className="dot" />
                  No. {String(index + 1).padStart(3, '0')}
                </div>
                {editing ? (
                  <input
                    className="title-edit"
                    type="text"
                    placeholder="给这条提示词起个名字"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <h1>{prompt.title}</h1>
                )}
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
                {editing ? (
                  <>
                    <button className="btn-edit" onClick={handleCancel}>
                      取消
                    </button>
                    <button
                      className="btn-copy"
                      onClick={handleSave}
                      disabled={saving || !title.trim() || !content.trim()}
                    >
                      <span>{saving ? '保存中…' : '保存'}</span>
                      <span className="icon-orb">
                        {saving ? (
                          <span className="spinner spinner-sm spinner-light" />
                        ) : (
                          <ArrowIcon />
                        )}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-edit" onClick={() => setMode('edit')}>
                      <EditIcon />
                      编辑
                    </button>
                    <button className={`btn-copy${copied ? ' copied' : ''}`} onClick={handleCopy}>
                      <span>{copied ? '已复制' : '复制 Prompt'}</span>
                      <span className="icon-orb">
                        <CopyIcon />
                      </span>
                    </button>
                    <button className="btn-delete" onClick={() => setConfirming(true)}>
                      删除
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="content-shell">
              <div className="content-core">
                {editing ? (
                  <CodeEditor
                    id="drawerContentInput"
                    value={content}
                    onChange={setContent}
                    placeholder="在这里编写完整的提示词……"
                  />
                ) : (
                  <CodeRows content={prompt.content} />
                )}
              </div>
            </div>

            {editing && (
              <div className="actions">
                <button className="btn-ghost" onClick={handleCancel}>
                  取消
                </button>
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
            )}
          </div>
        </div>
      </aside>

      {confirming && (
        <div className="confirm-overlay" onClick={() => setConfirming(false)}>
          <div className="confirm-shell" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-core">
              <h3>删除这条提示词？</h3>
              <p>「{prompt.title}」将被永久删除，此操作不可撤销。</p>
              <div className="confirm-actions">
                <button className="btn-ghost" onClick={() => setConfirming(false)}>
                  取消
                </button>
                <button className="btn-pill btn-danger" onClick={handleDelete} disabled={deleting}>
                  <span>{deleting ? '删除中…' : '确认删除'}</span>
                  <span className="icon-orb">
                    {deleting ? <span className="spinner spinner-sm spinner-light" /> : <ArrowIcon />}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
