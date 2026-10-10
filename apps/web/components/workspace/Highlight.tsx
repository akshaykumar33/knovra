/** Marks query words inside text. Words shorter than two characters are ignored, as in the engine. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [])];
  if (!words.length) return <>{text}</>;
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return (
    <>
      {text.split(pattern).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part))}
    </>
  );
}

/** The first line of a chunk that mentions a query word, with its line number. */
export function bestLine(content: string, startLine: number, query: string): { text: string; line: number } {
  const words = query.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [];
  const lines = content.split('\n');
  const index = Math.max(
    0,
    lines.findIndex((l) => words.some((w) => l.toLowerCase().includes(w))),
  );
  return { text: lines[index]?.trim().slice(0, 240) ?? '', line: startLine + index };
}
