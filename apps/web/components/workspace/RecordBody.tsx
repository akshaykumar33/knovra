import Link from 'next/link';

// `code` spans, or repository-style paths such as apps/web/lib/url.ts (a slash and an extension).
const TOKEN = /(`[^`\n]+`)|((?:[\w.@-]+\/)+[\w.-]+\.[A-Za-z]{1,6}\b)/g;

/** Plain text with inline code and file paths made useful: paths open in Explore. Never renders HTML. */
export function RecordBody({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    if (match[1]) {
      parts.push(<code key={index}>{match[1].slice(1, -1)}</code>);
    } else {
      parts.push(
        <Link key={index} href={`/app/explore?file=${encodeURIComponent(match[2])}`} className="body-path">
          {match[2]}
        </Link>,
      );
    }
    last = index + match[0].length;
  }
  parts.push(text.slice(last));
  return <div className="record-body">{parts}</div>;
}
