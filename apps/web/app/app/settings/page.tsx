import type { Metadata } from 'next';
import { PageHeader } from '@/components/shell/PageHeader';
import { ThemeSwitch } from '@/components/shell/ThemeSwitch';
import { IndexButton } from '@/components/workspace/IndexButton';
import { EngineUnavailable, errorMessage } from '@/components/workspace/EngineUnavailable';
import { withProject, readStatus } from '@/lib/server/engine';
import { absoluteTime } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  let status;
  try {
    status = await withProject(readStatus);
  } catch (error) {
    return (
      <>
        <PageHeader title="Settings" />
        <EngineUnavailable message={errorMessage(error)} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Settings" description="Knovra keeps its configuration small on purpose. Everything below is stored on this machine." />

      <div className="settings">
        <section className="settings-row" aria-labelledby="appearance">
          <div>
            <h2 id="appearance">Appearance</h2>
            <p className="small muted">System follows your operating system. Saved in this browser only.</p>
          </div>
          <ThemeSwitch showLabels />
        </section>

        <section className="settings-row" aria-labelledby="project">
          <div>
            <h2 id="project">Project</h2>
            <p className="small muted">
              The folder this workspace reads. To open another repository, restart the web app with <code>KNOVRA_ROOT=/path/to/project</code>.
            </p>
          </div>
          <dl className="facts">
            <div>
              <dt>Folder</dt>
              <dd className="mono">{status.root}</dd>
            </div>
            <div>
              <dt>Database</dt>
              <dd className="mono">{status.database}</dd>
            </div>
            <div>
              <dt>Engine</dt>
              <dd>@knovra/local {status.version} · SQLite FTS5 keyword search</dd>
            </div>
          </dl>
        </section>

        <section className="settings-row" aria-labelledby="index">
          <div>
            <h2 id="index">Index</h2>
            <p className="small muted">
              Refreshing only re-reads files whose content changed. Add glob patterns to <code>.knovraignore</code> in the project to exclude more.
            </p>
          </div>
          <div className="settings-action">
            <p className="small">{status.indexedAt ? `Last indexed ${absoluteTime(status.indexedAt)}` : 'Not indexed yet'}</p>
            <IndexButton indexed={Boolean(status.indexedAt)} />
          </div>
        </section>
      </div>
    </>
  );
}
