import { execFile } from 'node:child_process';
import type { Commit } from '../types';

const RECORD = '\x1e';
const FIELD = '\x1f';

/** Recent commits with per-file line counts. Arguments are passed as an array; nothing is shell-parsed. */
export function readCommits(root: string, limit = 60): Promise<Commit[] | null> {
  const format = `${RECORD}%H${FIELD}%h${FIELD}%an${FIELD}%aI${FIELD}%s${FIELD}%b${FIELD}`;
  return new Promise((resolve) => {
    execFile(
      'git',
      ['-C', root, 'log', `-n${limit}`, '--no-merges', '--numstat', `--format=${format}`],
      { maxBuffer: 16 * 1024 * 1024, timeout: 10000, windowsHide: true },
      (error, stdout) => {
        if (error) return resolve(null);
        resolve(
          stdout
            .split(RECORD)
            .filter((r) => r.trim())
            .map((record) => {
              const [hash, shortHash, author, date, subject, body, stats = ''] = record.split(FIELD);
              const files = stats
                .split(/\r?\n/)
                .filter((line) => line.includes('\t'))
                .map((line) => {
                  const [added, removed, ...rest] = line.split('\t');
                  return {
                    path: rest.join('\t'),
                    added: added === '-' ? null : Number(added),
                    removed: removed === '-' ? null : Number(removed),
                  };
                });
              return { hash, shortHash, author, date, subject, body: body.trim(), files };
            }),
        );
      },
    );
  });
}
