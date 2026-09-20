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
  Palette,
  Check,
  ArrowRight,
  Menu,
  X,
  Terminal,
  BookOpen,
  Boxes,
  Gauge,
  HardDrive,
  Key,
  ShieldAlert,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { useTheme, ThemeName, THEMES } from './ThemeProvider';
import CommandPalette from './CommandPalette';
import { useDialogFocus } from './useDialogFocus';

// Product Mega Menu Items
const PRODUCT_MENU = [
  {
    href: '/graph',
    title: 'Context Graph Explorer',
    desc: 'Interactive Neo4j & AST cross-language dependency topology',
    icon: Network,
    badge: 'Signature',
  },
  {
    href: '/context',
    title: 'Context Compiler Studio',
    desc: 'Task prompt to minimum sufficient ContextBundle pipeline',
    icon: Cpu,
    badge: 'Interactive',
  },
  {
    href: '/impact',
    title: 'Impact Simulator',
    desc: 'Multi-hop caller prediction and blast-radius analysis',
    icon: Activity,
  },
  {
    href: '/rules',
    title: 'Governance Rules',
    desc: 'Deterministic architectural constraints & security invariants',
    icon: ShieldCheck,
  },
  {
    href: '/decisions',
    title: 'Architectural Decisions',
    desc: 'Immutable ADR lineage, trade-offs, and affected file links',
    icon: GitPullRequest,
  },
  {
    href: '/local-first',
    title: 'Local-First Runtime',
    desc: 'Air-gapped intelligence on customer machines without code upload',
    icon: HardDrive,
    badge: 'Private',
  },
];

