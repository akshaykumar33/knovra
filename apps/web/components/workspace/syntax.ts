/**
 * A small, dependency-free highlighter for reading code: keywords, strings, comments,
 * numbers, calls and types. It is lexical, not a parser, and fails soft to plain text.
 */

export type TokenKind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'type';
export interface Token {
  text: string;
  kind?: TokenKind;
}

interface Lang {
  keywords: Set<string>;
  line: string[];
  block?: [string, string];
  triple?: boolean;
  backtick?: boolean;
  types?: boolean;
}

const words = (s: string) => new Set(s.split(' '));
const C_LIKE = 'if else for while do switch case default break continue return new class this super null true false try catch finally throw static public private protected void';

const LANGS: Record<string, Lang> = {
  js: {
    keywords: words(`${C_LIKE} const let var function extends import from export async await typeof instanceof in of undefined interface type enum implements readonly as satisfies yield keyof declare namespace abstract`),
    line: ['//'],
    block: ['/*', '*/'],
    backtick: true,
    types: true,
  },
  py: {
    keywords: words('def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda yield pass break continue global nonlocal async await self assert del'),
    line: ['#'],
    triple: true,
    types: true,
  },
  go: {
    keywords: words('func package import return if else for range switch case default break continue go defer chan map struct interface type var const nil true false select fallthrough goto'),
    line: ['//'],
    block: ['/*', '*/'],
    backtick: true,
    types: true,
  },
  rs: {
    keywords: words('fn let mut pub use mod struct enum impl trait for in if else match return self Self crate super as where loop while break continue move ref true false const static async await dyn unsafe type'),
    line: ['//'],
    block: ['/*', '*/'],
    types: true,
  },
  c: { keywords: words(`${C_LIKE} int long char bool boolean string var val fun using namespace package import final override`), line: ['//'], block: ['/*', '*/'], types: true },
  css: { keywords: new Set(), line: [], block: ['/*', '*/'] },
  json: { keywords: words('true false null'), line: [] },
  yaml: { keywords: words('true false null yes no'), line: ['#'] },
  sh: { keywords: words('if then fi else elif for do done case esac function return export local in while'), line: ['#'] },
  sql: { keywords: words('select from where insert into values update set delete create table index join left on and or not null primary key references order by limit as virtual using'), line: ['--'], block: ['/*', '*/'] },
};

const BY_EXTENSION: Record<string, string> = {
  ts: 'js', tsx: 'js', js: 'js', jsx: 'js', mjs: 'js', cjs: 'js', vue: 'js', svelte: 'js',
  py: 'py', go: 'go', rs: 'rs',
  java: 'c', cs: 'c', kt: 'c', swift: 'c', c: 'c', h: 'c', cpp: 'c', hpp: 'c', php: 'c', proto: 'c', graphql: 'c',
  css: 'css', scss: 'css',
  json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'yaml',
  sh: 'sh', ps1: 'sh', sql: 'sql',
};

export function languageFor(path: string): Lang | null {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const key = BY_EXTENSION[ext];
  return key ? LANGS[key] : null;
}

const IDENT = /[A-Za-z_$][\w$]*/y;
const NUMBER = /(?:0x[\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)/y;

/** Tokenises every line, carrying block-comment and multi-line string state between lines. */
export function highlight(lines: string[], lang: Lang | null): Token[][] {
  if (!lang) return lines.map((text) => [{ text }]);
  let open: { end: string; kind: TokenKind } | null = null;

  return lines.map((line) => {
    const out: Token[] = [];
    let plain = '';
    const flush = () => {
      if (plain) out.push({ text: plain });
      plain = '';
    };
    const push = (text: string, kind: TokenKind) => {
      flush();
      out.push({ text, kind });
    };
    let i = 0;

    if (open) {
      const end = line.indexOf(open.end);
      if (end === -1) return [{ text: line, kind: open.kind }];
      push(line.slice(0, end + open.end.length), open.kind);
      i = end + open.end.length;
      open = null;
    }

    while (i < line.length) {
      const rest = line.slice(i);
      const lineComment = lang.line.find((p) => rest.startsWith(p));
      if (lineComment) {
        push(rest, 'com');
        break;
      }
      if (lang.block && rest.startsWith(lang.block[0])) {
        const end = rest.indexOf(lang.block[1], lang.block[0].length);
        if (end === -1) {
          push(rest, 'com');
          open = { end: lang.block[1], kind: 'com' };
          break;
        }
        push(rest.slice(0, end + lang.block[1].length), 'com');
        i += end + lang.block[1].length;
        continue;
      }
      const triple = lang.triple && (rest.startsWith('"""') || rest.startsWith("'''")) ? rest.slice(0, 3) : null;
      if (triple) {
        const end = rest.indexOf(triple, 3);
        if (end === -1) {
          push(rest, 'str');
          open = { end: triple, kind: 'str' };
          break;
        }
        push(rest.slice(0, end + 3), 'str');
        i += end + 3;
        continue;
      }
      const ch = line[i];
      if (ch === '"' || ch === "'" || (ch === '`' && lang.backtick)) {
        let j = i + 1;
        while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1;
        if (j >= line.length && ch === '`') {
          push(line.slice(i), 'str');
          open = { end: '`', kind: 'str' };
          break;
        }
        push(line.slice(i, j + 1), 'str');
        i = j + 1;
        continue;
      }
      const prev = line[i - 1];
      if (/\d/.test(ch) && !(prev && /[\w$]/.test(prev))) {
        NUMBER.lastIndex = i;
        const m = NUMBER.exec(line);
        if (m) {
          push(m[0], 'num');
          i += m[0].length;
          continue;
        }
      }
      IDENT.lastIndex = i;
      const id = IDENT.exec(line);
      if (id && !(prev && /[\w$]/.test(prev))) {
        const word = id[0];
        const after = line.slice(i + word.length).trimStart();
        if (lang.keywords.has(word)) push(word, 'kw');
        else if (after.startsWith('(')) push(word, 'fn');
        else if (lang.types && /^[A-Z][a-z]/.test(word)) push(word, 'type');
        else plain += word;
        i += word.length;
        continue;
      }
      plain += ch;
      i++;
    }
    flush();
    return out;
  });
}
