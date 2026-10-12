'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { onListKeyDown, useUrlState } from '@/lib/url';
import { ArrowLeft, BookMarked, FileText, Hash, Search } from 'lucide-react';
import { PageHeader } from '@/components/shell/PageHeader';
import { api } from '@/lib/client';
import { isMemoryKind, lineSpan, splitPath } from '@/lib/format';
import type { IndexedFile, SearchHit } from '@/lib/types';
import { Highlight, bestLine } from './Highlight';
import { FileTree } from './FileTree';
import { FileViewer } from './FileViewer';

type Load<T> = { state: 'idle' } | { state: 'loading' } | { state: 'error'; message: string } | { state: 'done'; data: T };

export function ExploreView() {
  const [params, write] = useUrlState();
  const urlQuery = params.get('q') ?? '';
  const file = params.get('file');
  const line = Number(params.get('line')) || null;

  const [query, setQuery] = useState(urlQuery);
  const [hits, setHits] = useState<Load<SearchHit[]>>({ state: 'idle' });
  const [files, setFiles] = useState<Load<IndexedFile[]>>({ state: 'loading' });

  const setParams = useCallback(
    (next: Record<string, string | null>, mode: 'push' | 'replace' = 'push') => write(next, { mode }),
    [write],
  );

  useEffect(() => {
    api<{ files: IndexedFile[] }>('/api/files')
      .then(({ files }) => setFiles({ state: 'done', data: files }))
      .catch((error: Error) => setFiles({ state: 'error', message: error.message }));
  }, []);

  // Typing updates the URL after a short pause; the URL drives the search.
  useEffect(() => {
    if (query.trim() === urlQuery) return;
    const timer = setTimeout(() => setParams({ q: query.trim() || null }, 'replace'), 250);
    return () => clearTimeout(timer);
  }, [query, urlQuery, setParams]);

  // Back/forward and palette navigation change the URL; mirror it without clobbering in-progress typing.
  useEffect(() => setQuery((current) => (current.trim() === urlQuery ? current : urlQuery)), [urlQuery]);

  useEffect(() => {
    if (!urlQuery.trim()) return setHits({ state: 'idle' });
    let cancelled = false;
    setHits({ state: 'loading' });
    api<{ hits: SearchHit[] }>(`/api/search?q=${encodeURIComponent(urlQuery)}&limit=40`)
      .then(({ hits }) => !cancelled && setHits({ state: 'done', data: hits }))
      .catch((error: Error) => !cancelled && setHits({ state: 'error', message: error.message }));
    return () => {
      cancelled = true;
    };
  }, [urlQuery]);

  const fileCount = files.state === 'done' ? files.data.length : null;
  const notIndexed = fileCount === 0;

  return (
    <div className={`explore${file ? ' has-file' : ''}`}>
      <PageHeader
        title="Explore"
        description="Search the project the way you'd describe it. Results cite the exact file and lines."
      />

      <div className="explore-grid">
        <section className="explore-side panel" aria-label="Search and files">
          <form className="explore-search" role="search" onSubmit={(e) => (e.preventDefault(), setParams({ q: query.trim() || null }))}>
            <label htmlFor="explore-q" className="visually-hidden">
              Search project
            </label>
            <div className="search-input">
              <Search aria-hidden />
              <input
                id="explore-q"
                className="input"
                type="search"
                placeholder="authentication timeout, IndexButton, tenant…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                disabled={notIndexed}
              />
            </div>
          </form>

          <div className="explore-results" aria-live="polite">
            {notIndexed ? (
              <div className="empty">
                <h2>Nothing indexed yet</h2>
                <p>Index the project from Overview, then come back to search it.</p>
                <Link href="/app" className="btn btn-primary btn-sm">
                  Go to Overview
                </Link>
              </div>
            ) : urlQuery ? (
              <Results load={hits} query={urlQuery} activeFile={file} onOpen={(path, ln) => setParams({ file: path, line: String(ln) })} />
            ) : files.state === 'done' ? (
              <FileTree files={files.data} activeFile={file} onOpen={(path) => setParams({ file: path, line: null })} />
            ) : files.state === 'error' ? (
              <p className="callout callout-danger">{files.message}</p>
            ) : (
              <SkeletonRows />
            )}
          </div>
        </section>

        <section className="explore-main" aria-label="File">
          {file ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm explore-back" onClick={() => setParams({ file: null, line: null })}>
                <ArrowLeft aria-hidden /> {urlQuery ? 'Back to results' : 'Back to files'}
              </button>
              <FileViewer path={file} line={line} query={urlQuery} onLine={(ln) => setParams({ line: String(ln) }, 'replace')} />
            </>
          ) : (
            <div className="panel explore-placeholder">
              <div className="empty empty-center">
                <FileText aria-hidden className="empty-icon" />
                <h2>Pick a file or search result</h2>
                <p>
                  {fileCount ? `${fileCount.toLocaleString('en')} files are indexed. ` : ''}
                  Open one to read it with its symbols, or press <kbd>Ctrl</kbd> <kbd>K</kbd> to jump anywhere.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Results({
  load,
  query,
  activeFile,
  onOpen,
}: {
  load: Load<SearchHit[]>;
  query: string;
  activeFile: string | null;
  onOpen: (path: string, line: number) => void;
}) {
  const grouped = useMemo(() => (load.state === 'done' ? load.data : []), [load]);
  if (load.state === 'loading' || load.state === 'idle') return <SkeletonRows />;
  if (load.state === 'error') return <p className="callout callout-danger">{load.message}</p>;
  if (!grouped.length) {
    return (
      <div className="empty">
        <h2>No matches for “{query}”</h2>
        <p>Search matches whole words in file paths and text. Try a file name, a function name, or a shorter phrase.</p>
      </div>
    );
  }
  return (
    <>
      <p className="results-count small faint">
        {grouped.length} {grouped.length === 1 ? 'match' : 'matches'}, best first
      </p>
      <ul role="list" className="results" onKeyDown={onListKeyDown}>
        {grouped.map((hit) => {
          if (isMemoryKind(hit.kind)) {
            const id = hit.path.split('/').slice(1).join('/');
            const [title, ...rest] = hit.content.split('\n');
            return (
              <li key={hit.id}>
                <Link href={`/app/memory?id=${encodeURIComponent(id)}`} className="result">
                  <span className="result-head">
                    <BookMarked aria-hidden className="result-icon" />
                    <span className="result-title">
                      <Highlight text={title} query={query} />
                    </span>
                    <span className={`kind kind-${hit.kind}`}>{hit.kind}</span>
                  </span>
                  <span className="result-snippet">
                    <Highlight text={rest.join(' ').slice(0, 160)} query={query} />
                  </span>
                </Link>
              </li>
            );
          }
          const { name: fileName, dir } = splitPath(hit.path);
          if (hit.kind === 'symbol') {
            const name = hit.content.split(' ')[0];
            return (
              <li key={hit.id}>
                <button type="button" data-row className="result" aria-current={activeFile === hit.path || undefined} onClick={() => onOpen(hit.path, hit.startLine)}>
                  <span className="result-head">
                    <Hash aria-hidden className="result-icon" />
                    <span className="result-title mono">
                      <Highlight text={name} query={query} />
                    </span>
                    <span className="kind kind-symbol">symbol</span>
                  </span>
                  <span className="result-path">
                    {fileName}
                    <span className="cite-lines">:{hit.startLine}</span>
                    {dir && <span className="result-dir"> · {dir}</span>}
                  </span>
                </button>
              </li>
            );
          }
          const best = bestLine(hit.content, hit.startLine, query);
          return (
            <li key={hit.id}>
              <button type="button" data-row className="result" aria-current={activeFile === hit.path || undefined} onClick={() => onOpen(hit.path, best.line)}>
                <span className="result-head">
                  <FileText aria-hidden className="result-icon" />
                  <span className="result-title mono">
                    <Highlight text={fileName} query={query} />
                    <span className="cite-lines">{lineSpan(hit.startLine, hit.endLine)}</span>
                  </span>
                </span>
                {dir && (
                  <span className="result-path result-dir">
                    <Highlight text={dir} query={query} />
                  </span>
                )}
                <code className="result-snippet">
                  <span className="faint">{best.line} </span>
                  <Highlight text={best.text} query={query} />
                </code>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SkeletonRows() {
  return (
    <div className="skeleton-rows" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 44, opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}
