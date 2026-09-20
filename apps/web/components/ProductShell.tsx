'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, Search, Menu, X, ArrowUpRight, Command, ChevronRight, FolderGit2, FileCode2, Layers, ScanLine, BookOpen, ShieldCheck, MessagesSquare, Bot, History, Component, Plug, BarChart3, HardDrive, Settings, GitPullRequest } from 'lucide-react';
import { Select, Dialog } from '@radix-ui/themes';
import { useTheme } from './ThemeProvider';
import CommandPalette from './CommandPalette';
import { Button } from './ui/Primitives';

const groups: [string, [string, string][]][] = [
  ['Workspace', [['/projects','Projects'],['/repository','Repository'],['/graph','Code graph'],['/context','Context studio'],['/impact','Impact analysis']]],
  ['Knowledge', [['/decisions','Decisions'],['/rules','Rules'],['/sessions','Sessions'],['/agents','Agents'],['/history','History']]],
  ['Resources', [['/docs','Documentation'],['/architecture','Architecture'],['/providers','Providers'],['/benchmarks','Benchmarks'],['/local-first','Local first'],['/settings','Settings']]],
];
const routeIcons = [FolderGit2,FileCode2,Network,Layers,ScanLine,GitPullRequest,ShieldCheck,MessagesSquare,Bot,History,BookOpen,Component,Plug,BarChart3,HardDrive,Settings];
const icons = Object.fromEntries(groups.flatMap(g=>g[1]).map(([path],i)=>[path,routeIcons[i]]));
export default function ProductShell({children}:{children:React.ReactNode}) {
  const pathname=usePathname(); const home=pathname==='/';
  const [menu,setMenu]=useState(false); const [search,setSearch]=useState(false);
  const {theme,setTheme,themes}=useTheme();
  useEffect(()=>{setMenu(false)},[pathname]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();setMenu(false);setSearch(s=>!s)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
  const title=groups.flatMap(g=>g[1]).find(p=>p[0]===pathname)?.[1]??'Overview';
  const navigation = (
    <>
      <Link className="workspace-label glass-card" href="/projects">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            width: 28, 
            height: 28, 
            borderRadius: '8px', 
            background: 'var(--accent-glow)', 
            border: '1px solid var(--accent-primary)', 
            display: 'grid', 
            placeItems: 'center', 
            color: 'var(--accent-primary)' 
          }}>
            <Command size={14}/>
          </span>
          <div style={{ display: 'grid', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Knovra Workspace</span>
            <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Project Intelligence</small>
          </div>
        </div>
        <span className="pulsing-dot" style={{ marginLeft: 'auto' }} />
      </Link>
      {groups.map(([name,links])=>(
        <nav key={name} aria-label={name}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.6 }} />
            {name}
          </h2>
          {links.map(([href,label])=>{
            const Icon=icons[href];
            const isActive = pathname === href;
            return (
              <Link 
                key={href} 
                href={href} 
                aria-current={isActive ? 'page' : undefined}
                style={{
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <Icon size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}/>
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && (
                  <span 
                    className="nav-active-marker" 
                    style={{ 
                      boxShadow: '0 0 8px var(--accent-primary)',
                      background: 'var(--accent-primary)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      ))}
      <div className="shell-theme glass-panel" style={{ marginTop: 'auto', padding: '12px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Theme Palette</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
        </div>
        <Select.Root value={theme} onValueChange={value=>setTheme(value as typeof theme)}>
          <Select.Trigger aria-label="Appearance" style={{ width: '100%' }} />
          <Select.Content>
            {themes.map(t=>(
              <Select.Item key={t.id} value={t.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.accentPreview, border: '1px solid rgba(255,255,255,0.2)' }} />
                  {t.name}
                </div>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </>
  );

  return (
    <div className={`product-shell ${home?'is-home':'is-workspace'}`}>
      <header className="product-nav">
        <Link href="/" className="product-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            boxShadow: '0 0 20px var(--accent-glow)', 
            background: 'radial-gradient(circle at center, var(--accent-glow), transparent 75%)',
          }}>
            <Network size={20}/>
          </span>
          <span style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>knovra</span>
          <span className="brand-edition font-calligraphy" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulsing-dot" />
            intelligence
          </span>
        </Link>
        <nav className="product-top-links" aria-label="Main navigation">
          <Link href="/graph">Platform</Link>
          <Link href="/architecture">How it works</Link>
          <Link href="/docs">Developers</Link>
        </nav>
        <div className="product-nav-actions">
          <button 
            type="button"
            className="shell-search glass-pill" 
            onClick={()=>setSearch(true)} 
            aria-label="Search pages"
            style={{ cursor: 'pointer', border: '1px solid var(--border-default)' }}
          >
            <Search size={15} style={{ color: 'var(--accent-primary)' }}/>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Search intelligence…</span>
            <kbd style={{ 
              fontSize: '10px', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--font-mono)'
            }}>⌘K</kbd>
          </button>
          <Link className="shell-launch knovra-btn-primary" href="/projects" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
            Workspace <ArrowUpRight size={14}/>
          </Link>
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger>
              <button type="button" className="shell-menu glass-pill" aria-label="Open navigation" style={{ padding: '8px' }}>
                <Menu size={20}/>
              </button>
            </Dialog.Trigger>
            <Dialog.Content className="mobile-navigation glass-panel-luxury" aria-describedby={undefined}>
              <div className="mobile-navigation-header">
                <Dialog.Title style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Network size={18} style={{ color: 'var(--accent-primary)' }} />
                  Workspace Navigation
                </Dialog.Title>
                <Dialog.Close>
                  <button type="button" className="glass-pill" aria-label="Close navigation" style={{ padding: '6px' }}>
                    <X size={18}/>
                  </button>
                </Dialog.Close>
              </div>
              <div className="product-sidebar">{navigation}</div>
            </Dialog.Content>
          </Dialog.Root>
        </div>
      </header>
      <div className="product-layout">
        {!home && <aside className="product-sidebar desktop-navigation">{navigation}</aside>}
        <div className="product-body">
          {!home && (
            <div className="workspace-breadcrumb" style={{ backdropFilter: 'blur(10px)' }}>
              <span>Workspace</span>
              <ChevronRight size={12}/>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
              <span className="workspace-mode glass-pill" style={{ marginLeft: 'auto', padding: '3px 10px', fontSize: '10px' }}>
                <span className="pulsing-dot" style={{ width: 5, height: 5 }} />
                Connected Engine
              </span>
            </div>
          )}
          <main id="main-content" className={home?'home-main':'workspace-main'}>
            <div key={pathname} className="route-enter">{children}</div>
          </main>
          <footer className="product-footer">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />
              <strong>knovra</strong>
            </Link>
            <span className="font-calligraphy" style={{ color: 'var(--text-secondary)' }}>
              Universal project knowledge, within reach.
            </span>
            <Link href="/docs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Documentation <ArrowUpRight size={13}/>
            </Link>
          </footer>
        </div>
      </div>
      <CommandPalette isOpen={search} onClose={()=>setSearch(false)}/>
    </div>
  );
}
