import path from 'node:path';

const adapters = new Map();
export function registerParser(extensions, parser) {
  if (!Array.isArray(extensions) || typeof parser !== 'function') throw new Error('registerParser requires extensions and a parser function');
  for (const extension of extensions) adapters.set(extension.toLowerCase(), parser);
}
export function parseSymbols(content, relative) {
  const extension = path.extname(relative).toLowerCase();
  const custom = adapters.get(extension);
  if (custom) return custom(content, relative);
  return [];
}
