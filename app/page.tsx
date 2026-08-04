'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { LoginDialog } from '@/components/LoginDialog';
import { PromptDrawer } from '@/components/PromptDrawer';
import { ArrowIcon, CopyIcon, GripIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { useReveal } from '@/lib/useReveal';
import { sortPrompts } from '@/lib/format';
import type { Prompt } from '@/lib/types';

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
  height: number;
  index: number;
  left: number;
  top: number;
  width: number;
}

/* ---------- 卡片：左 70% 粉底点击复制，右 30% 白底点击进详情，抓手在卡片右上角 ---------- */

interface CardProps {
  prompt: Prompt;
  index: number;
  isDragging: boolean;
  dragRect?: { left: number; top: number; width: number };
  isAuthenticated: boolean;
  copied: boolean;
  onCopy: (prompt: Prompt) => void;
  onOpenDetail: (prompt: Prompt) => void;
  onGripPointerDown: (e: React.PointerEvent, id: string) => void;
  registerRef: (el: HTMLDivElement | null, id: string) => void;
}

function Card({
  prompt,
  index,
  isDragging,
  dragRect,
  isAuthenticated,
  copied,
  onCopy,
  onOpenDetail,
  onGripPointerDown,
  registerRef,
}: CardProps) {
  const style: React.CSSProperties = { transitionDelay: `${(index % 3) * 60}ms` };
  if (isDragging && dragRect) {
    Object.assign(style, {
      position: 'fixed',
      left: dragRect.left,
      top: dragRect.top,
      width: dragRect.width,
      margin: 0,
      zIndex: 30,
      pointerEvents: 'none',
      cursor: 'grabbing',
      boxShadow: '0 24px 48px -16px rgba(59, 40, 44, 0.22)',
    });
  }

  const text = prompt.content.replace(/\s+/g, ' ').trim();
  const preview = text.length > 12 ? text.slice(0, 12) + '...' : text;

  return (
    <div
      className="card-shell reveal"
      style={style}
      ref={(el) => registerRef(el, prompt.id)}
    >
      <div className="card-split">
        <div className="card-zone-copy" onClick={() => onCopy(prompt)}>
          <div className="card-top">
            <span className="card-index">No. {String(index + 1).padStart(3, '0')}</span>
          </div>
          <div className="card-text">
            <h2 className="card-title">{prompt.title}</h2>
            {preview && <p className="card-preview">{preview}</p>}
          </div>
          <div className="card-actions">
            <span className={`card-copy${copied ? ' copied' : ''}`}>
              <span className="copy-label">{copied ? '已复制' : '复制'}</span>
              <span className="icon-orb">
                <CopyIcon />
              </span>
            </span>
          </div>
        </div>
        <div
          className="card-zone-detail"
          title="查看详情"
          onClick={() => onOpenDetail(prompt)}
        >
          <span className="card-arrow">
            <ArrowIcon />
          </span>
        </div>
      </div>
      {isAuthenticated && (
        <span
          className="card-grip"
          title="拖拽排序"
          onPointerDown={(e) => onGripPointerDown(e, prompt.id)}
        >
          <GripIcon />
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [holeIndex, setHoleIndex] = useState<number | null>(null);

  const wallRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef(new Map<string, HTMLDivElement>());
  const dragRef = useRef<DragState | null>(null);
  const holeIndexRef = useRef<number | null>(null);
  const promptsRef = useRef<Prompt[]>([]);
  const queryRef = useRef('');
  const authedRef = useRef(false);

  useEffect(() => {
    promptsRef.current = prompts;
  }, [prompts]);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    authedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    if (localStorage.getItem('prompt-wall-auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchPrompts = useCallback(async () => {
    const start = Date.now();
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      if (data.success) {
        setPrompts(sortPrompts(data.data));
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      // 加载态至少展示 500ms，避免转圈一闪而过
      const remain = 500 - (Date.now() - start);
      window.setTimeout(() => setLoading(false), Math.max(0, remain));
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleLogin = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
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
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('prompt-wall-auth');
  }, []);

  const handleCopy = useCallback(async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch (error) {
      console.error('Copy failed:', error);
    }
    setCopiedId(prompt.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === prompt.id ? null : prev));
    }, 1600);
  }, []);

  const handleOpenDetail = useCallback((prompt: Prompt) => {
    setDrawerId(prompt.id);
  }, []);

  const handleDrawerSaved = useCallback((updated: Prompt) => {
    setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const handleDrawerDeleted = useCallback((id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    setDrawerId(null);
  }, []);

  const refreshFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      if (data.success) setPrompts(sortPrompts(data.data));
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, []);

  const submitOrder = useCallback(
    async (ids: string[]) => {
      try {
        const res = await fetch('/api/prompts/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) {
          await refreshFromServer();
        }
      } catch (error) {
        console.error('Reorder failed:', error);
        await refreshFromServer();
      }
    },
    [refreshFromServer]
  );

  const registerCardRef = useCallback((el: HTMLDivElement | null, id: string) => {
    if (el) cardEls.current.set(id, el);
    else cardEls.current.delete(id);
  }, []);

  /* ---------- 歌单式拖拽排序（抓手）：卡片不移出列表，仅 fixed 脱离文档流 ---------- */

  const commitDrop = useCallback(
    (id: string, idx: number | null) => {
      const current = promptsRef.current;
      const dragged = current.find((p) => p.id === id);
      holeIndexRef.current = null;
      dragRef.current = null;
      if (!dragged) {
        setHoleIndex(null);
        setDrag(null);
        return;
      }
      const rest = current.filter((p) => p.id !== id);
      const insertAt = idx === null ? rest.length : Math.max(0, Math.min(idx, rest.length));
      const next = [...rest];
      next.splice(insertAt, 0, dragged);

      // 同步完成重排：React 把卡片节点移入新格子并移除 fixed 相关样式，视觉零位移
      flushSync(() => {
        setPrompts(next);
        setHoleIndex(null);
        setDrag(null);
      });
      const cardEl = cardEls.current.get(id);
      if (cardEl) {
        cardEl.style.removeProperty('transition');
        cardEl.style.removeProperty('transform');
      }
      submitOrder(next.map((p) => p.id));
    },
    [submitOrder]
  );

  const onDragMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const cardEl = cardEls.current.get(d.id);
    if (cardEl) {
      cardEl.style.left = `${e.clientX - d.offsetX}px`;
      cardEl.style.top = `${e.clientY - d.offsetY}px`;
    }
    const wallEl = wallRef.current;
    if (!wallEl) return;
    const wallRect = wallEl.getBoundingClientRect();
    const px = e.clientX - wallRect.left;
    const py = e.clientY - wallRect.top;

    /* 布局坐标（offsetLeft/Top，不受 FLIP transform 影响）判定指针落在哪张卡片的格子内 */
    let targetId: string | null = null;
    for (const [id, el] of cardEls.current) {
      if (id === d.id) continue;
      if (
        px >= el.offsetLeft &&
        px <= el.offsetLeft + el.offsetWidth &&
        py >= el.offsetTop &&
        py <= el.offsetTop + el.offsetHeight
      ) {
        targetId = id;
        break;
      }
    }
    if (!targetId) return;

    const order = promptsRef.current.filter((p) => p.id !== d.id);
    const targetIndex = order.findIndex((p) => p.id === targetId);
    if (targetIndex < 0) return;
    const hi = holeIndexRef.current;
    if (hi === null) return;
    // 拖到某张卡片上 = 空槽换到它的位置：空槽在其前则移到它之后，在其后则移到它之前
    const next = targetIndex >= hi ? targetIndex + 1 : targetIndex;
    if (next === hi) return;

    /* FLIP：记录位置 → 变更 DOM → 反向偏移 → 过渡回 0（跳过被拖卡片） */
    const before = new Map<string, DOMRect>();
    for (const [id, el] of cardEls.current) {
      if (id === d.id) continue;
      before.set(id, el.getBoundingClientRect());
    }
    holeIndexRef.current = next;
    flushSync(() => setHoleIndex(next));
    for (const [id, el] of cardEls.current) {
      if (id === d.id) continue;
      const first = before.get(id);
      if (!first) continue;
      const last = el.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (!dx && !dy) continue;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
        el.style.transform = '';
        const cleanup = () => {
          el.style.transition = '';
          el.removeEventListener('transitionend', cleanup);
        };
        el.addEventListener('transitionend', cleanup);
      });
    }
  }, []);

  const onDragEnd = useCallback(() => {
    window.removeEventListener('pointermove', onDragMove);
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    document.body.classList.remove('dragging');

    const cardEl = cardEls.current.get(d.id);
    const wallEl = wallRef.current;
    const spacerEl = wallEl?.querySelector('.card-spacer') as HTMLElement | null;

    if (cardEl && spacerEl) {
      const dest = spacerEl.getBoundingClientRect();
      const current = cardEl.getBoundingClientRect();
      const dx = dest.left - current.left;
      const dy = dest.top - current.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        // 已在空槽位置：坐标对齐空槽后直接落位
        cardEl.style.left = `${dest.left}px`;
        cardEl.style.top = `${dest.top}px`;
        commitDrop(d.id, holeIndexRef.current);
        return;
      }
      // 飞入空槽，然后落位
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        // 先把 fixed 坐标对齐空槽、清掉 transform，再落位，避免闪回原格
        cardEl.style.transition = 'none';
        cardEl.style.transform = '';
        cardEl.style.left = `${dest.left}px`;
        cardEl.style.top = `${dest.top}px`;
        commitDrop(d.id, holeIndexRef.current);
      };
      cardEl.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
      cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
      cardEl.addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 450);
    } else {
      commitDrop(d.id, holeIndexRef.current);
    }
  }, [onDragMove, commitDrop]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onDragMove);
    };
  }, [onDragMove]);

  const onGripPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (!authedRef.current || queryRef.current) return;
      e.preventDefault();
      const card = cardEls.current.get(id);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const index = promptsRef.current.findIndex((p) => p.id === id);

      const d: DragState = {
        id,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        height: rect.height,
        index,
        left: rect.left,
        top: rect.top,
        width: rect.width,
      };
      dragRef.current = d;
      holeIndexRef.current = index;
      document.body.classList.add('dragging');
      setDrag(d);
      setHoleIndex(index);

      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup', onDragEnd, { once: true });
      window.addEventListener('pointercancel', onDragEnd, { once: true });
    },
    [onDragMove, onDragEnd]
  );

  useReveal([prompts, query, loading, isAuthenticated]);

  const dragging = drag !== null;
  const normalizedQuery = query.trim().toLowerCase();
  const visible = normalizedQuery
    ? prompts.filter((p) => p.title.toLowerCase().includes(normalizedQuery))
    : prompts;
  const restLen = dragging ? visible.length - 1 : visible.length;
  const drawerIndex = drawerId ? prompts.findIndex((p) => p.id === drawerId) : -1;
  const drawerPrompt = drawerIndex >= 0 ? prompts[drawerIndex] : null;

  return (
    <>
      {/* FLOATING ISLAND NAV */}
      <nav className="nav-shell">
        <div className="nav-core">
          <Link className="nav-logo" href="/">
            Prompt <em>Wall</em>
          </Link>
          {isAuthenticated ? (
            <button className="btn-ghost" onClick={handleLogout}>
              登出
            </button>
          ) : (
            <button className="btn-ghost" onClick={() => setShowLogin(true)}>
              登录
            </button>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <header className="hero">
        <h1>
          Prompt <em>Wall</em>
        </h1>
        <div className="nav-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="搜索标题…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="hero-count">— 共 {visible.length} 条提示词</span>
      </header>

      {/* WALL */}
      <main className="wall" ref={wallRef} id="wall">
        {loading ? (
          <div className="state-note" style={{ gridColumn: '1 / -1' }}>
            <span className="spinner" />
            加载中…
          </div>
        ) : visible.length === 0 ? (
          <div className="state-note" style={{ gridColumn: '1 / -1' }}>
            {query ? '没有匹配的提示词' : '还没有提示词'}
          </div>
        ) : (
          <>
            {visible.map((prompt, i) => {
              const isDragged = dragging && prompt.id === drag.id;
              const restIndex = isDragged ? -1 : i - (dragging && i > drag.index ? 1 : 0);
              return (
                <Fragment key={prompt.id}>
                  {dragging && !isDragged && restIndex === holeIndex && (
                    <div className="card-spacer" style={{ height: drag.height }} />
                  )}
                  <Card
                    prompt={prompt}
                    index={i}
                    isDragging={isDragged}
                    dragRect={
                      isDragged ? { left: drag.left, top: drag.top, width: drag.width } : undefined
                    }
                    isAuthenticated={isAuthenticated}
                    copied={copiedId === prompt.id}
                    onCopy={handleCopy}
                    onOpenDetail={handleOpenDetail}
                    onGripPointerDown={onGripPointerDown}
                    registerRef={registerCardRef}
                  />
                </Fragment>
              );
            })}
            {dragging && holeIndex === restLen && (
              <div className="card-spacer" style={{ height: drag.height }} />
            )}
            {isAuthenticated && !dragging && (
              <Link className="card-shell card-new reveal" href="/new">
                <div className="card-core">
                  <span className="plus-orb">
                    <PlusIcon />
                  </span>
                  <span>New Prompt</span>
                </div>
              </Link>
            )}
          </>
        )}
      </main>

      <footer>
        <span className="f-serif">Prompt Wall</span>
      </footer>

      {drawerPrompt && (
        <PromptDrawer
          key={drawerPrompt.id}
          prompt={drawerPrompt}
          index={drawerIndex}
          onClose={() => setDrawerId(null)}
          onSaved={handleDrawerSaved}
          onDeleted={handleDrawerDeleted}
        />
      )}

      <LoginDialog isOpen={showLogin} onLogin={handleLogin} />
    </>
  );
}
