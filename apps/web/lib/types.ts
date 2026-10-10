/** Contracts shared by the web workspace's server routes and client screens. */

export type MemoryKind = 'decision' | 'rule' | 'note';

export interface ProjectStatus {
  project: string;
  root: string;
  database: string;
  version: string;
  files: number;
  memories: number;
  indexedAt: string | null;
}

export interface DoctorReport {
  ok: boolean;
  checks: { name: string; ok: boolean; detail?: string }[];
  recommendations: string[];
}

export interface IndexRun {
  indexed: number;
  unchanged: number;
  deleted: number;
  files: number;
  skipped: { path: string; reason: string }[];
  gitIgnoreApplied: boolean;
  durationMs: number;
}

/** `kind` is file | symbol for source, or a memory kind for records. */
export interface SearchHit {
  id: string;
  path: string;
  startLine: number;
  endLine: number;
  kind: string;
  content: string;
  rank: number;
}

export interface ContextPack {
  task: string;
  markdown: string;
  selected: (SearchHit & { truncated?: boolean })[];
  characters: number;
  maxChars: number;
  tokenEstimate: number;
}

export interface IndexedFile {
  path: string;
  bytes: number;
}

export interface EngineFile extends IndexedFile {
  content: string;
  symbols: { name: string; line: number }[];
}

export interface Memory {
  id: string;
  kind: MemoryKind;
  title: string;
  body: string;
  createdAt: string;
  supersedes: string | null;
  supersededBy: string | null;
}

export interface Commit {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  subject: string;
  body: string;
  files: { path: string; added: number | null; removed: number | null }[];
}

export interface ApiError {
  error: string;
}
