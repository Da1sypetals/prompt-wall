'use client';

/* 等宽内容行（带行号，折行对齐）：详情预览与编辑镜像共用 */
export function CodeRows({ content }: { content: string }) {
  return (
    <div className="code-rows">
      {content.split('\n').map((line, i) => (
        <div className="code-row" key={i}>
          <span className="code-num">{i + 1}</span>
          <span className="code-text">{line === '' ? ' ' : line}</span>
        </div>
      ))}
    </div>
  );
}

/* 等宽编辑器：镜像层渲染行号与折行文本，textarea 透明覆盖，版式恒等对齐 */
export function CodeEditor({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="code-editor">
      <div className="code-mirror" aria-hidden="true">
        <CodeRows content={value} />
      </div>
      <textarea
        className="code-input"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        wrap="soft"
        spellCheck={false}
      />
    </div>
  );
}
