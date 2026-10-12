import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Knovra } from '../src/index.mjs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function rpc(root, requests) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/cli.mjs'), 'mcp', '--root', root], { cwd: path.dirname(fileURLToPath(import.meta.url)), stdio: ['pipe', 'pipe', 'pipe'] });
    let output = ''; child.stdout.on('data', chunk => { output += chunk; });
    child.on('error', reject); child.on('close', code => code === 0 ? resolve(output.trim().split(/\r?\n/).map(JSON.parse)) : reject(new Error(`MCP exited ${code}`)));
    child.stdin.end(requests.map(request => JSON.stringify(request)).join('\n') + '\n');
  });
}

test('indexes searchable symbols alongside source text', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'knovra-symbol-'));
  fs.writeFileSync(path.join(root, 'app.ts'), 'export function calculateTotal(items) { return items.length; }\n');
  const k = new Knovra(root); k.index();
  const result = k.search('calculate');
  assert.ok(result.some(entry => entry.kind === 'symbol' && entry.path === 'app.ts'));
  k.close();
  fs.rmSync(root, { recursive: true, force: true });
});

test('MCP works through the real CLI subprocess', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'knovra-mcp-'));
  fs.writeFileSync(path.join(root, 'README.md'), '# subprocess check');
  const responses = await rpc(root, [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }]);
  assert.equal(responses[0].result.serverInfo.name, 'knovra-local');
  assert.ok(responses[1].result.tools.some(tool => tool.name === 'knovra_doctor'));
  fs.rmSync(root, { recursive: true, force: true });
});
