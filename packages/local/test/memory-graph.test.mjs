import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Knovra } from '../src/index.mjs';
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'knovra-graph-'));
 const k=new Knovra(root);
 t.after(()=>{k.close();fs.rmSync(root,{recursive:true,force:true});}); return {k,root};
}
test('recall traverses persisted links, bounds output and deduplicates cycles',t=>{
 const {k,root}=fixture(t);
 k.remember({id:'palette',title:'Lavender palette',body:'Semantic colors in apps/web/app/product.css.'});
 k.remember({id:'contrast',title:'Foreground checks',body:'Test both light and dark themes.'});
 k.remember({id:'motion',title:'Entrance behavior',body:'Release transforms after transitions.'});
 k.link('palette','contrast','constrains'); k.link('contrast','motion'); k.link('motion','palette'); k.link('palette','contrast','constrains');
 const other=new Knovra(root); const result=other.recall('Lavender',{hops:2}); other.close();
 const pack=JSON.parse(result.json); assert.equal(pack.nodes.length,3); assert.equal(pack.edges.length,3);
 assert.equal(new Set(pack.nodes.map(n=>n.id)).size,3);
 assert.ok(result.characters<=4000); assert.equal(result.characters,result.json.length);
 for(const budget of [500,750,1000]) assert.ok(k.recall('Lavender',{maxChars:budget}).json.length<=budget);
 assert.equal(JSON.parse(k.recall('Lavender',{hops:0}).json).nodes.length,1);
});
test('superseded notes are excluded, invalid links rejected, content redacted',t=>{
 const {k}=fixture(t);
 k.remember({id:'old',kind:'decision',title:'Colors',body:'Use green.'});
 k.remember({id:'new',kind:'decision',title:'Colors',body:'Use lavender. api_key=superprivatecredential',supersedes:'old'});
 assert.deepEqual(JSON.parse(k.recall('Colors').json).nodes.map(n=>n.id),['new']);
 assert.doesNotMatch(k.memory('new').body,/superprivatecredential/);
 assert.throws(()=>k.link('old','new')); assert.throws(()=>k.link('new','missing')); assert.throws(()=>k.link('new','new'));
 assert.throws(()=>k.recall('Colors',{maxChars:499})); assert.throws(()=>k.recall('Colors',{hops:4}));
 assert.equal(JSON.parse(k.recall('unmatchedvocabulary').json).nodes.length,0);
});

import { spawnSync } from 'node:child_process';
test('CLI handles the default root, explicit root and repeated command words',t=>{
 const {root}=fixture(t);
 const cli=path.resolve('packages/local/src/cli.mjs');
 function run(args) { const r=spawnSync(process.execPath,[cli,...args],{cwd:root,encoding:'utf8',windowsHide:true}); assert.equal(r.status,0,r.stderr); return JSON.parse(r.stdout); }
 const saved=run(['remember','remember','Keep the word remember in this note.']);
 assert.equal(saved.title,'remember');
 assert.equal(run(['memory',saved.id]).body,'Keep the word remember in this note.');
 assert.equal(run(['--root',root,'recall','remember']).nodes[0].id,saved.id);
 assert.equal(run(['recall','remember']).nodes.length,1);
});
