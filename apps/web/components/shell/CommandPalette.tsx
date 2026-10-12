'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookMarked, CornerDownLeft, Layers, Search, type LucideIcon } from 'lucide-react';
import { WORKFLOW, SETUP } from './nav';

interface Command {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
}

/** Jump to any screen, or send the typed text straight into search, context or memory. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setQuery('');
      setActive(0);
      el.showModal();
    } else if (!open && el.open) el.close();
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const q = query.trim();
    const pages = [...WORKFLOW, ...SETUP]
      .filter((item) => !q || `${item.label} ${item.hint}`.toLowerCase().includes(q.toLowerCase()))
      .map((item) => ({ id: item.href, label: item.label, hint: item.hint, href: item.href, icon: item.icon }));
    if (!q) return pages;
    const encoded = encodeURIComponent(q);
    return [
      { id: 'search', label: `Search the project for “${q}”`, hint: 'Explore', href: `/app/explore?q=${encoded}`, icon: Search },
      { id: 'context', label: `Build a context pack for “${q}”`, hint: 'Context', href: `/app/context?task=${encoded}`, icon: Layers },
      { id: 'memory', label: `Find “${q}” in memory`, hint: 'Memory', href: `/app/memory?q=${encoded}`, icon: BookMarked },
      ...pages,
    ];
  }, [query]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    router.push(command.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % Math.max(commands.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + commands.length) % Math.max(commands.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(commands[active]);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="palette"
      aria-label="Search or jump to"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
    >
      <div className="palette-inner">
        <div className="palette-input">
          <Search aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={commands[active] ? `cmd-${commands[active].id}` : undefined}
            aria-label="Search or jump to"
            placeholder="Type a task, symbol or screen…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="palette-list" aria-label="Results">
          {commands.map((command, index) => (
            <li
              key={command.id}
              id={`cmd-${command.id}`}
              role="option"
              aria-selected={index === active}
              className="palette-item"
              onMouseMove={() => setActive(index)}
              onClick={() => run(command)}
            >
              <command.icon aria-hidden />
              <span className="palette-label">{command.label}</span>
              <span className="palette-hint">{command.hint}</span>
              {index === active && <CornerDownLeft className="palette-enter" aria-hidden />}
            </li>
          ))}
          {commands.length === 0 && <li className="palette-empty">No screens match. Keep typing to search the project.</li>}
        </ul>
      </div>
    </dialog>
  );
}
