'use client';

import React, { useState } from 'react';
import {
  FileCode2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Code2,
  GitCommit,
  Layers,
  Sparkles,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  language?: string;
  lines?: number;
  symbols?: string[];
  lastCommit?: string;
  adrs?: string[];
  children?: FileNode[];
}

const FILE_TREE: FileNode[] = [
  {
    id: 'services',
    name: 'services',
    path: 'services',
    isFolder: true,
    children: [
      {
        id: 'runtime',
        name: 'runtime',
        path: 'services/runtime',
        isFolder: true,
        children: [
          {
            id: 'runtime-main',
            name: 'cmd/server/main.go',
            path: 'services/runtime/cmd/server/main.go',
            isFolder: false,
            language: 'Go',
            lines: 142,
            symbols: ['main()', 'initServer()', 'registerMCPRoutes()'],
            lastCommit: 'dd7cc75 (feat(impact): call hierarchy)',
            adrs: ['ADR-004', 'ADR-009'],
          },
          {
            id: 'runtime-mcp',
            name: 'internal/mcp/gateway.go',
            path: 'services/runtime/internal/mcp/gateway.go',
            isFolder: false,
            language: 'Go',
            lines: 320,
            symbols: ['GatewayServer', 'HandleToolCall()', 'RegisterAgent()'],
            lastCommit: '68bf1d3 (feat(gateway): mcp jsonrpc)',
            adrs: ['ADR-004', 'ADR-008'],
          },
          {
            id: 'runtime-impact',
            name: 'internal/impact/analyzer.go',
            path: 'services/runtime/internal/impact/analyzer.go',
            isFolder: false,
            language: 'Go',
            lines: 285,
            symbols: ['ImpactAnalyzer', 'AnalyzeBlastRadius()', 'FindUpstreamCallers()'],
            lastCommit: 'dd7cc75 (feat(impact): call hierarchy)',
            adrs: ['ADR-012'],
          },
        ],
      },
      {
        id: 'code-indexer',
        name: 'code-indexer',
        path: 'services/code-indexer',
        isFolder: true,
        children: [
          {
            id: 'indexer-main',
            name: 'src/main.rs',
            path: 'services/code-indexer/src/main.rs',
            isFolder: false,
            language: 'Rust',
            lines: 195,
            symbols: ['main()', 'IndexServer::new()', 'parse_ast()'],
            lastCommit: '9c5eb24 (feat(indexer): tree-sitter)',
            adrs: ['ADR-001', 'ADR-011'],
          },
          {
            id: 'indexer-storage',
            name: 'src/storage.rs',
            path: 'services/code-indexer/src/storage.rs',
            isFolder: false,
            language: 'Rust',
            lines: 410,
            symbols: ['StorageEngine', 'upsert_symbol()', 'query_hierarchy()'],
            lastCommit: 'dd7cc75 (feat(impact): call hierarchy)',
            adrs: ['ADR-001', 'ADR-012'],
          },
        ],
      },
      {
        id: 'context-engine',
        name: 'context-engine',
        path: 'services/context-engine',
        isFolder: true,
        children: [
          {
            id: 'engine-app',
            name: 'app/main.py',
            path: 'services/context-engine/app/main.py',
            isFolder: false,
            language: 'Python',
            lines: 240,
            symbols: ['create_app()', 'health_check()', 'plan_context()'],
            lastCommit: 'dd7cc75 (feat(impact): call hierarchy)',
            adrs: ['ADR-005', 'ADR-008'],
          },
          {
            id: 'engine-impact',
            name: 'app/impact/analyzer.py',
            path: 'services/context-engine/app/impact/analyzer.py',
            isFolder: false,
            language: 'Python',
            lines: 315,
            symbols: ['ImpactEngine', 'compute_blast_radius()', 'filter_rule_violations()'],
            lastCommit: 'dd7cc75 (feat(impact): call hierarchy)',
            adrs: ['ADR-012'],
          },
        ],
      },
    ],
  },
  {
    id: 'apps',
    name: 'apps',
    path: 'apps',
    isFolder: true,
    children: [
      {
        id: 'app-web',
        name: 'web/app/page.tsx',
        path: 'apps/web/app/page.tsx',
        isFolder: false,
        language: 'TypeScript / React',
        lines: 180,
        symbols: ['OverviewPage()', 'SubsystemGrid()'],
        lastCommit: '28f1a0b (feat(web): dashboard showcase)',
        adrs: ['ADR-006'],
      },
    ],
  },
];

export default function RepositoryPage() {
  const [selectedFile, setSelectedFile] = useState<FileNode>(
    FILE_TREE[0].children![0].children![1] // internal/mcp/gateway.go
  );
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    services: true,
    runtime: true,
    'code-indexer': true,
    'context-engine': true,
    apps: true,
  });

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders[node.id];
      const isSelected = selectedFile?.id === node.id;

      if (node.isFolder) {
        return (
          <div key={node.id}>
            <div
              onClick={() => toggleFolder(node.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '4px 8px',
                paddingLeft: `${depth * 14 + 8}px`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                userSelect: 'none',
              }}
            >
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              {isExpanded ? <FolderOpen size={14} color="var(--accent-blue)" /> : <Folder size={14} color="var(--accent-blue)" />}
              <span>{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div
          key={node.id}
          onClick={() => setSelectedFile(node)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '4px 8px',
            paddingLeft: `${depth * 14 + 20}px`,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: isSelected ? 600 : 400,
          }}
        >
          <FileCode2 size={13} />
          <span>{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            <FileCode2 size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            Repository Tree & AST Symbol Inspector
          </h1>
          <span className="stripe-badge stripe-badge-green">Tree-Sitter Synced</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Explore indexed source trees, parsed AST symbol declarations, and architectural provenance links.
        </p>
      </div>

      {/* Two Column Layout: Tree on Left, Details on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Tree Explorer */}
        <div
          className="stripe-card"
          style={{
            padding: '1.25rem',
            maxHeight: '620px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            Monorepo Hierarchy
          </div>
          {renderTree(FILE_TREE)}
        </div>

        {/* Right: File AST & Provenance Inspector */}
        <div
          className="stripe-card"
          style={{
            padding: '1.5rem',
            minHeight: '400px',
          }}
        >
          {selectedFile ? (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    {selectedFile.path}
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedFile.name}
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span className="stripe-badge stripe-badge-purple">{selectedFile.language}</span>
                  <span className="stripe-badge stripe-badge-blue">{selectedFile.lines} lines</span>
                </div>
              </div>

              {/* Commit Provenance */}
              <div
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <GitCommit size={16} color="var(--accent-cyan)" />
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Latest Commit: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#ffffff' }}>
                    {selectedFile.lastCommit}
                  </span>
                </div>
              </div>

              {/* AST Symbols */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Code2 size={15} color="var(--accent-blue)" />
                  Parsed AST Symbols ({selectedFile.symbols?.length || 0})
                </h3>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  {selectedFile.symbols?.map((sym) => (
                    <div
                      key={sym}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--accent-cyan)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{sym}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>exported</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked ADRs */}
              {selectedFile.adrs && selectedFile.adrs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <ShieldCheck size={15} color="var(--accent-purple)" />
                    Architectural Governance Links
                  </h3>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {selectedFile.adrs.map((adr) => (
                      <span
                        key={adr}
                        className="stripe-badge stripe-badge-purple"
                        style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}
                      >
                        {adr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '4rem' }}>
              Select a file from the repository tree to inspect symbols and provenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
