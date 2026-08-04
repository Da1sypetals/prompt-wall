'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowIcon, CloseIcon } from '@/components/icons';
import { CodeEditor } from '@/components/CodeEditor';
import type { Prompt } from '@/lib/types';

/* ---------- 新建 Prompt 抽屉：不离开当前页 ---------- */

export function NewPromptDrawer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (created: Prompt) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const requestClose = useCallback(() => {
    setOpen(false);
    window.setTimeout(onClose, 450);
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [requestClose]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onCreated(data.data);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [title, content, saving, onCreated]);

  const disabled = saving || !title.trim() || !content.trim();

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
                  New Prompt
                </div>
                <input
                  className="title-edit"
                  type="text"
                  placeholder="给这条提示词起个名字"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="head-actions">
                <button className="btn-edit" onClick={requestClose}>
                  取消
                </button>
                <button className="btn-copy" onClick={handleSave} disabled={disabled}>
                  <span>{saving ? '保存中…' : '保存'}</span>
                  <span className="icon-orb">
                    {saving ? <span className="spinner spinner-sm spinner-light" /> : <ArrowIcon />}
                  </span>
                </button>
              </div>
            </div>

            <div className="content-shell">
              <div className="content-core">
                <CodeEditor
                  id="newPromptContentInput"
                  value={content}
                  onChange={setContent}
                  placeholder="在这里编写完整的提示词……"
                />
              </div>
            </div>

            <div className="actions">
              <button className="btn-ghost" onClick={requestClose}>
                取消
              </button>
              <button className="btn-pill" onClick={handleSave} disabled={disabled}>
                <span>{saving ? '保存中…' : '保存 Prompt'}</span>
                <span className="icon-orb">
                  {saving ? <span className="spinner spinner-sm spinner-light" /> : <ArrowIcon />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
