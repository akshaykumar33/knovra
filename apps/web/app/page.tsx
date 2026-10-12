import Link from 'next/link';
import { ArrowRight, BookMarked, Cpu, EyeOff, GitBranch, Lock, Quote, Ruler } from 'lucide-react';
import { Wordmark } from '@/components/shell/Wordmark';

const STEPS = [
  {
    title: 'Index',
    body: 'Knovra reads the text files Git tracks and stores line-numbered chunks and symbols in a SQLite file inside the project.',
    cmd: 'knovra index',
  },
  {
    title: 'Find',
    body: 'Search by the words you would use. Paths, function names and prose all rank, and every hit carries its file and lines.',
    cmd: 'knovra search "tenant authentication"',
  },
  {
    title: 'Pack',
    body: 'Describe the task. Knovra returns the few passages that matter, trimmed to a character budget and cited.',
    cmd: 'knovra context "Add pagination to the tenant list"',
  },
  {
    title: 'Remember',
    body: 'Record decisions and rules once. Revisions replace older versions without deleting them, so the history of a choice survives.',
    cmd: 'knovra remember "Tenant boundary" "Every query scopes by tenant id"',
  },
];

const TRUST = [
  { icon: Lock, title: 'Stays on your machine', body: 'The index lives in .knovra/local.sqlite. Knovra makes no network requests and calls no model.' },
  { icon: Cpu, title: 'Never runs your code', body: 'Indexing reads files as text. Nothing in the repository is executed, imported or evaluated.' },
  { icon: EyeOff, title: 'Keeps secrets out', body: 'Skips .env files, keys and credential files, and redacts tokens and passwords before anything is stored.' },
  { icon: Ruler, title: 'Bounded by design', body: '1 MiB per file, 128 MiB per index, and a hard character budget on every context pack.' },
  { icon: Quote, title: 'Cites every passage', body: 'Each source in a pack names its file and line span, so the agent — and you — can check it.' },
  { icon: GitBranch, title: 'History, not overwrite', body: 'A revised decision supersedes the old one. Both stay readable, with the date it changed.' },
];

export default function Landing() {
  return (
    <div className="site">
      <header className="site-nav">
        <Link href="/" aria-label="Knovra home" className="site-brand">
          <Wordmark />
        </Link>
        <nav aria-label="Site">
          <ul role="list" className="site-links">
            <li>
              <a href="#how">How it works</a>
            </li>
            <li>
              <a href="#trust">Trust</a>
            </li>
            <li>
              <Link href="/app/connect">Connect an agent</Link>
            </li>
          </ul>
        </nav>
        <Link href="/app" className="btn btn-primary btn-sm">
          Open workspace
        </Link>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Local project memory for coding agents</p>
            <h1>
              Context that outlives <span className="hero-em">the chat.</span>
            </h1>
            <p className="hero-lede">
              Knovra indexes your repository, keeps the decisions and rules behind it, and hands any coding agent a small, cited context pack. It all
              runs on your machine.
            </p>
            <div className="hero-actions">
              <Link href="/app" className="btn btn-primary btn-lg">
                Open your project <ArrowRight aria-hidden />
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                See how it works
              </a>
            </div>
            <p className="hero-foot small faint">Works over MCP with Claude Code, Codex, Cursor and any stdio MCP client.</p>
          </div>

          <figure className="paper" aria-label="Example context pack">
            <div className="paper-head">
              <span className="mono small">context-pack.md</span>
              <span className="small faint">example · this repository</span>
            </div>
            <div className="paper-body">
              <p className="paper-task">
                <span className="eyebrow">Task</span>
                Make indexing skip generated build output
              </p>
              <ol className="paper-sources">
                <li>
                  <span className="cite">
                    <span className="cite-path">packages/local/src/files.mjs</span>
                    <span className="cite-lines">:1–50</span>
                  </span>
                  <code>const ignored = new Set([&apos;.git&apos;, &apos;node_modules&apos;, &apos;dist&apos;, &apos;build&apos;, …])</code>
                </li>
                <li>
                  <span className="cite">
                    <span className="cite-path">packages/local/src/index.mjs</span>
                    <span className="cite-lines">:51–100</span>
                  </span>
                  <code>const {'{ files, gitIgnoreApplied }'} = candidates(this.root);</code>
                </li>
                <li className="paper-record">
                  <span className="kind kind-decision">decision</span>
                  <span>Index only what Git tracks; honour .knovraignore for the rest.</span>
                </li>
              </ol>
              <div className="paper-foot">
                <span className="meter" aria-hidden>
                  <span style={{ width: '38%' }} />
                </span>
                <span className="mono small faint">4,561 / 12,000 chars · ~1,141 tokens</span>
              </div>
            </div>
          </figure>
        </section>

        <section className="band" aria-labelledby="problem">
          <div className="band-inner">
            <h2 id="problem">Every new session starts from zero.</h2>
            <p>
              The agent re-reads the repository, guesses why the code is shaped the way it is, and repeats the mistake the last agent was told not
              to make. Switch models and it happens again. Knovra keeps that understanding in the project, where any agent can ask for it.
            </p>
          </div>
        </section>

        <section id="how" className="site-section" aria-labelledby="how-title">
          <div className="site-section-head">
            <p className="eyebrow">How it works</p>
            <h2 id="how-title">Four steps, one loop.</h2>
          </div>
          <ol role="list" className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <code className="step-cmd">$ {step.cmd}</code>
              </li>
            ))}
          </ol>
          <p className="steps-note small muted">
            The same steps are available in the workspace and as MCP tools, so an agent can run the loop itself.
          </p>
        </section>

        <section id="trust" className="site-section" aria-labelledby="trust-title">
          <div className="site-section-head">
            <p className="eyebrow">Trust</p>
            <h2 id="trust-title">Built to be read by machines you don&apos;t fully trust.</h2>
          </div>
          <ul role="list" className="trust">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <Icon aria-hidden />
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="cta" aria-labelledby="cta-title">
          <BookMarked aria-hidden className="cta-icon" />
          <h2 id="cta-title">Point it at your repository.</h2>
          <p className="muted">Open the workspace, index the project, and build your first context pack in under a minute.</p>
          <div className="hero-actions">
            <Link href="/app" className="btn btn-primary btn-lg">
              Open workspace <ArrowRight aria-hidden />
            </Link>
            <Link href="/app/connect" className="btn btn-lg">
              Connect an agent
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Wordmark size={18} />
        <p className="small faint">Models are replaceable. Context is durable. · Apache-2.0</p>
      </footer>
    </div>
  );
}
