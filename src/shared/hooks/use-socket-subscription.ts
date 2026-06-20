'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useOrchestrationStore, type StreamChunk, type ActivityLogEntry } from '@/shared/store/orchestration-store';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
const POLL_INTERVAL_MS = 30_000;
const RECONNECT_WAIT_MS = 10_000;

interface UseSocketSubscriptionOptions {
  projectId?: string | null;
  initialStatus?: string;
  initialCurrentNode?: string;
  initialRunId?: string;
  onStateChange?: (state: { status: string; currentNode: string }) => void;
  fallbackPollFn?: () => Promise<{ status: string; currentNode: string; runId?: string } | null>;
}

export function useSocketSubscription(options: UseSocketSubscriptionOptions) {
  const {
    projectId,
    initialStatus,
    initialCurrentNode,
    initialRunId,
    onStateChange,
    fallbackPollFn,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);

  const setConnectionStatus = useOrchestrationStore((s) => s.setConnectionStatus);
  const setOrchestrationState = useOrchestrationStore((s) => s.setOrchestrationState);
  const appendAgentChunk = useOrchestrationStore((s) => s.appendAgentChunk);
  const appendActivityLog = useOrchestrationStore((s) => s.appendActivityLog);
  const reset = useOrchestrationStore((s) => s.reset);

  const startPolling = useCallback(() => {
    if (!fallbackPollFn || isPollingRef.current) return;
    isPollingRef.current = true;

    const poll = async () => {
      try {
        const result = await fallbackPollFn();
        if (result) {
          setOrchestrationState({
            status: result.status,
            currentNode: result.currentNode,
            nodeStatus: 'running',
            runId: result.runId ?? '',
            error: null,
          });
          onStateChange?.(result);
        }
      } catch {
        // polling error — will retry on next interval
      }
    };

    poll();
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [fallbackPollFn, setOrchestrationState, onStateChange]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  useEffect(() => {
    if (!projectId) {
      reset();
      return;
    }

    if (initialStatus) {
      setOrchestrationState({
        status: initialStatus,
        currentNode: initialCurrentNode ?? 'unknown',
        nodeStatus: 'running',
        runId: initialRunId ?? '',
        error: null,
      });
    }

    setConnectionStatus('connecting');

    const socket = io(`${SOCKET_URL}/devflow`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      stopPolling();
      socket.emit('subscribe', { projectId });
    });

    socket.on('orchestration:state', (data: { projectId: string; status: string; currentNode: string; nodeStatus: 'entering' | 'exiting' | 'running'; runId: string; error: string | null }) => {
      setOrchestrationState({
        status: data.status,
        currentNode: data.currentNode,
        nodeStatus: data.nodeStatus,
        runId: data.runId,
        error: data.error,
      });

      onStateChange?.({ status: data.status, currentNode: data.currentNode });

      const description = data.nodeStatus === 'entering'
        ? `Entering stage: ${data.currentNode}`
        : data.nodeStatus === 'exiting'
          ? `Completed stage: ${data.currentNode}`
          : `Running: ${data.currentNode}`;

      appendActivityLog({
        timestamp: Date.now(),
        source: 'System',
        description,
        type: 'system',
      });
    });

    socket.on('agent:stream', (data: { projectId: string; nodeId: string; chunks: StreamChunk[] }) => {
      appendAgentChunk(data.projectId, data.nodeId, data.chunks);

      for (const chunk of data.chunks) {
        if (chunk.type === 'tool-call' || chunk.type === 'decision') {
          appendActivityLog({
            timestamp: chunk.timestamp ?? Date.now(),
            source: formatNodeName(data.nodeId),
            description: chunk.chunk,
            type: 'agent',
          });
        }
      }
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      reconnectTimerRef.current = setTimeout(() => {
        startPolling();
      }, RECONNECT_WAIT_MS);
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
      reconnectTimerRef.current = setTimeout(() => {
        startPolling();
      }, RECONNECT_WAIT_MS);
    });

    return () => {
      socket.emit('unsubscribe', { projectId });
      socket.disconnect();
      socketRef.current = null;
      setConnectionStatus('disconnected');
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      stopPolling();
    };
  }, [projectId, initialStatus, initialCurrentNode, initialRunId, setConnectionStatus, setOrchestrationState, appendAgentChunk, appendActivityLog, reset, stopPolling, startPolling, onStateChange]);

  const resync = useCallback(() => {
    const socket = socketRef.current;
    const state = useOrchestrationStore.getState().orchestrationState;
    if (socket?.connected && projectId && state) {
      socket.emit('resync', {
        projectId,
        status: state.status,
        currentNode: state.currentNode,
        runId: state.runId,
      });
    }
  }, [projectId]);

  return { resync };
}

function formatNodeName(nodeId: string): string {
  const labels: Record<string, string> = {
    requirements_parser: 'Requirements',
    contract_negotiator: 'Contract',
    frontend_agent: 'Frontend',
    backend_agent: 'Backend',
    database_agent: 'Database',
    architecture_agent: 'Architecture',
    validator: 'Validator',
    github_commit: 'GitHub',
  };
  return labels[nodeId] ?? nodeId.replace(/_/g, ' ');
}
