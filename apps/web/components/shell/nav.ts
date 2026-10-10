import { BookMarked, GitCommitHorizontal, Layers, LayoutDashboard, Plug, Search, Settings2, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

/** Ordered as the working loop: check the index, find code, pack context, record why, review change. */
export const WORKFLOW: NavItem[] = [
  { href: '/app', label: 'Overview', hint: 'Index health and next steps', icon: LayoutDashboard },
  { href: '/app/explore', label: 'Explore', hint: 'Search files, symbols and records', icon: Search },
  { href: '/app/context', label: 'Context', hint: 'Build a cited pack for a task', icon: Layers },
  { href: '/app/memory', label: 'Memory', hint: 'Decisions, rules and notes', icon: BookMarked },
  { href: '/app/history', label: 'History', hint: 'Recent commits and changed files', icon: GitCommitHorizontal },
];

export const SETUP: NavItem[] = [
  { href: '/app/connect', label: 'Connect agents', hint: 'MCP setup for Claude, Codex, Cursor', icon: Plug },
  { href: '/app/settings', label: 'Settings', hint: 'Theme and project location', icon: Settings2 },
];

export function isActive(pathname: string, href: string) {
  return href === '/app' ? pathname === '/app' : pathname === href || pathname.startsWith(`${href}/`);
}
