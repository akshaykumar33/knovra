'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { focusDetail, onListKeyDown, useUrlState } from '@/lib/url';
import { toast } from 'sonner';
import { ArrowLeft, Copy, GitCommitHorizontal, Layers, Search } from 'lucide-react';
import { PageHeader } from '@/components/shell/PageHeader';
import { copyText } from '@/lib/client';
import { absoluteTime, plural, relativeTime } from '@/lib/format';
import type { Commit } from '@/lib/types';

export function HistoryView({ commits, indexed }: { commits: Commit[] | null; indexed: string[] }) {
  const [params, write] = useUrlState();
  const [query, setQuery] = useState('');
  const selectedHash = params.get('commit');
  const indexedSet = useMemo(() => new Set(indexed), [indexed]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!commits) return [];
    return q ? commits.filter((c) => `${c.subject} ${c.body} ${c.author} ${c.shortHash} ${c.files.map((f) => f.path).join(' ')}`.toLowerCase().includes(q)) : commits;
  }, [commits, query]);

  const selected = commits?.find((c) => c.shortHash === selectedHash || c.hash === selectedHash) ?? null;
  const open = (hash: string | null) => write({ commit: hash }, { merge: false });

  if (commits === null) {
    return (
      <>
        <PageHeader title="History" />
        <div className="panel empty">
          <h2>No Git history available</h2>
          <p>This project is not a Git repository, or Git is not installed on this machine. History appears as soon as there are commits to read.</p>
        </div>
      </>
    );
  }

  return (
    <div className={`history${selected ? ' has-detail' : ''}`}>
      <PageHeader
        title="History"
        description="What changed recently and why. Pair a commit with its files to see what an agent — or a person — last touched."
        meta={<span>Latest {plural(commits.length, 'commit')}, merges excluded</span>}
      />

      <div className="split">
        <section className="panel split-list" aria-label="Commits">
          <div className="split-list-head">
            <div className="search-input">
              <Search aria-hidden />
              <input
                className="input"
                type="search"
                aria-label="Filter commits"
                placeholder="Filter by message, author or file…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          {visible.length === 0 ? (
            <div className="empty">
              <h2>No commits match “{query}”</h2>
              <button type="button" className="btn btn-sm" onClick={() => setQuery('')}>
                Clear filter
              </button>
            </div>
          ) : (
            <ul role="list" className="record-list" onKeyDown={onListKeyDown}>
              {visible.map((c) => (
                <li key={c.hash}>
                  <button type="button" data-row className="record-row" aria-current={c === selected || undefined} onClick={() => open(c.shortHash)}>
                    <span className="record-top">
                      <span className="mono small commit-hash">{c.shortHash}</span>
                      <span className="faint small">{relativeTime(c.date)}</span>
                    </span>
                    <span className="record-title">{c.subject}</span>
                    <span className="record-excerpt">
                      {c.author} · {plural(c.files.length, 'file')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="split-detail" aria-label="Commit detail">
          {selected ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm split-back" onClick={() => open(null)}>
                <ArrowLeft aria-hidden /> All commits
              </button>
              <CommitDetail commit={selected} indexed={indexedSet} />
            </>
          ) : (
            <div className="panel split-placeholder">
              <div className="empty empty-center">
                <GitCommitHorizontal aria-hidden className="empty-icon" />
                <p>Select a commit to read its message and the files it changed.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CommitDetail({ commit, indexed }: { commit: Commit; indexed: Set<string> }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => focusDetail(heading.current), [commit.hash]);
  const added = commit.files.reduce((n, f) => n + (f.added ?? 0), 0);
  const removed = commit.files.reduce((n, f) => n + (f.removed ?? 0), 0);

  return (
    <article className="panel record fade-in" key={commit.hash}>
      <header className="record-head">
        <p className="small faint">
          {commit.author} · {absoluteTime(commit.date)}
        </p>
        <h2 ref={heading} tabIndex={-1}>
          {commit.subject}
        </h2>
        <div className="commit-meta">
          <button
            type="button"
            className="btn btn-sm"
            onClick={async () => ((await copyText(commit.hash)) ? toast.success('Commit hash copied') : toast.error('Clipboard is blocked'))}
          >
            <Copy aria-hidden /> <span className="mono">{commit.shortHash}</span>
          </button>
          <span className="small">
            <span className="diff-add">+{added.toLocaleString('en')}</span> <span className="diff-del">−{removed.toLocaleString('en')}</span>
          </span>
        </div>
      </header>

      {commit.body && <div className="record-body commit-body">{commit.body}</div>}

      <div className="changed">
        <p className="eyebrow">{plural(commit.files.length, 'changed file')}</p>
        <ul role="list" className="changed-list">
          {commit.files.map((f) => (
            <li key={f.path}>
              {indexed.has(f.path) ? (
                <Link href={`/app/explore?file=${encodeURIComponent(f.path)}`} className="cite">
                  <span className="cite-path">{f.path}</span>
                </Link>
              ) : (
                <span className="cite faint" title="Not in the current index (deleted, ignored or binary)">
                  {f.path}
                </span>
              )}
              <span className="changed-stat small">
                {f.added === null ? (
                  <span className="faint">binary</span>
                ) : (
                  <>
                    <span className="diff-add">+{f.added}</span> <span className="diff-del">−{f.removed}</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="record-actions">
        <Link href={`/app/context?task=${encodeURIComponent(commit.subject)}`} className="btn">
          <Layers aria-hidden /> Build context for this change
        </Link>
      </footer>
    </article>
  );
}
