import fs from 'node:fs';
import path from 'node:path';
import RepositoryExplorer from '../../components/RepositoryExplorer';

export default function RepositoryPage() {
  const root = fs.existsSync(path.join(process.cwd(), 'packages/local/package.json')) ? process.cwd() : path.resolve(process.cwd(), '../..');
  const paths = ['packages/local/src/index.mjs','packages/local/src/memory-graph.mjs','packages/local/src/cli.mjs','packages/local/src/files.mjs','apps/web/components/ProductShell.tsx','apps/web/components/ThemeProvider.tsx','apps/web/app/page.tsx','apps/web/app/product.css'];
  const files = paths.map(file => {
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    const lines = content.split(/\r?\n/);
    const declarations = lines.flatMap((line, index) => {
      const match = line.match(/(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|interface)\s+([\w$]+)/);
      return match ? [{name:match[1],line:index+1}] : [];
    });
    return {path:file,content,lines:lines.length,language:file.endsWith('.css')?'CSS':file.endsWith('.tsx')?'TSX':'JavaScript',declarations};
  });
  return <RepositoryExplorer files={files}/>;
}

