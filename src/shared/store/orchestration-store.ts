import { create } from 'zustand';

export interface StreamChunk {
  nodeId: string;
  runId: string;
  type: 'token' | 'tool-call' | 'decision' | 'error';
  chunk: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface AgentStreamState {
  chunks: StreamChunk[];
  buffer: string;
}

export interface ActivityLogEntry {
  timestamp: number;
  source: string;
  description: string;
  type: 'agent' | 'system';
}

export interface OrchestrationState {
  status: string;
  currentNode: string;
  nodeStatus: 'entering' | 'exiting' | 'running' | null;
  runId: string;
  error: string | null;
}

interface OrchestrationStore {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  orchestrationState: OrchestrationState | null;
  agentStreams: Record<string, AgentStreamState>;
  activityLog: ActivityLogEntry[];

  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
  setOrchestrationState: (state: OrchestrationState) => void;
  appendAgentChunk: (projectId: string, nodeId: string, chunks: StreamChunk[]) => void;
  clearAgentStream: (nodeId: string) => void;
  appendActivityLog: (entry: ActivityLogEntry) => void;
  clearActivityLog: () => void;
  reset: () => void;
}

const MAX_CHUNKS_PER_AGENT = 500;
const MAX_ACTIVITY_LOG = 200;

export const useOrchestrationStore = create<OrchestrationStore>((set) => ({
  connectionStatus: 'disconnected',
  orchestrationState: null,
  agentStreams: {},
  activityLog: [],

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setOrchestrationState: (orchestrationState) => set({ orchestrationState }),

  appendAgentChunk: (projectId, nodeId, chunks) =>
    set((state) => {
      const current = state.agentStreams[nodeId] ?? { chunks: [], buffer: '' };
      const timestampedChunks = chunks.map((chunk) => ({
        ...chunk,
        timestamp: Date.now(),
      }));
      const allChunks = [...current.chunks, ...timestampedChunks];
      const trimmed = allChunks.length > MAX_CHUNKS_PER_AGENT
        ? allChunks.slice(-MAX_CHUNKS_PER_AGENT)
        : allChunks;
      const buffer = trimmed.map((c) => c.chunk).join('');

      return {
        agentStreams: {
          ...state.agentStreams,
          [nodeId]: { chunks: trimmed, buffer },
        },
      };
    }),

  clearAgentStream: (nodeId) =>
    set((state) => {
      const { [nodeId]: _, ...rest } = state.agentStreams;
      return { agentStreams: rest };
    }),

  appendActivityLog: (entry) =>
    set((state) => {
      const log = [...state.activityLog, entry];
      const trimmed = log.length > MAX_ACTIVITY_LOG
        ? log.slice(-MAX_ACTIVITY_LOG)
        : log;
      return { activityLog: trimmed };
    }),

  clearActivityLog: () => set({ activityLog: [] }),

  reset: () =>
    set({
      connectionStatus: 'disconnected',
      orchestrationState: null,
      agentStreams: {},
      activityLog: [],
    }),
}));
