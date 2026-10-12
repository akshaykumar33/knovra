#!/usr/bin/env node
/**
 * Knovra Sensitive Data Scanner
 * ------------------------------------------------------------------
 * Blocks credentials, private keys, live tokens and connection strings
 * from entering the Knovra Git history.
 *
 * Invariant #6 — Zero secret leakage in logs, embeddings, graph properties,
 * prompts or version control.
 *
 * Usage:
 *   node tools/scan-secrets.mjs                 # scan staged changes (pre-commit)
 *   node tools/scan-secrets.mjs --worktree      # scan all uncommitted changes vs HEAD
 *   node tools/scan-secrets.mjs --range A..B    # scan a commit range (CI / pull requests)
 *
 * Exit codes:
 *   0 = clean
 *   1 = sensitive data detected (commit/PR must be blocked)
 *   2 = scanner could not run (bad arguments, not a git repository)
 *
 * Escape hatch for reviewed false positives (use sparingly, never for real secrets):
 *   - append `knovra:allow-secret` as a trailing comment on the offending line
 *   - or add a path/substring line to `.secret-scan-allow` in the repository root
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const MAX_BLOB_BYTES = 2 * 1024 * 1024; // 2 MB
const INLINE_PRAGMA = 'knovra:allow-secret';

/* ------------------------------------------------------------------ *
 * Detection rules
 * ------------------------------------------------------------------ */

/**
 * `confidence: 'high'` rules describe credential formats that have no
 * legitimate reason to exist in source control. They are never silenced by
 * placeholder heuristics.
 *
 * `confidence: 'heuristic'` rules match credential-shaped assignments and are
 * silenced when the captured value is an obvious placeholder or an env lookup.
 */
