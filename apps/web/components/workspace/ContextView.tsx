'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Check, Copy, Download, ExternalLink, Layers } from 'lucide-react';
import { PageHeader } from '@/components/shell/PageHeader';
import { api, copyText, downloadText } from '@/lib/client';
import { isMemoryKind, lineSpan, splitPath } from '@/lib/format';
import type { ContextPack } from '@/lib/types';

const BUDGETS = [
  { label: 'Small', chars: 4000 },
  { label: 'Standard', chars: 12000 },
  { label: 'Large', chars: 32000 },
];
const RECENT_KEY = 'knovra-recent-tasks';
const EXAMPLES = ['How does indexing skip secret files?', 'Add a new MCP tool', 'Where are decisions superseded?'];

function readRecent(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((t) => typeof t === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecent(task: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([task, ...readRecent().filter((t) => t !== task)].slice(0, 5)));
  } catch {
    // Recent tasks are a convenience; losing them is harmless.
  }
}

export function ContextView() {
  const params = useSearchParams();
  const [task, setTask] = useState(params.get('task') ?? '');
  const [budget, setBudget] = useState(12000);
  const [limit, setLimit] = useState(12);
  const [pack, setPack] = useState<ContextPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const result = useRef<HTMLElement>(null);

  const build = async (text = task) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Describe the task first, in a sentence or a few keywords.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { pack } = await api<{ pack: ContextPack }>('/api/context', { method: 'POST', body: { task: trimmed, maxChars: budget, limit } });
      setPack(pack);
      saveRecent(trimmed);
      setRecent(readRecent());
      window.history.replaceState(null, '', `?task=${encodeURIComponent(trimmed)}`);
      requestAnimationFrame(() => result.current?.focus());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setRecent(readRecent());
    const initial = params.get('task');
    if (initial) void build(initial);
    // Mount only: build once for a task handed over from another screen.
  }, []);

  const copy = async () => {
    if (!pack) return;
    if (await copyText(pack.markdown)) {
      setCopied(true);
      toast.success('Context pack copied', { description: 'Paste it into your agent as the first message.' });
      setTimeout(() => setCopied(false), 1800);
    } else toast.error('Clipboard is blocked in this browser. Use Download instead.');
  };

  const used = pack ? Math.min(100, Math.round((pack.characters / pack.maxChars) * 100)) : 0;

  return (
    <>
      <PageHeader
        title="Context"
        description="Describe what you're about to change. Knovra picks the most relevant cited passages and fits them into a budget your agent can afford."
      />

      <form
        className="panel composer"
        onSubmit={(e) => {
          e.preventDefault();
          void build();
        }}
      >
        <div className="field">
          <label htmlFor="task" className="field-label">
            Task
          </label>
          <textarea
            id="task"
            className="textarea"
            rows={3}
            placeholder="e.g. Make the file watcher ignore build output"
            value={task}
            maxLength={2000}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'task-error' : 'task-hint'}
            onChange={(e) => {
              setTask(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void build();
              }
            }}
          />
          {error ? (
            <p id="task-error" className="field-error" role="alert">
              {error}
            </p>
          ) : (
            <p id="task-hint" className="field-hint">
              Name files, functions or features where you can. Matching is by keyword. <kbd>Ctrl</kbd> <kbd>Enter</kbd> builds.
            </p>
          )}
        </div>

        <div className="composer-row">
          <fieldset className="composer-option">
            <legend className="field-label">Budget</legend>
            <div className="segmented">
              {BUDGETS.map((b) => (
                <label key={b.chars}>
                  <input type="radio" name="budget" checked={budget === b.chars} onChange={() => setBudget(b.chars)} />
                  {b.label} <span className="count">~{(b.chars / 4000).toFixed(0)}k tokens</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="composer-option">
            <legend className="field-label">Sources</legend>
            <div className="segmented">
              {[6, 12, 24].map((n) => (
                <label key={n}>
                  <input type="radio" name="limit" checked={limit === n} onChange={() => setLimit(n)} />
                  Up to {n}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="btn btn-primary composer-submit" disabled={busy} aria-busy={busy}>
            {busy ? <span className="spinner" aria-hidden /> : <Layers aria-hidden />}
            {busy ? 'Building…' : 'Build context pack'}
          </button>
        </div>

        {(recent.length > 0 || !pack) && (
          <div className="suggestions">
            <span className="small faint">{recent.length ? 'Recent' : 'Try'}</span>
            {(recent.length ? recent : EXAMPLES).map((t) => (
              <button
                key={t}
                type="button"
                className="suggestion"
                onClick={() => {
                  setTask(t);
                  void build(t);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </form>

      {pack && (
        <section ref={result} tabIndex={-1} className="pack fade-in" aria-labelledby="pack-title">
          <div className="pack-summary">
            <div>
              <h2 id="pack-title" className="section-title">
                {pack.selected.length ? `${pack.selected.length} cited ${pack.selected.length === 1 ? 'source' : 'sources'}` : 'No matching sources'}
              </h2>
              <p className="small faint">
                {pack.characters.toLocaleString('en')} of {pack.maxChars.toLocaleString('en')} characters · about {pack.tokenEstimate.toLocaleString('en')} tokens (estimated)
              </p>
            </div>
            <div className="meter" role="meter" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label="Budget used">
              <span style={{ width: `${used}%` }} />
            </div>
            <div className="pack-actions">
              <button type="button" className="btn btn-primary" onClick={copy} disabled={!pack.selected.length}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? 'Copied' : 'Copy pack'}
              </button>
              <button
                type="button"
                className="btn"
                disabled={!pack.selected.length}
                onClick={() => downloadText(`context-${Date.now()}.md`, pack.markdown)}
              >
                <Download aria-hidden /> Download .md
              </button>
            </div>
          </div>

          {pack.selected.length === 0 ? (
            <div className="panel empty">
              <h3>Nothing in the index matched this task</h3>
              <p>
                Use the words that appear in the code: a file name, a function, a config key. If you added files recently,{' '}
                <Link href="/app">refresh the index</Link> first.
              </p>
            </div>
          ) : (
            <div className="pack-grid">
              <ol className="panel sources" aria-label="Sources in ranked order">
                {pack.selected.map((s, i) => {
                  const memory = isMemoryKind(s.kind);
                  const href = memory
                    ? `/app/memory?id=${encodeURIComponent(s.path.split('/').slice(1).join('/'))}`
                    : `/app/explore?file=${encodeURIComponent(s.path)}&line=${s.startLine}`;
                  return (
                    <li key={s.id} className="source">
                      <span className="source-rank" aria-hidden>
                        {i + 1}
                      </span>
                      <div className="source-body">
                        <Link href={href} className="source-title">
                          {memory ? (
                            s.content.split('\n')[0]
                          ) : (
                            <span className="mono">
                              {splitPath(s.path).name}
                              <span className="cite-lines">{lineSpan(s.startLine, s.endLine)}</span>
                            </span>
                          )}
                        </Link>
                        {!memory && splitPath(s.path).dir && <span className="result-path result-dir">{splitPath(s.path).dir}</span>}
                        <div className="source-meta">
                          <span className={`kind kind-${s.kind}`}>{s.kind === 'file' ? 'source' : s.kind}</span>
                          {s.truncated && (
                            <span className="small source-warn">
                              <AlertTriangle aria-hidden className="inline-icon" /> Trimmed to fit budget
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={href} className="btn btn-ghost btn-icon btn-sm" aria-label={`Open ${s.path}`}>
                        <ExternalLink aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <div className="codeblock pack-preview">
                <div className="codeblock-head">
                  <span>context-pack.md — what your agent receives</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
                    <Copy aria-hidden /> Copy
                  </button>
                </div>
                <pre tabIndex={0}>{pack.markdown}</pre>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
