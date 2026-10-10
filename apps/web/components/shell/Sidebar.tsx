'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { WORKFLOW, SETUP, isActive, type NavItem } from './nav';
import { ThemeSwitch } from './ThemeSwitch';
import { Wordmark } from './Wordmark';
import { relativeTime, plural } from '@/lib/format';
import type { ProjectStatus } from '@/lib/types';

function NavList({ items, label, pathname, onNavigate }: { items: NavItem[]; label: string; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label={label}>
      <ul role="list" className="nav-list">
        {items.map(({ href, label: text, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link href={href} className="nav-link" aria-current={active ? 'page' : undefined} onClick={onNavigate}>
                <Icon aria-hidden />
                {text}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ProjectCard({ status }: { status: ProjectStatus | null }) {
  if (!status) {
    return (
      <div className="project-card">
        <span className="status-dot" data-state="danger" aria-hidden />
        <div>
          <p className="project-name">Project unavailable</p>
          <p className="project-meta">See Overview for details</p>
        </div>
      </div>
    );
  }
  const indexed = Boolean(status.indexedAt);
  return (
    <Link href="/app" className="project-card">
      <span className="status-dot" data-state={indexed ? 'ok' : 'warn'} aria-hidden />
      <div>
        <p className="project-name">{status.project}</p>
        <p className="project-meta" suppressHydrationWarning>{indexed ? `${plural(status.files, 'file')} · ${relativeTime(status.indexedAt)}` : 'Not indexed yet'}</p>
      </div>
    </Link>
  );
}

function SidebarBody({ status, pathname, onNavigate, onSearch }: { status: ProjectStatus | null; pathname: string; onNavigate?: () => void; onSearch: () => void }) {
  return (
    <>
      <ProjectCard status={status} />
      <button type="button" className="palette-trigger" onClick={onSearch}>
        <Search aria-hidden />
        <span>Search or jump…</span>
        <kbd>Ctrl K</kbd>
      </button>
      <NavList items={WORKFLOW} label="Workflow" pathname={pathname} onNavigate={onNavigate} />
      <div className="sidebar-section">
        <p className="eyebrow sidebar-label">Setup</p>
        <NavList items={SETUP} label="Setup" pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="sidebar-foot">
        <ThemeSwitch />
        <Link href="/" className="small faint" onClick={onNavigate}>
          About
        </Link>
      </div>
    </>
  );
}

export function Sidebar({ status, onSearch }: { status: ProjectStatus | null; onSearch: () => void }) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const close = () => drawer.current?.close();

  useEffect(close, [pathname]);

  return (
    <>
      <aside className="sidebar" aria-label="Workspace">
        <Link href="/app" className="sidebar-brand" aria-label="Knovra overview">
          <Wordmark />
        </Link>
        <SidebarBody status={status} pathname={pathname} onSearch={onSearch} />
      </aside>

      <header className="topbar">
        <Link href="/app" aria-label="Knovra overview">
          <Wordmark />
        </Link>
        <div className="topbar-actions">
          <button type="button" className="btn btn-ghost btn-icon" onClick={onSearch} aria-label="Search or jump to">
            <Search />
          </button>
          <button type="button" className="btn btn-ghost btn-icon" onClick={() => drawer.current?.showModal()} aria-label="Open navigation">
            <Menu />
          </button>
        </div>
      </header>

      <dialog ref={drawer} className="drawer" aria-label="Navigation" onClick={(e) => e.target === drawer.current && close()}>
        <div className="drawer-inner">
          <div className="drawer-head">
            <Wordmark />
            <button type="button" className="btn btn-ghost btn-icon" onClick={close} aria-label="Close navigation">
              <X />
            </button>
          </div>
          <SidebarBody
            status={status}
            pathname={pathname}
            onNavigate={close}
            onSearch={() => {
              close();
              onSearch();
            }}
          />
        </div>
      </dialog>
    </>
  );
}