const RULES = [
  { id: 'private-key-block', confidence: 'high', label: 'Private key block', re: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/ },
  { id: 'aws-access-key-id', confidence: 'high', label: 'AWS access key id', re: /\b(?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}\b/ },
  { id: 'github-token', confidence: 'high', label: 'GitHub token', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { id: 'gitlab-token', confidence: 'high', label: 'GitLab token', re: /\bglpat-[A-Za-z0-9_-]{20,}\b/ },
  { id: 'slack-token', confidence: 'high', label: 'Slack token', re: /\bxox[abopsr]-[A-Za-z0-9-]{10,}\b/ },
  { id: 'slack-webhook', confidence: 'high', label: 'Slack webhook URL', re: /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9]{10,}/ },
  { id: 'anthropic-key', confidence: 'high', label: 'Anthropic API key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { id: 'openai-key', confidence: 'high', label: 'OpenAI API key', re: /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{32,}\b/ },
  { id: 'google-api-key', confidence: 'high', label: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'gcp-service-account', confidence: 'high', label: 'GCP service account key', re: /"type"\s*:\s*"service_account"/ },
  { id: 'stripe-live-key', confidence: 'high', label: 'Stripe live key', re: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/ },
  { id: 'npm-token', confidence: 'high', label: 'npm auth token', re: /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*\S+|\bnpm_[A-Za-z0-9]{36}\b/ },
  { id: 'hf-token', confidence: 'high', label: 'Hugging Face token', re: /\bhf_[A-Za-z0-9]{30,}\b/ },
  { id: 'sendgrid-key', confidence: 'high', label: 'SendGrid API key', re: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/ },
  { id: 'twilio-key', confidence: 'high', label: 'Twilio account SID/key', re: /\b(?:AC|SK)[0-9a-fA-F]{32}\b/ },
  { id: 'jwt', confidence: 'high', label: 'Signed JWT', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{10,}\b/ },
  {
    id: 'db-connection-credentials',
    confidence: 'high',
    label: 'Connection string with inline password',
    re: /\b(?:postgres|postgresql|mysql|mariadb|mongodb(?:\+srv)?|redis|rediss|amqp|amqps|bolt|neo4j(?:\+s|\+ssc)?|clickhouse|nats)\:\/\/[^\s:/@'"]+:([^\s@'"]{3,})@/,
    valueGroup: 1,
    placeholderAware: true,
  },
  {
    id: 'credential-assignment',
    confidence: 'heuristic',
    label: 'Hard-coded credential assignment',
    re: /\b(?:pass(?:word|wd)|secret|secret[_-]?key|api[_-]?key|apikey|access[_-]?key|access[_-]?token|auth[_-]?token|bearer[_-]?token|refresh[_-]?token|private[_-]?key|client[_-]?secret|encryption[_-]?key|session[_-]?secret|signing[_-]?key)\b["']?\s*(?:[:=]|=>|:=)\s*["'`]([^"'`\n]{6,})["'`]/i,
    valueGroup: 1,
    placeholderAware: true,
  },
  {
    id: 'aws-secret-access-key',
    confidence: 'heuristic',
    label: 'AWS secret access key',
    re: /aws_?secret_?access_?key\w*["']?\s*[:=]\s*["'`]?([A-Za-z0-9/+=]{40})["'`]?/i,
    valueGroup: 1,
    placeholderAware: true,
  },
];

/** Values that are clearly not real credentials. */
const PLACEHOLDER_RE = new RegExp(
  [
    '^\\s*$',
    '^\\$\\{',                                  // ${VAR}
    '^\\$[A-Z0-9_]+$',                          // $VAR
    '^%[A-Za-z0-9_]+%$',                        // %VAR%
    '^<[^>]*>$',                                // <your-token>
    '^\\{\\{.*\\}\\}$',                         // {{ template }}
    'process\\.env',
    'os\\.environ',
    'os\\.getenv',
    'System\\.getenv',
    'std::env',
    'viper\\.',
    'settings\\.',
    'config\\.',
    '(?:^|[^a-z])(?:example|sample|dummy|placeholder|changeme|change-me|redacted|omitted|masked|fake|mock|stub|dev|local|localhost|test|testing|password|secret|token|value|string|yourpassword|your[-_]?)(?:$|[^a-z])',
    '^x{3,}$',
    '^\\*{3,}$',
    '^\\.{3,}$',
    '^(?:0+|1+|a+|z+)$',
    '^(?:TODO|TBD|N/?A|NONE|NULL|UNDEFINED|UNSET)$',
    '^knovra(?:[-_][a-z0-9]+)*$',               // documented local dev defaults
  ].join('|'),
  'i',
);

/** Paths whose *entire content* is exempt (templates and generated lockfiles). */
const EXEMPT_PATH_RE = /(?:^|\/)(?:\.env\.example|\.env\.sample|\.env\.template)$|\.example$|\.sample$|\.template$|(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.lock|poetry\.lock|go\.sum|uv\.lock)$/;

/** Files that must never be committed, regardless of content. */
const FORBIDDEN_PATH_RULES = [
  { re: /(?:^|\/)\.env(?:\.(?!example$|sample$|template$)[A-Za-z0-9_.-]+)?$/, why: 'environment file with real values — commit .env.example instead' },
  { re: /\.(?:pem|key|p12|pfx|jks|keystore|ppk|asc|gpg)$/i, why: 'key material / certificate bundle' },
  { re: /(?:^|\/)id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?$/, why: 'SSH private key' },
  { re: /(?:^|\/)\.npmrc$/, why: 'may contain a registry auth token — configure it outside the repository' },
  { re: /(?:^|\/)\.pypirc$/, why: 'may contain PyPI credentials' },
  { re: /(?:^|\/)(?:\.aws|\.ssh|\.gnupg)\//, why: 'local credential directory' },
  { re: /(?:^|\/)(?:credentials|service[-_]?account(?:[-_]?key)?|gha[-_]?creds|secrets?)\.(?:json|ya?ml|ini|conf)$/i, why: 'credential file' },
  { re: /(?:^|\/)(?:terraform\.tfstate(?:\.backup)?|\.terraform\.lock\.hcl\.bak)$/, why: 'Terraform state can embed provider secrets' },
  { re: /\.(?:kdbx|ovpn|mobileprovision)$/i, why: 'credential container' },
];

/* ------------------------------------------------------------------ *
 * Git plumbing
 * ------------------------------------------------------------------ */

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function repoRoot() {
  try {
    return git(['rev-parse', '--show-toplevel']).trim();
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const mode = { kind: 'staged', range: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--worktree') mode.kind = 'worktree';
    else if (arg === '--staged') mode.kind = 'staged';
    else if (arg === '--range') {
      mode.kind = 'range';
      mode.range = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--range=')) {
      mode.kind = 'range';
      mode.range = arg.slice('--range='.length);
    } else if (arg === '-h' || arg === '--help') {
      mode.kind = 'help';
    }
  }
  return mode;
}

function diffArgs(mode) {
  const common = ['--no-color', '--unified=0', '--diff-filter=ACMR', '--no-ext-diff'];
  if (mode.kind === 'staged') return ['diff', '--cached', ...common];
  if (mode.kind === 'worktree') return ['diff', 'HEAD', ...common];
  return ['diff', ...common, mode.range];
}

function changedFiles(mode) {
  const common = ['--name-only', '--diff-filter=ACMR', '--no-renames'];
  const args =
    mode.kind === 'staged'
      ? ['diff', '--cached', ...common]
      : mode.kind === 'worktree'
        ? ['diff', 'HEAD', ...common]
        : ['diff', ...common, mode.range];
  const files = git(args).split('\n').map((line) => line.trim()).filter(Boolean);
  // Worktree mode also covers brand-new files, which is exactly where a stray
  // credential file tends to be sitting before anyone stages it.
  return mode.kind === 'worktree' ? [...new Set([...files, ...untrackedFiles()])] : files;
}

function untrackedFiles() {
  return git(['ls-files', '--others', '--exclude-standard'])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Added lines only, with their line numbers in the new file. */
function addedLines(mode) {
  const diff = git(diffArgs(mode));
  const out = [];
  let file = null;
  let lineNo = 0;

  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++ ')) {
      const path = raw.slice(4).trim();
      file = path === '/dev/null' ? null : path.replace(/^b\//, '');
      continue;
    }
    if (raw.startsWith('@@')) {
      const match = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
      lineNo = match ? Number(match[1]) : 0;
      continue;
    }
    if (!file || !raw.startsWith('+') || raw.startsWith('+++')) continue;
    out.push({ file, line: lineNo, text: raw.slice(1) });
    lineNo += 1;
  }

  if (mode.kind === 'worktree') {
    for (const file of untrackedFiles()) {
      out.push(...wholeFileLines(file));
    }
  }
  return out;
}

/** Treat every line of a not-yet-tracked file as newly added content. */
function wholeFileLines(file) {
  try {
    const raw = readFileSync(file);
    if (raw.length > MAX_BLOB_BYTES) return [];
    if (raw.includes(0)) return []; // binary
    return raw
      .toString('utf8')
      .split('\n')
      .map((text, index) => ({ file, line: index + 1, text }));
  } catch {
    return []; // unreadable, symlink, or removed mid-scan
  }
}

function loadAllowList(root) {
  const file = `${root}/.secret-scan-allow`;
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

/* ------------------------------------------------------------------ *
 * Scanning
 * ------------------------------------------------------------------ */

function isAllowListed(allowList, file, text) {
  return allowList.some((entry) => file.includes(entry) || text.includes(entry));
}

function scanLines(lines, allowList) {
  const findings = [];

  for (const { file, line, text } of lines) {
    if (EXEMPT_PATH_RE.test(file)) continue;
    if (text.includes(INLINE_PRAGMA)) continue;
    if (isAllowListed(allowList, file, text)) continue;
    if (text.length > 4096) continue; // minified/generated payload

    for (const rule of RULES) {
      const match = rule.re.exec(text);
      if (!match) continue;

      const value = rule.valueGroup ? match[rule.valueGroup] ?? '' : match[0];
      if (rule.placeholderAware && PLACEHOLDER_RE.test(value)) continue;

      findings.push({
        file,
        line,
        rule: rule.id,
        label: rule.label,
        confidence: rule.confidence,
        evidence: redact(match[0], rule.valueGroup ? value : null),
      });
      break; // one finding per line is enough to block
    }
  }
  return findings;
}

function scanPaths(files) {
  const findings = [];
  for (const file of files) {
    for (const rule of FORBIDDEN_PATH_RULES) {
      if (rule.re.test(file)) {
        findings.push({ file, line: 0, rule: 'forbidden-file', label: `Forbidden file — ${rule.why}`, confidence: 'high', evidence: file });
        break;
      }
    }
  }
  return findings;
}

function scanBlobSizes(files) {
  const findings = [];
  for (const file of files) {
    let size = 0;
    try {
      size = Number(git(['cat-file', '-s', `:${file}`]).trim());
    } catch {
      continue; // not in the index (range/worktree mode)
    }
    if (size > MAX_BLOB_BYTES) {
      findings.push({
        file,
        line: 0,
        rule: 'oversized-blob',
        label: `Oversized file (${(size / 1024 / 1024).toFixed(1)} MB) — build output or data dump does not belong in Git`,
        confidence: 'high',
        evidence: `${size} bytes`,
      });
    }
  }
  return findings;
}

/** Never print a live credential back to the terminal or CI log. */
function redact(sample, secretValue = null) {
  let out = sample.length > 100 ? `${sample.slice(0, 100)}…` : sample;
  if (secretValue && secretValue.length > 0) {
    out = out.split(secretValue).join(mask(secretValue));
  }
  return out.replace(/[A-Za-z0-9_\-+/=]{12,}/g, mask);
}

function mask(token) {
  return `${token.slice(0, 3)}${'•'.repeat(8)}${token.length > 5 ? token.slice(-2) : ''}`;
}

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

function main() {
  const mode = parseArgs(process.argv.slice(2));

  if (mode.kind === 'help') {
    console.log('Usage: node tools/scan-secrets.mjs [--staged | --worktree | --range <A>..<B>]');
    return 0;
  }
  if (mode.kind === 'range' && !mode.range) {
    console.error('scan-secrets: --range requires a revision range, e.g. --range origin/develop..HEAD');
    return 2;
  }

  const root = repoRoot();
  if (!root) {
    console.error('scan-secrets: not inside a git repository');
    return 2;
  }

  const allowList = loadAllowList(root);
  const files = changedFiles(mode);

  if (files.length === 0) {
    console.log('🔐 Sensitive data scan: no changed files to inspect.');
    return 0;
  }

  const findings = [
    ...scanPaths(files),
    ...(mode.kind === 'staged' ? scanBlobSizes(files) : []),
    ...scanLines(addedLines(mode), allowList),
  ];

  if (findings.length === 0) {
    console.log(`🔐 Sensitive data scan: clean (${files.length} file${files.length === 1 ? '' : 's'} inspected).`);
    return 0;
  }

  console.error('');
  console.error('❌ [Knovra Sensitive Data Gate] Potential secrets detected — commit blocked.');
  console.error('');
  for (const finding of findings) {
    const location = finding.line > 0 ? `${finding.file}:${finding.line}` : finding.file;
    console.error(`  • ${location}`);
    console.error(`      rule     : ${finding.rule} (${finding.confidence} confidence)`);
    console.error(`      issue    : ${finding.label}`);
    console.error(`      evidence : ${finding.evidence}`);
  }
  console.error('');
  console.error('Required remediation:');
  console.error('  1. Remove the value from the file; read it from an environment variable or a secret manager.');
  console.error('  2. Document the variable name (never the value) in .env.example.');
  console.error('  3. If the credential was ever pushed, ROTATE it — deleting the line does not revoke it.');
  console.error('  4. Re-stage and commit again.');
  console.error('');
  console.error(`False positive? Append \`${INLINE_PRAGMA}\` to the line, or add an entry to .secret-scan-allow,`);
  console.error('and say why in the pull request. Never use --no-verify to bypass this gate.');
  console.error('');
  return 1;
}

process.exit(main());
