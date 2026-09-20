import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ignored = new Set(['.git', '.knovra', '.codegraph', 'node_modules', 'vendor', 'target', 'dist', 'build', 'out', '.next', '.venv', 'venv', '__pycache__', '.cache', '.pytest_cache', '.ruff_cache', 'coverage', 'artifacts']);
const extensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.kt', '.swift', '.c', '.h', '.cpp', '.hpp', '.cs', '.rb', '.php', '.vue', '.svelte', '.html', '.css', '.scss', '.sql', '.graphql', '.proto', '.sh', '.ps1', '.md', '.mdx', '.rst', '.txt', '.toml', '.yaml', '.yml', '.json']);
const special = new Set(['Dockerfile', 'Makefile', 'LICENSE', 'Gemfile']);
const secretName = /(^\.env($|\.)|credentials|secrets?|\.pem$|\.key$|\.p12$|\.pfx$|^id_(rsa|ed25519)$|^\.npmrc$|^\.netrc$)/i;

export function redact(text) {
  return text
    .replace(/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z ]+ )?PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b(?:AKIA[0-9A-Z]{16}|gh[pousr]_[\w]{20,}|github_pat_[\w]{20,}|sk-(?:proj-)?[\w-]{16,})\b/g, '[REDACTED_TOKEN]')
    .replace(/(bearer\s+)[\w.\-+/=]{8,}/gi, '$1[REDACTED]')
    .replace(/((?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\s*["']?\s*[:=]\s*)["']?[^\s,"';}]+["']?/gi, '$1[REDACTED]')
    .replace(/(:\/\/[^\s/:@]+:)[^\s@]+@/g, '$1[REDACTED]@');
}

export function within(root, file) {
  const rel = path.relative(root, file);
  return rel === '' || (!path.isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${path.sep}`));
}

// Every path component is checked: a nested directory symlink must not escape the repository.
export function safeFile(root, relative) {
  const full = path.resolve(root, relative);
  if (!within(root, full)) throw new Error('File path is outside the project');
  let current = root;
  for (const part of path.relative(root, full).split(path.sep)) {
    if (!part) continue;
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) return null;
  }
  return full;
}

export function candidates(root) {
  const ignorePath = path.join(root, '.knovraignore');
  const patterns = fs.existsSync(ignorePath) && !fs.lstatSync(ignorePath).isSymbolicLink()
    ? fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')) : [];
  if (patterns.some(s => s.startsWith('!'))) throw new Error('.knovraignore supports exclusion globs only, not ! negation');
  function excluded(relative) {
    const parts = relative.split('/');
    return parts.some(p => ignored.has(p) || secretName.test(p)) || patterns.some(p => path.matchesGlob(relative, p.replace(/\/$/, '/**')) || path.matchesGlob(parts.at(-1), p));
  }
  function eligible(relative) {
    return !excluded(relative) && (extensions.has(path.extname(relative).toLowerCase()) || special.has(path.basename(relative))) && !/(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(relative);
  }
  const git = spawnSync('git', ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '.'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true, timeout: 10000 });
  let files = [];
  if (git.status === 0) {
    files = git.stdout.split('\0').filter(Boolean).map(s => s.replaceAll('\\', '/')).filter(eligible);
  } else {
    let visited = 0;
    function walk(dir, prefix = '') {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (++visited > 100000) throw new Error('Repository scan limit exceeded; add exclusions to .knovraignore');
        const relative = prefix + entry.name;
        if (entry.isSymbolicLink() || excluded(relative)) continue;
        if (entry.isDirectory()) walk(path.join(dir, entry.name), relative + '/');
        else if (entry.isFile() && eligible(relative)) files.push(relative);
      }
    }
    walk(root);
  }
  files = [...new Set(files)].sort();
  if (files.length > 20000) throw new Error('More than 20,000 eligible files; add exclusions to .knovraignore');
  return { files, gitIgnoreApplied: git.status === 0 };
}

export function terms(query) {
  const stop = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'for', 'in', 'is', 'it', 'of', 'how', 'what', 'why', 'does', 'with', 'this', 'that', 'please', 'our']);
  return [...new Set(query.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [])].filter(t => !stop.has(t)).slice(0, 24);
}
