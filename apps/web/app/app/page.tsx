import Link from 'next/link';
import { AlertTriangle, ArrowRight, BookMarked, Check, GitCommitHorizontal, Layers, Plug, Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/shell/PageHeader';
import { IndexButton } from '@/components/workspace/IndexButton';
import { EngineUnavailable, errorMessage } from '@/components/workspace/EngineUnavailable';
import { withProject, readStatus, readMemories, changedSinceIndex } from '@/lib/server/engine';
import { readCommits } from '@/lib/server/git';
import { plural, relativeTime } from '@/lib/format';
import type { Memory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  let data;
  try {
    data = await withProject((k) => ({ status: readStatus(k), doctor: k.doctor(), memories: readMemories(k), files: k.files() }));
  } catch (error) {
    return (
      <>
        <PageHeader title="Overview" />
        <EngineUnavailable message={errorMessage(error)} />
      </>
    );
  }
  const { status, doctor, memories, files } = data;
  const commits = (await readCommits(status.root, 5)) ?? [];
  const indexed = Boolean(status.indexedAt);
  const drift = changedSinceIndex(status.root, files, status.indexedAt);
  const stale = drift.changed.length + drift.missing;
  const count = (kind: Memory['kind']) => memories.filter((m) => m.kind === kind).length;

  return (
    <>
      <PageHeader
        title={status.project}
        description={<span className="mono small">{status.root}</span>}
        meta={
          indexed ? (
            <>
              <span>
                <span className="status-dot" data-state={stale ? 'warn' : 'ok'} aria-hidden /> Indexed {relativeTime(status.indexedAt)}
              </span>
              <span>{plural(status.files, 'file')}</span>
              <span>{plural(memories.length, 'record')}</span>
            </>
          ) : (
            <span>
              <span className="status-dot" data-state="warn" aria-hidden /> Not indexed yet
            </span>
          )
        }
        actions={indexed && <IndexButton indexed />}
      />

      {!indexed && (
        <section className="panel onboarding" aria-labelledby="onboard-title">
          <div className="onboarding-text">
            <p className="eyebrow">First step</p>
            <h2 id="onboard-title">Index this project so agents can find their way around it</h2>
            <p className="muted">
              Knovra reads the text files Git tracks, splits them into line-numbered chunks and stores them in{' '}
              <code>.knovra/local.sqlite</code> inside the project. Nothing leaves this machine.
            </p>
            <ul role="list" className="checklist">
              <li>
                <Check aria-hidden /> Respects <code>.gitignore</code> and <code>.knovraignore</code>
              </li>
              <li>
                <Check aria-hidden /> Skips binaries, lockfiles and likely secret files
              </li>
              <li>
                <Check aria-hidden /> Redacts tokens and passwords before storing text
              </li>
            </ul>
            <div>
              <IndexButton indexed={false} size="lg" />
            </div>
          </div>
        </section>
      )}

      {indexed && stale > 0 && (
        <div className="callout callout-warn drift" role="status">
          <AlertTriangle aria-hidden />
          <div>
            <p>
              <strong>
                {plural(drift.changed.length, 'file')} changed
                {drift.missing ? ` and ${drift.missing} removed` : ''} since the last index.
              </strong>{' '}
              Agents will read the older text until you refresh.
            </p>
            {drift.changed.length > 0 && (
              <p className="drift-files mono small">
                {drift.changed.slice(0, 4).join(' · ')}
                {drift.changed.length > 4 ? ` · +${drift.changed.length - 4} more` : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {indexed && (
        <form action="/app/context" className="panel task-start" role="search" aria-label="Start a task">
          <label htmlFor="start-task" className="task-start-label">
            What are you about to change?
          </label>
          <div className="task-start-row">
            <input
              id="start-task"
              name="task"
              className="input task-start-input"
              placeholder="e.g. Make the file watcher ignore build output"
              required
              maxLength={2000}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary btn-lg">
              <Layers aria-hidden /> Build context
            </button>
          </div>
          <p className="field-hint">Knovra gathers the matching files, symbols and decisions — cited, and sized for your agent.</p>
        </form>
      )}

      <section aria-labelledby="loop-title" className="section">
        <h2 id="loop-title" className="section-title">
          The working loop
        </h2>
        <ol role="list" className="loop">
          <LoopStep
            n={1}
            icon={Search}
            title="Find"
            body="Search files, symbols and recorded decisions by the words you'd use."
            href="/app/explore"
            cta="Explore the code"
            stat={indexed ? plural(status.files, 'file') + ' searchable' : 'Index first'}
            disabled={!indexed}
          />
          <LoopStep
            n={2}
            icon={Layers}
            title="Pack context"
            body="Describe a task; get the few cited passages an agent needs, inside a budget."
            href="/app/context"
            cta="Build a context pack"
            stat="Bounded, cited, copyable"
            disabled={!indexed}
          />
          <LoopStep
            n={3}
            icon={BookMarked}
            title="Record why"
            body="Write down decisions and rules once. Revise them without losing what came before."
            href="/app/memory"
            cta="Open memory"
            stat={`${plural(count('decision'), 'decision')} · ${plural(count('rule'), 'rule')}`}
          />
          <LoopStep
            n={4}
            icon={Plug}
            title="Hand off"
            body="Connect Claude Code, Codex or Cursor over MCP so every agent reads the same memory."
            href="/app/connect"
            cta="Connect an agent"
            stat="8 MCP tools"
          />
        </ol>
      </section>

      <div className="overview-grid">
        <section className="panel" aria-labelledby="recent-memory">
          <div className="panel-head">
            <h2 id="recent-memory" className="panel-title">
              Recently recorded
            </h2>
            <Link href="/app/memory" className="small">
              All records
            </Link>
          </div>
          {memories.length ? (
            <ul role="list" className="row-list">
              {memories.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <Link href={`/app/memory?id=${encodeURIComponent(m.id)}`} className="row-link">
                    <span className={`kind kind-${m.kind}`}>{m.kind}</span>
                    <span className="row-title">{m.title}</span>
                    <span className="row-meta">{relativeTime(m.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p>No decisions or rules yet. Record the first one so the next agent knows why the code looks the way it does.</p>
              <Link href="/app/memory?new=decision" className="btn btn-sm">
                Record a decision
              </Link>
            </div>
          )}
        </section>

        <section className="panel" aria-labelledby="recent-commits">
          <div className="panel-head">
            <h2 id="recent-commits" className="panel-title">
              Latest commits
            </h2>
            <Link href="/app/history" className="small">
              History
            </Link>
          </div>
          {commits.length ? (
            <ul role="list" className="row-list">
              {commits.map((c) => (
                <li key={c.hash}>
                  <Link href={`/app/history?commit=${c.shortHash}`} className="row-link">
                    <GitCommitHorizontal aria-hidden className="row-icon" />
                    <span className="row-title">{c.subject}</span>
                    <span className="row-meta">{relativeTime(c.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p>This project has no readable Git history, so there is nothing to show here.</p>
            </div>
          )}
        </section>

        <section className="panel" aria-labelledby="health">
          <div className="panel-head">
            <h2 id="health" className="panel-title">
              Local health
            </h2>
            <span className="small faint">
              <ShieldCheck aria-hidden className="inline-icon" /> Engine {status.version}
            </span>
          </div>
          <ul role="list" className="health-list">
            {doctor.checks.map((check) => (
              <li key={check.name}>
                <span className="status-dot" data-state={check.ok ? 'ok' : 'danger'} aria-hidden />
                <span>{HEALTH_LABELS[check.name] ?? check.name}</span>
                <span className={check.ok ? 'faint small' : 'small health-fail'}>{check.ok ? 'OK' : check.detail ?? 'Failed'}</span>
              </li>
            ))}
          </ul>
          <p className="panel-foot small faint">{doctor.recommendations[0]}</p>
        </section>
      </div>
    </>
  );
}

const HEALTH_LABELS: Record<string, string> = {
  'project-root': 'Project folder readable',
  database: 'Local database opens',
  fts5: 'Full-text search available',
  'storage-writable': 'Storage writable',
};

function LoopStep({
  n,
  icon: Icon,
  title,
  body,
  href,
  cta,
  stat,
  disabled,
}: {
  n: number;
  icon: typeof Search;
  title: string;
  body: string;
  href: string;
  cta: string;
  stat: string;
  disabled?: boolean;
}) {
  return (
    <li className="loop-step" data-disabled={disabled || undefined}>
      <div className="loop-top">
        <span className="loop-n" aria-hidden>
          {String(n).padStart(2, '0')}
        </span>
        <Icon aria-hidden className="loop-icon" />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <p className="loop-stat">{stat}</p>
      <Link href={href} className="loop-cta">
        {cta} <ArrowRight aria-hidden />
      </Link>
    </li>
  );
}
