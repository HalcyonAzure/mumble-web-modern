import { create } from 'zustand';
import { immer } from 'zustand/middleware';
import type { ConnectionStatus, ConnectConfig, ServerInfo } from '@/protocol/types';

interface ConnectionStore {
  status: ConnectionStatus;
  error: string | null;
  serverInfo: ServerInfo | null;
  session: number | null;
  config: ConnectConfig | null;
  setStatus: (s: ConnectionStatus) => void;
  setError: (e: string | null) => void;
  setServerInfo: (i: ServerInfo) => void;
  setSession: (s: number | null) => void;
  setConfig: (c: ConnectConfig | null) => void;
}

export const useConnectionStore = create<ConnectionStore>()(immer((set) => ({
  status: 'disconnected',
  error: null,
  serverInfo: null,
  session: null,
  config: null,
  setStatus: (status) => set((s) => { s.status = status; }),
  setError: (error) => set((s) => { s.error = error; }),
  setServerInfo: (info) => set((s) => { s.serverInfo = info; }),
  setSession: (session) => set((s) => { s.session = session; }),
  setConfig: (config) => set((s) => { s.config = config; }),
}))) {
