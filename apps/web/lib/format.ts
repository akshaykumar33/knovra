const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function relativeTime(iso: string | null, now = Date.now()): string {
  if (!iso) return 'never';
  const seconds = (new Date(iso).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count.toLocaleString('en')} ${count === 1 ? one : many}`;
}

export function lineSpan(start: number, end: number): string {
  return start === end ? `:${start}` : `:${start}–${end}`;
}

/** File name first, folder second: how people scan paths. */
export function splitPath(path: string) {
  const cut = path.lastIndexOf('/');
  return { name: path.slice(cut + 1), dir: cut > 0 ? path.slice(0, cut) : '' };
}

/** Search hits for memory records carry the path "decision/<id>"; the rest are files. */
export function isMemoryKind(kind: string): kind is 'decision' | 'rule' | 'note' {
  return kind === 'decision' || kind === 'rule' || kind === 'note';
}
