'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Layers } from 'lucide-react';
import { api, copyText } from '@/lib/client';
import { formatBytes, plural } from '@/lib/format';
import type { EngineFile } from '@/lib/types';
import { Highlight } from './Highlight';
import { highlight, languageFor } from './syntax';

const PAGE = 1500;

export function FileViewer({ path, line, query, onLine }: { path: string; line: number | null; query: string; onLine: (line: number) => void }) {
  const [file, setFile] = useState<EngineFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const code = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setFile(null);
    setError(null);
    setLimit(PAGE);
    api<{ file: EngineFile }>(`/api/file?path=${encodeURIComponent(path)}`)
      .then(({ file }) => !cancelled && setFile(file))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [path]);

  const lines = useMemo(() => file?.content.split('\n') ?? [], [file]);
  const tokens = useMemo(() => highlight(lines, languageFor(path)), [lines, path]);

  useEffect(() => {
    if (!file || !line) return;
    if (line > limit) setLimit(Math.ceil(line / PAGE) * PAGE);
    requestAnimationFrame(() => {
      code.current?.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ block: 'center' });
    });
  }, [file, line, limit]);

  if (error) {
    return (
      <div className="panel panel-pad">
        <p className="callout callout-danger" role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <article className="panel viewer" aria-busy={!file}>
      <header className="viewer-head">
        <div className="viewer-title">
          <h2 className="cite">
            <span className="cite-path">{path}</span>
            {line && <span className="cite-lines">:{line}</span>}
          </h2>
          {file && (
            <p className="small faint">
              {formatBytes(file.bytes)} · {plural(lines.length, 'line')} · {plural(file.symbols.length, 'symbol')} · redacted index copy
            </p>
          )}
        </div>
        <div className="viewer-actions">
          <button
            type="button"
            className="btn btn-sm"
            onClick={async () => ((await copyText(path)) ? toast.success('Path copied') : toast.error('Clipboard is blocked in this browser'))}
          >
            <Copy aria-hidden /> Copy path
          </button>
          <Link href={`/app/context?task=${encodeURIComponent(`Change ${path}`)}`} className="btn btn-sm">
            <Layers aria-hidden /> Build context
          </Link>
        </div>
      </header>

      {file && file.symbols.length > 0 && (
        <nav className="symbols" aria-label="Symbols in this file">
          {file.symbols.map((s) => (
            <button
              key={`${s.name}:${s.line}`}
              type="button"
              className="symbol-chip"
              aria-current={line === s.line || undefined}
              onClick={() => onLine(s.line)}
            >
              <span className="mono">{s.name}</span>
              <span className="faint">{s.line}</span>
            </button>
          ))}
        </nav>
      )}

      {!file ? (
        <div className="viewer-loading" aria-label="Loading file">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${40 + ((i * 37) % 50)}%` }} />
          ))}
        </div>
      ) : (
        <div className="code" ref={code} role="region" aria-label={`Source of ${path}`} tabIndex={0}>
          <table>
            <tbody>
              {lines.slice(0, limit).map((text, i) => {
                const n = i + 1;
                return (
                  <tr key={n} data-line={n} aria-current={n === line || undefined}>
                    <td className="ln">
                      <button type="button" onClick={() => onLine(n)} tabIndex={-1} aria-label={`Line ${n}`}>
                        {n}
                      </button>
                    </td>
                    <td className="lc">
                      {text
                        ? tokens[i].map((tok, j) => (
                            <span key={j} className={tok.kind ? `syn-${tok.kind}` : undefined}>
                              {query ? <Highlight text={tok.text} query={query} /> : tok.text}
                            </span>
                          ))
                        : ' '}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lines.length > limit && (
            <div className="code-more">
              <button type="button" className="btn btn-sm" onClick={() => setLimit((l) => l + PAGE)}>
                Show {Math.min(PAGE, lines.length - limit).toLocaleString('en')} more lines
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
