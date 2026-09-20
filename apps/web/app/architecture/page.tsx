'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Tabs } from '@radix-ui/themes';
import { ArrowRight, ArrowUpRight, FileCode2, Database, Layers, Bot, ChevronDown, HardDrive, GitBranch, ShieldCheck } from 'lucide-react';
import styles from './architecture.module.css';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';

const stages=[
 {id:'source',name:'Your source',label:'01 / INPUT',icon:FileCode2,summary:'The project is the starting point.',detail:'Files from the local repository become searchable records. File paths remain attached so a result can be traced back to its source.',path:'packages/local/src/files.mjs',output:'Repository files → source records'},
 {id:'index',name:'Local index',label:'02 / ORGANIZE',icon:Database,summary:'Give the project a searchable memory.',detail:'The local package stores indexed content and persistent memories in SQLite. Linked memories help retrieve related decisions without reloading full conversation history.',path:'packages/local/src/index.mjs',output:'Source records → searchable local store'},
 {id:'context',name:'Useful context',label:'03 / SELECT',icon:Layers,summary:'Bring the relevant pieces together.',detail:'Search results are collected into a context pack with a character limit. The local package uses maxChars; this is not an exact model-token guarantee.',path:'packages/local/src/index.mjs',output:'Task + search results → bounded context pack'},
 {id:'agent',name:'Agent access',label:'04 / USE',icon:Bot,summary:'Make knowledge available to your tools.',detail:'The local CLI and MCP interface expose project search and context operations. The web explorer also includes illustrative views of the broader service architecture.',path:'packages/local/src/cli.mjs',output:'CLI or MCP request → project knowledge'}
];
const principles=[
 {icon:HardDrive,title:'Keep knowledge close',body:'The local package stores its index and memories in the project workspace. External model calls depend on the client and provider you choose.'},
 {icon:GitBranch,title:'Keep the reasoning',body:'Linked memories and supersession preserve how a project decision evolved. Context can be retrieved without replaying every conversation.'},
 {icon:ShieldCheck,title:'Keep the boundaries clear',body:'Source references and explicit budgets make context inspectable. Redaction helps reduce exposure; it is not a guarantee that all sensitive content will be detected.'}
];
const services=[
 ['apps/web','Explore','Next.js interface for source browsing, project knowledge, and illustrative workspaces.'],
 ['packages/local','Run locally','SQLite-backed indexing, search, context, memories, CLI, and MCP access.'],
 ['services/code-indexer','Parse','Code-indexing service in the broader architecture.'],
 ['services/context-engine','Plan','Context service in the broader architecture.'],
 ['services/runtime','Coordinate','Runtime service in the broader architecture.']
];
export default function ArchitecturePage(){
 const [selected,setSelected]=useState('index');
 const current=stages.find(s=>s.id===selected)!;
 return <div className={styles.page} style={{ position: 'relative' }}>
 <AuroraGlow />
 <header className={styles.hero}><div><span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>RUNTIME & PIPELINE ARCHITECTURE</span><h1 style={{ fontWeight: 800, fontSize: 'clamp(32px, 3.5vw, 48px)' }}>One project.<br/><span className="font-calligraphy text-gradient-aurora">A connected understanding.</span></h1><p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>See how source becomes searchable knowledge, and how that knowledge reaches your next task.</p></div><KnovraButton href="/docs" variant="secondary" iconTrailing={<ArrowUpRight size={16}/>}>Read the developer guide</KnovraButton></header>
 <section className={styles.system} aria-labelledby="system-title"><div className={styles.sectionTop}><div><span className={styles.eyebrow}>01 / THE FLOW</span><h2 id="system-title">From the code to the conversation.</h2></div><StatusBadge tone="neutral">Conceptual flow · local package</StatusBadge></div>
 <Tabs.Root value={selected} onValueChange={setSelected}><Tabs.List className={styles.flow} aria-label="Architecture stages">{stages.map(s=><Tabs.Trigger key={s.id} value={s.id} className={styles.stage}><s.icon size={25}/><small>{s.label}</small><strong>{s.name}</strong><ArrowRight className={styles.stageArrow} size={16}/></Tabs.Trigger>)}</Tabs.List>
 {stages.map(s=><Tabs.Content key={s.id} value={s.id} className={styles.detail}><div><span className={styles.eyebrow}>HOW IT WORKS</span><h3>{s.summary}</h3><p>{s.detail}</p></div><div className={styles.source}><FileCode2 size={20}/><span>Implementation reference</span><code>{s.path}</code><Link href="/repository">Open repository explorer <ArrowUpRight size={14}/></Link></div></Tabs.Content>)}</Tabs.Root>
 <div className={styles.flowCaption}><span><span className={styles.dot}/>{current.output}</span><span>Select a stage to explore</span></div></section>
 <section aria-labelledby="principles-title"><div className={styles.sectionTop}><div><span className={styles.eyebrow}>02 / THE PRINCIPLES</span><h2 id="principles-title">Built for continuity.</h2></div><p>Useful knowledge should outlast a single session.</p></div><div className={styles.principles}>{principles.map(p=><SpotlightCard key={p.title} style={{ padding: '24px', borderRadius: '14px' }}><p.icon size={25} style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}/><h3>{p.title}</h3><p>{p.body}</p></SpotlightCard>)}</div></section>
 <section className={styles.components} aria-labelledby="components-title"><div className={styles.sectionTop}><div><span className={styles.eyebrow}>03 / THE COMPONENTS</span><h2 id="components-title">Know where things live.</h2></div><p>A directory map, not a live service-status dashboard.</p></div><div className={styles.componentList}>{services.map(([path,role,description])=><details key={path}><summary><code>{path}</code><span>{role}</span><ChevronDown size={18}/></summary><p>{description}</p></details>)}</div></section>
 <footer className={styles.next} style={{ borderRadius: '18px' }}><div><span className={styles.eyebrow}>TAKE A CLOSER LOOK</span><h2>Follow a real source file.</h2><p>The Repository explorer contains snapshots from this checkout.</p></div><KnovraButton href="/repository" variant="primary" iconTrailing={<ArrowUpRight size={16}/>}>Explore the source</KnovraButton></footer>
 </div>;
}
