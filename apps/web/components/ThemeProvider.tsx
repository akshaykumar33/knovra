'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@radix-ui/themes';

export type ThemeName =
  | 'knovra-dark'
  | 'knovra-light'
  | 'midnight'
  | 'graphite'
  | 'aurora'
  | 'terminal';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  description: string;
  bgPreview: string;
  accentPreview: string;
  isDark: boolean;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'knovra-dark',
    name: 'Knovra Dark',
    description: 'Graphite surfaces with soft violet and cool cyan accents',
    bgPreview: '#0B0D12',
    accentPreview: '#B5A5FF',
    isDark: true,
  },
  {
    id: 'knovra-light',
    name: 'Knovra Light',
    description: 'Porcelain surfaces with ink text and violet accents',
    bgPreview: '#F5F6FA',
    accentPreview: '#6551C8',
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Pitch-black abyss with neon ultraviolet and indigo luminescence',
    bgPreview: '#030712',
    accentPreview: '#8B5CF6',
    isDark: true,
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Monochromatic industrial steel with warm amber indicators',
    bgPreview: '#12141A',
    accentPreview: '#F59E0B',
    isDark: true,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Deep petrol marine palette with electric teal & mint energy',
    bgPreview: '#04131D',
    accentPreview: '#06B6D4',
    isDark: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'High-density cathode monochrome with phosphor-green signals',
    bgPreview: '#050B05',
    accentPreview: '#22C55E',
    isDark: true,
  },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: ThemeConfig[];
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'knovra-theme-preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('knovra-dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      if (stored && THEMES.some((t) => t.id === stored)) {
        setThemeState(stored);
        document.documentElement.setAttribute('data-theme', stored);
      } else {
        const initial = 'knovra-dark';
        setThemeState(initial);
        document.documentElement.setAttribute('data-theme', initial);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const currentThemeConfig =
    THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: THEMES,
        currentThemeConfig,
      }}
    >
      <Theme appearance={currentThemeConfig.isDark ? 'dark' : 'light'} accentColor={theme === 'graphite' ? 'amber' : theme === 'aurora' ? 'cyan' : theme === 'terminal' ? 'green' : 'iris'} grayColor="slate" radius="large" panelBackground="solid">{children}</Theme>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
