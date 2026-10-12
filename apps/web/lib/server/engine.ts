import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { EngineFile, IndexedFile, Memory, MemoryKind, SearchHit, ContextPack, ProjectStatus, DoctorReport, IndexRun } from '../types';

/** Shape of the @knovra/local engine, as used by the web workspace. */
interface Engine {
  root: string;
  databasePath: string;
  close(): void;
  index(): IndexRun;
  status(): Record<string, unknown>;
  doctor(): DoctorReport;
  search(query: string, options?: { limit?: number }): SearchHit[];
  context(task: string, options?: { maxChars?: number; limit?: number }): ContextPack;
  remember(input: { kind: MemoryKind; title: string; body: string; supersedes?: string | null }): Record<string, unknown>;
  memories(options?: { includeSuperseded?: boolean }): Record<string, unknown>[];
  files(): IndexedFile[];
  file(path: string): EngineFile | null;
}

interface EngineModule {
  Knovra: new (root: string) => Engine;
  VERSION: string;
}

function walkUp(start: string, test: (dir: string) => boolean): string | null {
  let dir = path.resolve(start);
  for (;;) {
    if (test(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** The engine ships in this monorepo; the project it reads can be any directory. */
export function enginePaths() {
  const monorepo = walkUp(process.cwd(), (dir) => fs.existsSync(path.join(dir, 'packages', 'local', 'src', 'index.mjs')));
  if (!monorepo) throw new Error('Cannot find packages/local. Start the web app from inside the Knovra repository.');
  const src = path.join(monorepo, 'packages', 'local', 'src');
  return { module: path.join(src, 'index.mjs'), cli: path.join(src, 'cli.mjs'), monorepo };
}

/** KNOVRA_ROOT picks the project; otherwise the repository the web app runs in. */
export function projectRoot(): string {
  const configured = process.env.KNOVRA_ROOT;
  if (configured) return path.resolve(configured);
  return enginePaths().monorepo;
}

let loaded: Promise<EngineModule> | null = null;

function loadEngine(): Promise<EngineModule> {
  // webpackIgnore keeps node:sqlite out of the bundle; Node loads the engine as-is at runtime.
  loaded ??= import(/* webpackIgnore: true */ pathToFileURL(enginePaths().module).href) as Promise<EngineModule>;
  return loaded;
}

/** Opens the project store for one request and always closes it. */
export async function withProject<T>(work: (engine: Engine) => T): Promise<T> {
  const { Knovra } = await loadEngine();
  const engine = new Knovra(projectRoot());
  try {
    return work(engine);
  } finally {
    engine.close();
  }
}

export async function engineVersion(): Promise<string> {
  return (await loadEngine()).VERSION;
}

/** The MCP tool list, read from the server module itself so this page cannot drift from it. */
export async function mcpTools(): Promise<{ name: string; description: string }[]> {
  const url = pathToFileURL(path.join(path.dirname(enginePaths().module), 'mcp.mjs')).href;
  const mcp = (await import(/* webpackIgnore: true */ url)) as { toolDefinitions(): { name: string; description: string }[] };
  return mcp.toolDefinitions().map(({ name, description }) => ({ name, description }));
}

export function readStatus(engine: Engine): ProjectStatus {
  const s = engine.status();
  return {
    project: String(s.project),
    root: String(s.root),
    database: String(s.database),
    version: String(s.version),
    files: Number(s.files),
    memories: Number(s.memories),
    indexedAt: typeof s.indexedAt === 'string' ? s.indexedAt : null,
  };
}

/**
 * Indexed files edited or deleted after the last index, by modification time.
 * Paths come from the index and are re-checked to stay inside the project.
 */
export function changedSinceIndex(root: string, files: IndexedFile[], indexedAt: string | null) {
  const changed: string[] = [];
  let missing = 0;
  if (!indexedAt) return { changed, missing };
  const cutoff = new Date(indexedAt).getTime();
  const base = path.resolve(root) + path.sep;
  for (const file of files) {
    const full = path.resolve(root, file.path);
    if (!full.startsWith(base)) continue;
    try {
      if (fs.statSync(full).mtimeMs > cutoff) changed.push(file.path);
    } catch {
      missing++;
    }
  }
  return { changed, missing };
}

export function readMemories(engine: Engine, includeSuperseded = false): Memory[] {
  return engine.memories({ includeSuperseded }).map((m) => ({
    id: String(m.id),
    kind: m.kind as MemoryKind,
    title: String(m.title),
    body: String(m.body),
    createdAt: String(m.created_at),
    supersedes: m.supersedes ? String(m.supersedes) : null,
    supersededBy: m.superseded_by ? String(m.superseded_by) : null,
  }));
}
