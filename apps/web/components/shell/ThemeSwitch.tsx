'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export function applyTheme(choice: ThemeChoice) {
  if (choice === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
  try {
    localStorage.setItem('knovra-theme', choice);
  } catch {
    // Storage can be blocked; the choice still applies for this visit.
  }
}

export function readTheme(): ThemeChoice {
  try {
    const saved = localStorage.getItem('knovra-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // fall through to system
  }
  return 'system';
}

/** Three-way appearance control; `showLabels` for Settings, icons only in the sidebar. */
export function ThemeSwitch({ showLabels = false }: { showLabels?: boolean }) {
  const [choice, setChoice] = useState<ThemeChoice>('system');

  useEffect(() => setChoice(readTheme()), []);

  return (
    <div className="segmented" role="radiogroup" aria-label="Appearance">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <label key={value} title={label}>
          <input
            type="radio"
            name={showLabels ? 'theme-settings' : 'theme'}
            value={value}
            checked={choice === value}
            onChange={() => {
              setChoice(value);
              applyTheme(value);
            }}
            aria-label={label}
          />
          <Icon size={14} aria-hidden />
          {showLabels && label}
        </label>
      ))}
    </div>
  );
}
