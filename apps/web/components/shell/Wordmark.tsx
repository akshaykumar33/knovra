/** Knovra mark: a folded page with a cited line — memory you can point to. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="wordmark">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none">
        <path d="M5 3h9l5 5v13H5z" fill="var(--surface)" stroke="var(--text)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v5h5" stroke="var(--text)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8.5 12.5h7M8.5 16h4.5" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8.5" cy="12.5" r="2" fill="var(--accent)" />
      </svg>
      <span className="wordmark-text">knovra</span>
    </span>
  );
}
