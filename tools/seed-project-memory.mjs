import fs from 'node:fs';
import { Knovra } from '../packages/local/src/index.mjs';
const k=new Knovra(process.cwd());
const records=[
 ['design-direction-20260912','Premium visual direction','User requests a premium modern responsive Knovra UI with page-specific reference images. Use docs/design/reference-manifest.json and apps/web/public/design-reference/index.html. Generated copy is illustrative. Verified 2026-09-12.'],
 ['design-system-20260912','Design system and typography','Active styles: apps/web/app/globals.css and product.css. Layout uses ProductShell.tsx, not refinement.css. Obsidian and lavender with editorial heading accents. Theme tokens must stay scoped. Verified 2026-09-12.'],
 ['ui-qa-20260912','Responsive graph repairs','See docs/WEB_UI_AUDIT.md. Check fit-to-canvas, graph list flex shrink, mobile inspector fixed placement, theme contrast and real actions. Prior route checks do not establish backend readiness. Verified 2026-09-12.'],
 ['memory-graph-20260912','Compact context recall','packages/local/src/memory-graph.mjs supports explicit memory links and bounded keyword recall. CLI recall returns compact JSON; memory retrieves full records by ID. Token estimate is approximate. See docs/CONTEXT_MEMORY.md.'],
 ['design-skills-20260912','Personal design skills','Six skills installed in C:/Users/AKKIE/.codex/skills: premium-art-direction, product-design-system, responsive-product-layout, purposeful-ui-motion, visual-product-qa, compact-project-memory. Source copies: docs/design/skills.'],
];
try {
 for(const [id,title,body] of records) if(!k.memory(id)) k.remember({id,title,body,kind:'note'});
 k.link(records[0][0],records[1][0],'explains'); k.link(records[1][0],records[2][0],'constrains'); k.link(records[0][0],records[4][0]); k.link(records[4][0],records[3][0]);
 const pack=k.recall('design typography',{maxChars:3000}); fs.writeFileSync('docs/design/compact-context-example.json',pack.json); console.log({characters:pack.characters,approximateTokens:pack.tokenEstimate,nodes:JSON.parse(pack.json).nodes.length});
}finally{k.close();}
for(const dir of fs.readdirSync('docs/design/skills')) {
 const source=fs.readFileSync(`docs/design/skills/${dir}/SKILL.md`,'utf8');
 if(!source.startsWith(`---\nname: ${dir}\ndescription: `) || !source.includes('\n---\n\n') || dir.length>64 || !/^[a-z0-9-]+$/.test(dir)) throw new Error(`Invalid skill ${dir}`);
 const installed=fs.readFileSync(`C:/Users/AKKIE/.codex/skills/${dir}/SKILL.md`,'utf8'); if(source!==installed) throw new Error(`Skill copy mismatch: ${dir}`);
}
console.log('Six installed skill copies match valid simple frontmatter sources.');
