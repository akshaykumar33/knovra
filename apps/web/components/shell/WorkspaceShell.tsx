'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import type { ProjectStatus } from '@/lib/types';

export function WorkspaceShell({ status, children }: { status: ProjectStatus | null; children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="workspace">
      <Sidebar status={status} onSearch={() => setPaletteOpen(true)} />
      <main id="main" className="workspace-main" tabIndex={-1}>
        {children}
      </main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
