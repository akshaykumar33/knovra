#!/usr/bin/env node
import process from 'node:process';
import readline from 'node:readline';
import { Knovra, text } from './index.mjs';
import { handle } from './mcp.mjs';
const args = process.argv.slice(2);
const ri = args.indexOf('--root');
const root = ri >= 0 ? args[ri + 1] : process.cwd();
if (ri >= 0 && (!root || root.startsWith('-'))) { console.error('--root requires a directory'); process.exit(2); }
const remaining = args.filter((_, i) => ri < 0 || (i !== ri && i !== ri + 1));
const command = remaining[0] ?? 'help';
const positional = remaining.slice(1);
function help() { console.log(`Knovra Local 0.3.0 — local project intelligence without an account

Usage: knovra index | status | doctor | search <query> | context <task> | export <task> [file] | remember <title> <body> | memories | recall <query> | memory <id> | link <source> <target> [relation] | watch | mcp
  --root PATH may be added to any command. The index lives in .knovra/local.sqlite.`); }
if (command === 'mcp') {
  const rl = readline.createInterface({ input: process.stdin });
  for await (const line of rl) { if (!line.trim()) continue; let req; try { req = JSON.parse(line); } catch { console.log(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })); continue; } const out = await handle(req, root); if (out) console.log(JSON.stringify(out)); }
} else {
  let k;
  try { k = new Knovra(root); let out;
    if (command === 'help' || command === '--help' || command === '-h') { help(); process.exit(0); }

    if (command === 'index') out = k.index(); else if (command === 'status') out = k.status(); else if (command === 'doctor') out = k.doctor(); else if (command === 'search') out = k.search(text(positional.join(' '), 'query', 2000)); else if (command === 'context') out = k.context(text(positional.join(' '), 'task', 2000)); else if (command === 'export') out = k.exportContext(text(positional[0], 'task', 2000), positional[1] ?? null); else if (command === 'remember') out = k.remember({ title: positional[0], body: positional.slice(1).join(' ') }); else if (command === 'recall') out = k.recall(text(positional.join(' '), 'query', 2000)); else if (command === 'memory') out = k.memory(positional[0]); else if (command === 'link') out = k.link(positional[0], positional[1], positional[2]); else if (command === 'memories') out = k.memories(); else if (command === 'watch') {
      const once = args.includes('--once'); let last = null;
      const tick = () => { try { const next = k.index(); const changed = next.indexed > 0 || next.deleted > 0; if (changed || !last) console.log(JSON.stringify(next, null, 2)); last = next; } catch (error) { console.error(`Knovra watch: ${error instanceof Error ? error.message : String(error)}`); } };
      tick();
      if (once) { k.close(); process.exit(0); }
      const timer = setInterval(tick, 1500); process.once('SIGINT', () => { clearInterval(timer); k.close(); process.exit(0); }); await new Promise(() => {});
    } else throw new Error(`Unknown command: ${command}`);
    console.log(command === 'recall' ? out.json : JSON.stringify(out, null, 2)); k.close();
  } catch (e) { console.error(`Knovra: ${e instanceof Error ? e.message : String(e)}`); process.exitCode = 1; try { k?.close(); } catch {} }
}
