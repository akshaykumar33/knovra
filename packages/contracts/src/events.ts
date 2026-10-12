export type AgentEventType =
  | 'AgentStarted'
  | 'TaskStarted'
  | 'PromptReceived'
  | 'FileRead'
  | 'FileCreated'
  | 'FileModified'
  | 'CommandExecuted'
  | 'TestExecuted'
  | 'TestFailed'
  | 'TestPassed'
  | 'DecisionMade'
  | 'ErrorObserved'
  | 'SolutionApplied'
  | 'TaskCompleted';

export interface AgentEvent<T = Record<string, unknown>> {
  id: string;
  type: AgentEventType;
  schemaVersion: string;
  projectId: string;
  agentId: string;
  sessionId: string;
  timestamp: string;
  payload: T;
}
