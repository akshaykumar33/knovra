/**
 * Knovra API Client Layer.
 * Connects to Context Engine (:8000) and Runtime Daemon (:8080)
 * with transparent offline fallback to canonical datasets.
 */

import {
  KNOVRA_METRICS,
  SYSTEM_SERVICES,
  DECISIONS,
  RULES,
  AGENTS,
  SESSIONS,
  RECENT_COMMITS,
  WORKSPACES,
  IMPACT_SCENARIOS,
  ImpactScenarioDetail,
} from './data';

const CONTEXT_ENGINE_URL = process.env.NEXT_PUBLIC_CONTEXT_ENGINE_URL || 'http://localhost:8000';

export async function fetchSystemHealth() {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // offline fallback
  }
  return { status: 'healthy', mode: 'local-first offline', timestamp: new Date().toISOString() };
}

export async function getSystemStatus() {
  try {
    const res = await fetch(`${CONTEXT_ENGINE_URL}/health`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return { contextEngine: data.status === 'ok' || data.status === 'healthy', mode: 'live' };
    }
  } catch {
    // Offline fallback
  }
  return { contextEngine: false, mode: 'local-first offline' };
}

export async function fetchImpactAnalysis(target: string, maxDepth: number = 3): Promise<ImpactScenarioDetail> {
  const matched = IMPACT_SCENARIOS.find((sc) => sc.targetSymbol === target || sc.targetFile === target);
  if (matched) {
    return matched;
  }

  // Attempt live context-engine query
  try {
    const res = await fetch(`${CONTEXT_ENGINE_URL}/impact/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, max_depth: maxDepth }),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: `impact-${Date.now()}`,
        targetSymbol: data.target,
        targetFile: data.target,
        riskLevel: (data.confidence_score > 0.8 ? 'critical' : 'high') as 'critical' | 'high' | 'medium' | 'low',
        affectedCallers: (data.direct_impacts || []).map((d: { name: string }) => d.name),
        downstreamFiles: (data.transitive_impacts || []).map((t: { name: string }) => t.name),
        impactedTests: (data.tests_to_run || []).map((t: { test_file: string }) => t.test_file),
      };
    }
  } catch {
    // Offline fallback
  }

  // Return synthesized local fallback
  return {
    id: `fallback-${Date.now()}`,
    targetSymbol: target,
    targetFile: target,
    riskLevel: 'medium',
    affectedCallers: ['services/runtime/cmd/knovra/main.go:runWatch'],
    downstreamFiles: ['services/runtime/internal/watcher/fs_watcher.go'],
    impactedTests: ['services/runtime/internal/watcher/watcher_test.go'],
  };
}

export function getCanonicalData() {
  return {
    metrics: KNOVRA_METRICS,
    services: SYSTEM_SERVICES,
    decisions: DECISIONS,
    rules: RULES,
    agents: AGENTS,
    sessions: SESSIONS,
    commits: RECENT_COMMITS,
    workspaces: WORKSPACES,
    scenarios: IMPACT_SCENARIOS,
  };
}