// Developers Mega Menu Items
const DEVELOPERS_MENU = [
  {
    href: '/docs',
    title: 'Documentation',
    desc: 'Platform guides, indexing walkthroughs, and core concepts',
    icon: BookOpen,
  },
  {
    href: '/architecture',
    title: 'Runtime Architecture',
    desc: '6-stage compiler pipeline, IPC socket, and router flow',
    icon: Layers,
    badge: 'Core',
  },
  {
    href: '/providers',
    title: 'Provider Independence',
    desc: 'Bring Your Own Keys: Claude, Codex, Gemini, Ollama, Local models',
    icon: Key,
  },
  {
    href: '/benchmarks',
    title: 'Token Reduction & Latency',
    desc: 'Context evaluation methodology and illustrative examples',
    icon: Gauge,
  },
  {
    href: '/agents',
    title: 'Agent Registry',
    desc: 'Registered AI coding harnesses and transcript memories',
    icon: Bot,
  },
  {
    href: '/history',
    title: 'Git Provenance',
    desc: 'Cryptographic commit log and linked ADR enforcement',
    icon: History,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, themes, currentThemeConfig } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  useDialogFocus(mobileDrawerOpen, drawerRef);

  const productDropdownRef = useRef<HTMLDivElement>(null);
  const devDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener for dynamic floating-to-solid transition
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
      if (devDropdownRef.current && !devDropdownRef.current.contains(e.target as Node)) {
        setDevOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer and menus on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setProductOpen(false);
    setDevOpen(false);
    setThemeOpen(false);
  }, [pathname]);

  // Global shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setProductOpen(false);
        setDevOpen(false);
        setThemeOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine Navbar Variant
  // Variant 1: Floating Transparent Pill on Homepage when scrollY < 20
  // Variant 2: Solid Sticky on Docs, Providers, Architecture, etc.
  // Variant 3: Minimal Developer Navbar on /graph and /context
  // Variant 4: Scrolled state on Homepage
  const isMinimalDevMode = pathname === '/graph' || pathname === '/context';
  const isHome = pathname === '/';
  const isFloatingVariant = isHome && !isScrolled;

  return (
    <>
      <header className={isMinimalDevMode ? "nav-developer" : "nav-public"}
        style={{
          position: 'sticky',
          top: isFloatingVariant ? '12px' : 0,
          zIndex: 90,
          width: '100%',
          maxWidth: isFloatingVariant ? '1360px' : '100%',
          margin: isFloatingVariant ? '0 auto' : 0,
          padding: isFloatingVariant ? '0 1rem' : 0,
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            backgroundColor: isFloatingVariant ? 'var(--bg-card)' : 'var(--bg-primary)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isFloatingVariant ? '1px solid var(--border-strong)' : 'none',
            borderBottom: isFloatingVariant ? '1px solid var(--border-strong)' : '1px solid var(--border-default)',
            borderRadius: isFloatingVariant ? '16px' : 0,
            boxShadow: isFloatingVariant ? 'var(--shadow-lg), 0 0 24px var(--accent-glow)' : 'var(--shadow-sm)',
            transition: 'all 0.25s ease',
          }}
        >
          {/* =========================================================================
              VARIANT 3: MINIMAL DEVELOPER NAVBAR (/graph & /context)
              ========================================================================= */}
          {isMinimalDevMode ? (
            <div
              style={{
                maxWidth: '1680px',
                margin: '0 auto',
                padding: '0.55rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              {/* Left: Minimal Logo + Active Repository Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000',
                      flexShrink: 0,
                    }}
                  >
                    <Network size={14} />
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    Knovra
                  </span>
                </Link>

                <span style={{ color: 'var(--border-strong)', fontSize: '0.9rem' }}>/</span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <FolderGit2 size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontWeight: 600 }}>knovra-monorepo</span>
                  <span className="knovra-badge knovra-badge-green" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                    main
                  </span>
                </div>

                {/* Subsystem Quick Switcher Tabs */}
                <div style={{ display: 'none', gap: '0.25rem', alignItems: 'center', marginLeft: '0.5rem' }} className="dev-tabs">
                  <Link
                    href="/graph"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '0.78rem',
                      fontWeight: pathname === '/graph' ? 700 : 500,
                      color: pathname === '/graph' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: pathname === '/graph' ? 'var(--bg-secondary)' : 'transparent',
                      border: pathname === '/graph' ? '1px solid var(--border-default)' : '1px solid transparent',
                      textDecoration: 'none',
                    }}
                  >
                    Code Graph
                  </Link>
                  <Link
                    href="/context"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '0.78rem',
                      fontWeight: pathname === '/context' ? 700 : 500,
                      color: pathname === '/context' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: pathname === '/context' ? 'var(--bg-secondary)' : 'transparent',
                      border: pathname === '/context' ? '1px solid var(--border-default)' : '1px solid transparent',
                      textDecoration: 'none',
                    }}
                  >
                    Context Planner
                  </Link>
                  <Link
                    href="/docs"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Docs
                  </Link>
                </div>
              </div>

              {/* Right: Runtime Status Indicator, Search ⌘K, Theme, GitHub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                {/* Runtime Status Pill */}
                <div
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--status-ok)',
                  }}
                  className="runtime-pill"
                >
                  <style jsx>{`
                    @media (min-width: 680px) {
                      .runtime-pill {
                        display: inline-flex !important;
                      }
                    }
                  `}</style>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-ok)',
                      boxShadow: '0 0 8px var(--status-ok)',
                    }}
                  />
                  <span>Illustrative demo</span>
                </div>

                {/* ⌘K Command Palette */}
                <button
                  aria-label="Search documentation" onClick={() => setPaletteOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  <Search size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⌘K</span>
                </button>

                {/* Theme Selector */}
                <div className="nav-theme-control" ref={themeDropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setThemeOpen(!themeOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: currentThemeConfig.accentPreview,
                      }}
                    />
                    <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {themeOpen && (
                    <div
                      className="knovra-dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '210px',
                        padding: '0.45rem',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        6 Curated Themes
                      </div>
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                            setThemeOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '5px',
                            backgroundColor: theme === t.id ? 'var(--bg-secondary)' : 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: t.accentPreview,
                              }}
                            />
                            <span>{t.name}</span>
                          </div>
                          {theme === t.id && <Check size={12} style={{ color: 'var(--accent-primary)' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <span>Overview</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            /* =========================================================================
               STANDARD / HOMEPAGE NAVBAR (Variants 1, 2, 4)
               ========================================================================= */
            <div
              style={{
                maxWidth: '1440px',
                margin: '0 auto',
                padding: isFloatingVariant ? '0.65rem 1.25rem' : '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              {/* Left: Brand Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 16px var(--accent-glow)',
                      color: '#000000',
                      flexShrink: 0,
                    }}
                  >
                    <Network size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '1.12rem',
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.1,
                      }}
                    >
                      Knovra
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-primary)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Project Intelligence
                    </span>
                  </div>
                </Link>

                {/* Desktop Nav Items with Mega Menus (Screens >= 960px) */}
                <nav style={{ display: 'none', gap: '0.35rem', alignItems: 'center' }} className="desktop-nav-menu">
                  <style jsx>{`
                    @media (min-width: 960px) {
                      .desktop-nav-menu {
                        display: flex !important;
                      }
                    }
                  `}</style>

                  {/* Overview Link */}
                  <Link
                    href="/"
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: pathname === '/' ? 600 : 500,
                      color: pathname === '/' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: pathname === '/' ? 'var(--bg-secondary)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      border: pathname === '/' ? '1px solid var(--border-default)' : '1px solid transparent',
                    }}
                  >
                    Overview
                  </Link>

                  {/* Product Mega Menu Trigger */}
                  <div ref={productDropdownRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        setProductOpen(!productOpen);
                        setDevOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        color: productOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: productOpen ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Product</span>
                      <ChevronDown
                        size={13}
                        style={{
                          transform: productOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>

                    {productOpen && (
                      <div
                        className="knovra-dropdown-menu knovra-mega-menu"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                        }}
                      >
                        {PRODUCT_MENU.map((item) => {
                          const Icon = item.icon;
                          const isSubActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setProductOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.65rem',
                                padding: '0.6rem 0.7rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isSubActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                backgroundColor: isSubActive ? 'var(--bg-secondary)' : 'transparent',
                                transition: 'all 0.15s ease',
                              }}
                              className="knovra-card-interactive"
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--bg-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--accent-primary)',
                                  flexShrink: 0,
                                  border: '1px solid var(--border-default)',
                                }}
                              >
                                <Icon size={15} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.title}</span>
                                  {item.badge && (
                                    <span className="knovra-badge knovra-badge-blue" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Documentation Link */}
                  <Link
                    href="/docs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: pathname.startsWith('/docs') ? 600 : 500,
                      color: pathname.startsWith('/docs') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: pathname.startsWith('/docs') ? 'var(--bg-secondary)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      border: pathname.startsWith('/docs') ? '1px solid var(--border-default)' : '1px solid transparent',
                    }}
                  >
                    <span>Docs</span>
                    <span className="knovra-badge knovra-badge-green" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                      v0.4
                    </span>
                  </Link>

                  {/* Developers Mega Menu Trigger */}
                  <div ref={devDropdownRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        setDevOpen(!devOpen);
                        setProductOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        color: devOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: devOpen ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Developers</span>
                      <ChevronDown
                        size={13}
                        style={{
                          transform: devOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>

                    {devOpen && (
                      <div
                        className="knovra-dropdown-menu knovra-mega-menu"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                        }}
                      >
                        {DEVELOPERS_MENU.map((item) => {
                          const Icon = item.icon;
                          const isSubActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDevOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.65rem',
                                padding: '0.6rem 0.7rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isSubActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                backgroundColor: isSubActive ? 'var(--bg-secondary)' : 'transparent',
                                transition: 'all 0.15s ease',
                              }}
                              className="knovra-card-interactive"
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--bg-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--accent-secondary)',
                                  flexShrink: 0,
                                  border: '1px solid var(--border-default)',
                                }}
                              >
                                <Icon size={15} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.title}</span>
                                  {item.badge && (
                                    <span className="knovra-badge knovra-badge-purple" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Benchmarks Link */}
                  <Link
                    href="/benchmarks"
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: pathname === '/benchmarks' ? 600 : 500,
                      color: pathname === '/benchmarks' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: pathname === '/benchmarks' ? 'var(--bg-secondary)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      border: pathname === '/benchmarks' ? '1px solid var(--border-default)' : '1px solid transparent',
                    }}
                  >
                    Benchmarks
                  </Link>
                </nav>
              </div>

              {/* Right: Quick Search, Theme Dropdown, GitHub, CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Command Palette Trigger */}
                <button
                  aria-label="Search documentation" onClick={() => setPaletteOpen(true)}
                  title="Search documentation, routes, CLI... (⌘K)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Search size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ display: 'none' }} className="search-pill-label">
                    Search docs...
                  </span>
                  <style jsx>{`
                    @media (min-width: 640px) {
                      .search-pill-label {
                        display: inline !important;
                      }
                    }
                  `}</style>
                  <kbd
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ⌘K
                  </kbd>
                </button>

                {/* Theme Selector (Desktop & Tablet) */}
                <div className="nav-theme-control" ref={themeDropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setThemeOpen(!themeOpen)}
                    title={`Theme: ${currentThemeConfig.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: '50%',
                        backgroundColor: currentThemeConfig.accentPreview,
                        border: '1px solid var(--border-strong)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ display: 'none', fontWeight: 500 }} className="desktop-theme-label">
                      {currentThemeConfig.name}
                    </span>
                    <style jsx>{`
                      @media (min-width: 1140px) {
                        .desktop-theme-label {
                          display: inline !important;
                        }
                      }
                    `}</style>
                    <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {themeOpen && (
                    <div
                      className="knovra-dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '240px',
                        padding: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.4rem 0.6rem 0.3rem',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        6 Curated Themes
                      </div>
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                            setThemeOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: theme === t.id ? 'var(--bg-secondary)' : 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: t.accentPreview,
                                border: '1px solid var(--border-default)',
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: theme === t.id ? 700 : 500 }}>{t.name}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.description}</div>
                            </div>
                          </div>
                          {theme === t.id && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* GitHub Monorepo Link */}
                <a
                  href="https://github.com/knovra/knovra"
                  target="_blank"
                  rel="noreferrer"
                  className="nav-github-control" title="Knovra GitHub Monorepo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Github size={16} />
                </a>

                {/* Get Started / Launch Explorer Button */}
                <Link
                  href="/graph"
                  className="knovra-btn-primary"
                  style={{
                    display: 'none',
                    padding: '7px 15px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                  }}
                  id="navbar-cta-graph"
                >
                  <style jsx>{`
                    @media (min-width: 768px) {
                      #navbar-cta-graph {
                        display: inline-flex !important;
                      }
                    }
                  `}</style>
                  <span>Explore Graph</span>
                  <ArrowRight size={13} />
                </Link>

                {/* Mobile Drawer Hamburger Trigger (< 960px) */}
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                  aria-label="Open navigation menu" aria-expanded={mobileDrawerOpen} className="mobile-hamburger-btn"
                >
                  <style jsx>{`
                    @media (max-width: 959px) {
                      .mobile-hamburger-btn {
                        display: inline-flex !important;
                      }
                    }
                  `}</style>
                  <Menu size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER (< 960px)
          ========================================================================= */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Navigation menu"
            style={{
              width: '100%',
              maxWidth: '380px',
              height: '100%',
              backgroundColor: 'var(--bg-primary)',
              borderLeft: '1px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                  }}
                >
                  <Network size={15} />
                </div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Knovra</span>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Mobile Quick Search Button */}
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setPaletteOpen(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Search size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Search documentation...</span>
                </div>
                <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>⌘K</kbd>
              </button>

              {/* Product Section */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Product Intelligence
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {PRODUCT_MENU.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-primary)',
                          backgroundColor: pathname === item.href ? 'var(--bg-secondary)' : 'transparent',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        <Icon size={16} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Developers Section */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Developers & Platform
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {DEVELOPERS_MENU.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-primary)',
                          backgroundColor: pathname === item.href ? 'var(--bg-secondary)' : 'transparent',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        <Icon size={16} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Theme Switcher Mobile */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Active Theme ({currentThemeConfig.name})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: theme === t.id ? 'var(--bg-secondary)' : 'transparent',
                        border: `1px solid ${theme === t.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: theme === t.id ? 700 : 500,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: t.accentPreview,
                        }}
                      />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-default)' }}>
              <Link
                href="/graph"
                onClick={() => setMobileDrawerOpen(false)}
                className="knovra-btn-primary"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <span>Launch Graph Explorer</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Global ⌘K Command Palette Modal */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
