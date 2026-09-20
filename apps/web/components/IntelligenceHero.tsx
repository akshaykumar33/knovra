'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Copy, FileCode2, GitBranch, Network, ShieldCheck, Terminal, Workflow, Database } from 'lucide-react';

const nodes = [
  { label: 'AuthController', type: 'CODE', icon: FileCode2, reason: 'Direct dependency of the authentication task.', x: 19, y: 29 },
  { label: 'Tenant isolation', type: 'RULE', icon: ShieldCheck, reason: 'Security policy governing every tenant-scoped query.', x: 78, y: 23 },
  { label: 'AuthService', type: 'SERVICE', icon: Workflow, reason: 'Called by AuthController to validate credentials.', x: 16, y: 66 },
  { label: 'Safe query', type: 'SKILL', icon: GitBranch, reason: 'Reusable guidance for applying tenant boundaries.', x: 81, y: 62 },
  { label: 'SessionStore', type: 'MEMORY', icon: Database, reason: 'Related session storage selected for this example.', x: 52, y: 86 },
];

export default function IntelligenceHero() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText('npm run dev:web');
      setCopied(true); setCopyError(false);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopyError(true); }
  }
  return <section className="intelligence-hero">
    <div className="hero-editorial">
      <Link href="/architecture" className="release-link"><span className="release-dot" /> INTRODUCING KNOVRA <span className="release-divider" /> Meet your project’s intelligence layer <ArrowUpRight size={13} /></Link>
      <div className="hero-composition">
        <div className="hero-message">
          <div className="eyebrow">LOCAL-FIRST. AGENT-AGNOSTIC. YOURS.</div>
          <h1>Your codebase.<br />Connected.<br /><span>Understood.</span></h1>
          <p>Give every AI agent the bigger picture.<br className="desktop-break" /> Knovra turns your repository into a persistent context graph—so the right knowledge finds the right task.</p>
          <div className="hero-actions"><Link href="/docs" className="knovra-btn-primary">Start building <ArrowRight size={16} /></Link><Link href="/graph" className="hero-text-link"><Network size={16} /> Explore the graph <ArrowUpRight size={14} /></Link></div>
          <div className="hero-install"><Terminal size={15} /><code>npm run dev:web</code><button onClick={copy} aria-label="Copy local development command">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
          <p className="install-note" aria-live="polite">{copyError ? 'Copy unavailable. Select the command above.' : copied ? 'Command copied.' : 'From a local checkout · Requires npm install'}</p>
        </div>
        <div className="intelligence-map">
          <div className="map-header"><span><span className="release-dot" /> CONTEXT GRAPH</span><span>INTERACTIVE DEMO</span></div>
          <div className="map-task"><span className="task-icon"><Terminal size={17} /></span><div><small>YOUR TASK</small><strong>Make authentication tenant-safe</strong></div><ArrowRight size={15} /></div>
          <div className="map-canvas">
            <svg viewBox="0 0 600 390" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="map-light"><stop offset="0" stopColor="var(--accent-primary)" stopOpacity=".12" /><stop offset="1" stopColor="var(--accent-primary)" stopOpacity="0" /></radialGradient></defs><ellipse cx="300" cy="180" rx="235" ry="185" fill="url(#map-light)" /><circle cx="300" cy="180" r="78" /><circle cx="300" cy="180" r="141" /><circle cx="300" cy="180" r="191" />{nodes.map((node, index) => <path key={node.label} className={selected === index ? 'selected-edge' : ''} d={`M300 180 Q${node.x * 6} 180 ${node.x * 6} ${node.y * 3.9}`} />)}</svg>
            <div className="map-core"><Network size={27} /><strong>knovra</strong><small>CONTEXT ENGINE</small></div>
            {nodes.map((node, index) => <button key={node.label} className={`map-node ${selected === index ? 'is-selected' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelected(index)} aria-pressed={selected === index}><node.icon size={16} /><span><small>{node.type}</small><strong>{node.label}</strong></span></button>)}
            <span className="map-coordinate">PROJECT / AUTH</span>
          </div>
          <div className="map-inspector" aria-live="polite"><span><Check size={14} /> {nodes[selected].label}</span><p>{nodes[selected].reason}</p></div>
          <div className="map-footer"><span><span className="release-dot" /> Local by design</span><span>Click a node to inspect <ArrowUpRight size={12} /></span></div>
        </div>
      </div>
    </div>
    <div className="agent-strip"><span>ONE INTELLIGENCE LAYER.<br /><strong>EVERY AGENT YOU WORK WITH.</strong></span><div><span>◈ <b>Codex</b></span><span>✳ <b>Claude Code</b></span><span>✧ <b>Gemini</b></span><span>⌘ <b>MCP clients</b></span><span><Terminal size={20} /> <b>Local models</b></span></div></div>
    <div className="hero-section-heading"><div><span className="eyebrow">LESS NOISE. MORE SIGNAL.</span><h2>The whole repository.<br /><span>Only the context that matters.</span></h2></div><p>Code, rules, skills, and decisions—connected in one graph. Inspect what your agent receives, and understand why.</p></div>
  </section>;
}
