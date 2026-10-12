'use client';

import { useMemo } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import type { IndexedFile } from '@/lib/types';

interface Dir {
  name: string;
  path: string;
  dirs: Map<string, Dir>;
  files: IndexedFile[];
  count: number;
}

function build(files: IndexedFile[]): Dir {
  const root: Dir = { name: '', path: '', dirs: new Map(), files: [], count: 0 };
  for (const file of files) {
    const parts = file.path.split('/');
    let dir = root;
    dir.count++;
    for (const part of parts.slice(0, -1)) {
      const path = dir.path ? `${dir.path}/${part}` : part;
      if (!dir.dirs.has(part)) dir.dirs.set(part, { name: part, path, dirs: new Map(), files: [], count: 0 });
      dir = dir.dirs.get(part)!;
      dir.count++;
    }
    dir.files.push(file);
  }
  return root;
}

/** Native <details> tree: keyboard and screen-reader behaviour come for free. */
export function FileTree({ files, activeFile, onOpen }: { files: IndexedFile[]; activeFile: string | null; onOpen: (path: string) => void }) {
  const root = useMemo(() => build(files), [files]);
  return (
    <div className="tree" aria-label="Indexed files">
      <p className="results-count small faint">{files.length.toLocaleString('en')} indexed files</p>
      <DirContents dir={root} activeFile={activeFile} onOpen={onOpen} />
    </div>
  );
}

function DirContents({ dir, activeFile, onOpen }: { dir: Dir; activeFile: string | null; onOpen: (path: string) => void }) {
  const dirs = [...dir.dirs.values()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <ul role="list" className="tree-list">
      {dirs.map((child) => (
        <li key={child.path}>
          <details open={Boolean(activeFile?.startsWith(`${child.path}/`))}>
            <summary className="tree-row">
              <ChevronRight aria-hidden className="tree-chevron" />
              <span className="tree-name">{child.name}</span>
              <span className="tree-count">{child.count}</span>
            </summary>
            <DirContents dir={child} activeFile={activeFile} onOpen={onOpen} />
          </details>
        </li>
      ))}
      {dir.files.map((file) => (
        <li key={file.path}>
          <button type="button" className="tree-row tree-file" aria-current={activeFile === file.path || undefined} onClick={() => onOpen(file.path)}>
            <FileText aria-hidden className="tree-file-icon" />
            <span className="tree-name">{file.path.split('/').pop()}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
