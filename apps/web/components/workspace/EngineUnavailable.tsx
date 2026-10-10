import { AlertTriangle } from 'lucide-react';

/** Shown when the local engine cannot open the project; says why and what to do. */
export function EngineUnavailable({ message }: { message: string }) {
  return (
    <div className="panel panel-pad unavailable">
      <div className="callout callout-danger" role="alert">
        <AlertTriangle aria-hidden />
        <div>
          <p>
            <strong>Knovra could not open this project.</strong>
          </p>
          <p>{message}</p>
        </div>
      </div>
      <ul className="unavailable-steps">
        <li>
          The web app needs <strong>Node.js 22.5 or newer</strong> for its built-in SQLite. Check with <code>node --version</code>.
        </li>
        <li>
          To open a different repository, start the app with <code>KNOVRA_ROOT=/path/to/project</code>.
        </li>
        <li>
          Run <code>node packages/local/src/cli.mjs doctor</code> from the repository root for a full health report.
        </li>
      </ul>
    </div>
  );
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
