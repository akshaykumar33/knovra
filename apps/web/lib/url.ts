'use client';

import { useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type Params = Record<string, string | null | undefined>;

/**
 * URL-backed UI state without a server round trip. Next 14.1+ syncs native
 * history.pushState/replaceState with useSearchParams, so selection is instant
 * while links, reload and back/forward keep working.
 */
export function useUrlState() {
  const pathname = usePathname();
  const params = useSearchParams();

  const write = useCallback(
    (next: Params, { mode = 'push', merge = true }: { mode?: 'push' | 'replace'; merge?: boolean } = {}) => {
      const target = new URLSearchParams(merge ? params.toString() : '');
      for (const [key, value] of Object.entries(next)) {
        if (value) target.set(key, value);
        else target.delete(key);
      }
      const query = target.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (mode === 'push') window.history.pushState(null, '', url);
      else window.history.replaceState(null, '', url);
    },
    [params, pathname],
  );

  return [params, write] as const;
}

/** Move focus to a detail heading only when the list that was focused is no longer visible (one-pane layouts). */
export function focusDetail(heading: HTMLElement | null) {
  const row = document.activeElement?.closest<HTMLElement>('[data-row]');
  if (!row || row.offsetParent === null) heading?.focus();
}

/** Arrow keys move focus between the list's row buttons; Enter/Space activate them natively. */
export function onListKeyDown(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return;
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-row]')];
  if (!rows.length) return;
  event.preventDefault();
  const current = rows.indexOf(document.activeElement as HTMLElement);
  const index =
    event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : Math.min(rows.length - 1, Math.max(0, current + (event.key === 'ArrowDown' ? 1 : -1)));
  rows[index].focus();
  rows[index].click();
}
