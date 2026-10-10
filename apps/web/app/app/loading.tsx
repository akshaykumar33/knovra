/** Shown while a workspace screen renders on the server; mirrors the page frame so nothing jumps. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="page-header">
        <div className="page-header-text">
          <div className="skeleton" style={{ height: 34, width: 220 }} />
          <div className="skeleton" style={{ height: 18, width: 'min(520px, 80vw)' }} />
        </div>
      </div>
      <div className="loading-grid">
        <div className="skeleton" style={{ height: 320 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    </div>
  );
}
