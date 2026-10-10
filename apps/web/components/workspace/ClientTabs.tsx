'use client';

import { useRef, useState } from 'react';
import { CopyBlock } from './CopyBlock';

export interface ClientSetup {
  id: string;
  name: string;
  where: string;
  label: string;
  code: string;
  after?: string;
}

/** WAI-ARIA tabs: arrow keys move between agents, Tab moves into the panel. */
export function ClientTabs({ clients }: { clients: ClientSetup[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (index: number) => {
    const next = (index + clients.length) % clients.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const client = clients[active];
  return (
    <div className="client-tabs">
      <div role="tablist" aria-label="Agent" className="tablist">
        {clients.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${c.id}`}
            tabIndex={i === active ? 0 : -1}
            className="tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') move(i + 1);
              if (e.key === 'ArrowLeft') move(i - 1);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${client.id}`} aria-labelledby={`tab-${client.id}`} className="tabpanel">
        <p className="muted">{client.where}</p>
        <CopyBlock label={client.label} code={client.code} />
        {client.after && <p className="small faint">{client.after}</p>}
      </div>
    </div>
  );
}
