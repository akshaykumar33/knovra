'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  LayoutDashboard,
  Network,
  Activity,
  Cpu,
  GitPullRequest,
  Search,
  Github,
  ChevronDown,
  Sparkles,
  FolderGit2,
  FileCode2,
  Bot,
  MessageSquareCode,
  ShieldCheck,
  History,
  Settings,
  Command,
} from 'lucide-react';

const MAIN_NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/architecture', label: 'Architecture', icon: Layers },
  { href: '/graph', label: 'Code Graph', icon: Network },
  { href: '/impact', label: 'Impact Simulator', icon: Activity, badge: 'Phase 12' },
  { href: '/context', label: 'Context Planner', icon: Cpu },
  { href: '/decisions', label: 'Decisions', icon: GitPullRequest },
];

const MORE_LINKS = [
  { href: '/projects', label: 'Workspaces', icon: FolderGit2, desc: 'Indexed repository modules' },
  { href: '/repository', label: 'Repository & AST', icon: FileCode2, desc: 'Tree-sitter symbol inspector' },
  { href: '/agents', label: 'Agent Registry', icon: Bot, desc: 'Registered AI coding harnesses' },
  { href: '/sessions', label: 'Agent Sessions', icon: MessageSquareCode, desc: 'Recorded transcript memories' },
  { href: '/rules', label: 'Rule Engine', icon: ShieldCheck, desc: 'Architectural governance rules' },
  { href: '/history', label: 'Git Provenance', icon: History, desc: 'Cryptographic commit log' },
  { href: '/settings', label: 'Settings', icon: Settings, desc: 'Runtime endpoints & IPC' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('navbar-search-input');
        if (searchInput) searchInput.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(7, 11, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-default)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              fontWeight: 900,
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
              Knovra
            </span>
            <span
              className="stripe-badge stripe-badge-green"
              style={{ fontSize: '0.62rem', padding: '2px 7px' }}
            >
              <span className="pulsing-dot" />
              UPIL v0.4.0
            </span>
          </div>
        </Link>

        {/* Center Main Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {MAIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent'}`,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="stripe-badge stripe-badge-blue"
                    style={{ fontSize: '0.58rem', padding: '1px 5px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                backgroundColor: moreOpen ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Platform</span>
              <ChevronDown size={13} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {moreOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  width: '280px',
                  backgroundColor: 'rgba(10, 15, 26, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
                  padding: '0.5rem',
                  display: 'grid',
                  gap: '0.2rem',
                  zIndex: 200,
                }}
              >
                {MORE_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isCur = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        backgroundColor: isCur ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                        color: isCur ? '#ffffff' : 'var(--text-primary)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-canvas)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCur ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        }}
                      >
                        <Icon size={13} />
                      </span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{link.label}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{link.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Nav: Search, Status, Github */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Quick Search */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={13} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Quick Search..."
              style={{
                padding: '6px 36px 6px 30px',
                fontSize: '0.8rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '180px',
                transition: 'width 0.2s ease, border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.width = '240px')}
              onBlur={(e) => (e.target.style.width = '180px')}
            />
            <kbd
              style={{
                position: 'absolute',
                right: '8px',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-canvas)',
                padding: '1px 5px',
                borderRadius: '3px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              ⌘K
            </kbd>
          </div>

          {/* Daemon Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--status-ok)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="pulsing-dot" />
            <span>ONLINE</span>
          </div>

          {/* GitHub Icon Button */}
          <a
            href="https://github.com/akshaykumar33/knovra"
            target="_blank"
            rel="noopener noreferrer"
            title="View Knovra on GitHub"
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
