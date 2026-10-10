'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { focusDetail, onListKeyDown, useUrlState } from '@/lib/url';
import { toast } from 'sonner';
import { ArrowLeft, BookMarked, CornerDownRight, History, Layers, PenLine, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shell/PageHeader';
import { api } from '@/lib/client';
import { absoluteTime, relativeTime } from '@/lib/format';
import type { Memory, MemoryKind } from '@/lib/types';
import { RecordBody } from './RecordBody';

const KINDS: { value: MemoryKind; label: string; plural: string; hint: string }[] = [
  { value: 'decision', label: 'Decision', plural: 'Decisions', hint: 'A choice and the reason for it. "We use SQLite FTS5 because…"' },
  { value: 'rule', label: 'Rule', plural: 'Rules', hint: 'Something every change must respect. "Never log request bodies."' },
  { value: 'note', label: 'Note', plural: 'Notes', hint: 'Useful context that is neither: a gotcha, a pointer, a lesson.' },
];

type Filter = MemoryKind | 'all';

export function MemoryView({ initial }: { initial: Memory[] }) {
  const router = useRouter();
  const [params, write] = useUrlState();
  const [memories, setMemories] = useState(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [showReplaced, setShowReplaced] = useState(false);

  const selectedId = params.get('id');
  const composing = params.get('new') as MemoryKind | null;
  const revisingId = params.get('revise');

  const go = (next: Record<string, string | null>) => {
    write({ q: query || null, ...next }, { merge: false });
  };

  const byId = useMemo(() => new Map(memories.map((m) => [m.id, m])), [memories]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return memories.filter(
      (m) =>
        (filter === 'all' || m.kind === filter) &&
        (showReplaced || !m.supersededBy || m.id === selectedId) &&
        (!q || `${m.title} ${m.body}`.toLowerCase().includes(q)),
    );
  }, [memories, filter, query, showReplaced, selectedId]);

  const current = memories.filter((m) => !m.supersededBy);
  const counts = (kind: Filter) => (kind === 'all' ? current.length : current.filter((m) => m.kind === kind).length);
  const selected = selectedId ? byId.get(selectedId) ?? null : null;
  const revising = revisingId ? byId.get(revisingId) ?? null : null;
  const detailOpen = Boolean(selected || composing || revising);

  return (
    <div className={`memory${detailOpen ? ' has-detail' : ''}`}>
      <PageHeader
        title="Memory"
        description="The reasons behind the code. Agents read these alongside the source, so a rule written once applies to every future change."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => go({ new: filter === 'all' ? 'decision' : filter })}>
            <Plus aria-hidden /> Record
          </button>
        }
      />

      <div className="memory-toolbar">
        <div className="segmented" role="radiogroup" aria-label="Filter by kind">
          {(['all', ...KINDS.map((k) => k.value)] as Filter[]).map((kind) => (
            <label key={kind}>
              <input type="radio" name="kind-filter" checked={filter === kind} onChange={() => setFilter(kind)} />
              {kind === 'all' ? 'All' : KINDS.find((k) => k.value === kind)!.plural}
              <span className="count">{counts(kind)}</span>
            </label>
          ))}
        </div>
        <div className="search-input memory-search">
          <Search aria-hidden />
          <input
            className="input"
            type="search"
            aria-label="Filter records"
            placeholder="Filter records…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="check">
          <input type="checkbox" checked={showReplaced} onChange={(e) => setShowReplaced(e.target.checked)} />
          Show replaced versions
        </label>
      </div>

      <div className="split">
        <section className="panel split-list" aria-label="Records">
          {memories.length === 0 ? (
            <div className="empty">
              <BookMarked aria-hidden className="empty-icon" />
              <h2>Nothing recorded yet</h2>
              <p>
                Start with the decision a new teammate would most likely get wrong. Agents will find it whenever a task touches the same words.
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => go({ new: 'decision' })}>
                Record the first decision
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <h2>No records match</h2>
              <p>Nothing matches this filter{query ? ` and “${query}”` : ''}.</p>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul role="list" className="record-list" onKeyDown={onListKeyDown}>
              {visible.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    data-row
                    className="record-row"
                    aria-current={m.id === selectedId || undefined}
                    data-replaced={m.supersededBy ? true : undefined}
                    onClick={() => go({ id: m.id })}
                  >
                    <span className="record-top">
                      <span className={`kind kind-${m.supersededBy ? 'superseded' : m.kind}`}>{m.supersededBy ? 'replaced' : m.kind}</span>
                      <span className="faint small">{relativeTime(m.createdAt)}</span>
                    </span>
                    <span className="record-title">{m.title}</span>
                    <span className="record-excerpt">{m.body.slice(0, 140)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="split-detail" aria-label="Record detail">
          {detailOpen && (
            <button type="button" className="btn btn-ghost btn-sm split-back" onClick={() => go({})}>
              <ArrowLeft aria-hidden /> All records
            </button>
          )}
          {composing || revising ? (
            <Composer
              key={revisingId ?? composing}
              kind={revising?.kind ?? composing ?? 'decision'}
              revising={revising}
              onCancel={() => go(revising ? { id: revising.id } : {})}
              onSaved={(id, next) => {
                setMemories(next);
                toast.success(revising ? 'New version recorded' : 'Recorded', {
                  description: revising ? 'The earlier version is kept and marked as replaced.' : 'Agents will find it in search and context packs.',
                });
                go({ id });
                router.refresh();
              }}
            />
          ) : selected ? (
            <Detail memory={selected} byId={byId} onRevise={() => go({ revise: selected.id })} onOpen={(id) => go({ id })} />
          ) : (
            <div className="panel split-placeholder">
              <div className="empty empty-center">
                <p className="eyebrow">How memory works</p>
                <p>
                  Records are never edited in place. Revising one writes a new version that <em>replaces</em> the old, so you can always see what was
                  decided before and when it changed.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({ memory, byId, onRevise, onOpen }: { memory: Memory; byId: Map<string, Memory>; onRevise: () => void; onOpen: (id: string) => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => focusDetail(heading.current), [memory.id]);
  const previous = memory.supersedes ? byId.get(memory.supersedes) : null;
  const next = memory.supersededBy ? byId.get(memory.supersededBy) : null;

  return (
    <article className="panel record fade-in" key={memory.id}>
      {next && (
        <div className="callout callout-warn record-banner">
          <History aria-hidden />
          <span>
            This version was replaced {relativeTime(next.createdAt)}.{' '}
            <button type="button" className="link-button" onClick={() => onOpen(next.id)}>
              Read the current version
            </button>
          </span>
        </div>
      )}
      <header className="record-head">
        <span className={`kind kind-${memory.kind}`}>{memory.kind}</span>
        <h2 ref={heading} tabIndex={-1}>
          {memory.title}
        </h2>
        <p className="small faint">
          Recorded {absoluteTime(memory.createdAt)} · <span className="mono">{memory.id}</span>
        </p>
      </header>
      <RecordBody text={memory.body} />
      {previous && (
        <div className="lineage">
          <p className="eyebrow">Replaces</p>
          <button type="button" className="lineage-link" onClick={() => onOpen(previous.id)}>
            <CornerDownRight aria-hidden />
            <span>{previous.title}</span>
            <span className="faint small">{relativeTime(previous.createdAt)}</span>
          </button>
        </div>
      )}
      <footer className="record-actions">
        {!next && (
          <button type="button" className="btn" onClick={onRevise}>
            <PenLine aria-hidden /> Revise
          </button>
        )}
        <Link href={`/app/context?task=${encodeURIComponent(memory.title)}`} className="btn btn-ghost">
          <Layers aria-hidden /> Build context from this
        </Link>
      </footer>
    </article>
  );
}

function Composer({
  kind: initialKind,
  revising,
  onCancel,
  onSaved,
}: {
  kind: MemoryKind;
  revising: Memory | null;
  onCancel: () => void;
  onSaved: (id: string, memories: Memory[]) => void;
}) {
  const [kind, setKind] = useState<MemoryKind>(initialKind);
  const [title, setTitle] = useState(revising?.title ?? '');
  const [body, setBody] = useState(revising?.body ?? '');
  const [errors, setErrors] = useState<{ title?: string; body?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const hint = KINDS.find((k) => k.value === kind)!.hint;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Give it a short title people will recognise in a list.';
    if (!body.trim()) next.body = 'Write the reasoning. This is what agents will read.';
    setErrors(next);
    if (next.title || next.body) return;
    setBusy(true);
    try {
      const { id, memories } = await api<{ id: string; memories: Memory[] }>('/api/memories', {
        method: 'POST',
        body: { kind, title: title.trim(), body: body.trim(), supersedes: revising?.id ?? null },
      });
      onSaved(id, memories);
    } catch (e) {
      setErrors({ form: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel composer-form fade-in" onSubmit={submit} noValidate>
      <header>
        <h2>{revising ? 'Revise record' : `Record a ${kind}`}</h2>
        {revising && <p className="small muted">The current version stays in history, marked as replaced by this one.</p>}
      </header>

      {!revising && (
        <fieldset className="field">
          <legend className="field-label">Kind</legend>
          <div className="segmented">
            {KINDS.map((k) => (
              <label key={k.value}>
                <input type="radio" name="kind" checked={kind === k.value} onChange={() => setKind(k.value)} />
                {k.label}
              </label>
            ))}
          </div>
          <p className="field-hint">{hint}</p>
        </fieldset>
      )}

      <div className="field">
        <label htmlFor="mem-title" className="field-label">
          Title
        </label>
        <input
          id="mem-title"
          className="input"
          value={title}
          maxLength={200}
          autoFocus
          aria-invalid={Boolean(errors.title) || undefined}
          aria-describedby={errors.title ? 'mem-title-error' : undefined}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && (
          <p id="mem-title-error" className="field-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="mem-body" className="field-label">
          {kind === 'decision' ? 'What was decided, and why' : kind === 'rule' ? 'The rule, and where it applies' : 'Note'}
        </label>
        <textarea
          id="mem-body"
          className="textarea"
          rows={8}
          value={body}
          maxLength={16000}
          aria-invalid={Boolean(errors.body) || undefined}
          aria-describedby={errors.body ? 'mem-body-error' : 'mem-body-hint'}
          onChange={(e) => setBody(e.target.value)}
        />
        {errors.body ? (
          <p id="mem-body-error" className="field-error">
            {errors.body}
          </p>
        ) : (
          <p id="mem-body-hint" className="field-hint">
            Mention the files, functions or terms it relates to so search can connect it to the right tasks. Secrets are redacted on save.
          </p>
        )}
      </div>

      {errors.form && (
        <p className="callout callout-danger" role="alert">
          {errors.form}
        </p>
      )}

      <footer className="record-actions">
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy && <span className="spinner" aria-hidden />}
          {revising ? 'Save new version' : `Save ${kind}`}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </footer>
    </form>
  );
}
