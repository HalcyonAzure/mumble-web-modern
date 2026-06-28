import { create } from 'zustand';
import { immer } from 'zustand/middleware';
import type { MumbleChannel, MumbleUser } from '@/protocol/types';

interface ChannelStore {
  channels: Map<number, MumbleChannel>;
  users: Map<number, MumbleUser>;
  selfSession: number | null;
  currentChannelId: number | null;
  setChannel: (ch: MumbleChannel) => void;
  removeChannel: (id: number) => void;
  setUser: (u: MumbleUser) => void;
  removeUser: (session: number) => void;
  setSelfSession: (s: number | null) => void;
  setCurrentChannel: (id: number) => void;
  getChannelTree: () => { roots: MumbleChannel[]; childrenMap: Map<number, MumbleChannel[]> };
  clear: () => void;
}

export const useChannelStore = create<ChannelStore>()(immer((set, get) => ({
  channels: new Map(),
  users: new Map(),
  selfSession: null,
  currentChannelId: null,

  setChannel: (ch) => set((s) => { s.channels.set(ch.id, ch); }),
  removeChannel: (id) => set((s) => { s.channels.delete(id); }),
  setUser: (u) => set((s) => { s.users.set(u.session, u); }),
  removeUser: (session) => set((s) => { s.users.delete(session); }),
  setSelfSession: (sess) => set((s) => { s.selfSession = sess; }),
  setCurrentChannel: (id) => set((s) => { s.currentChannelId = id; }),

  getChannelTree: () => {
    const roots: MumbleChannel[] = [];
    const childrenMap = new Map<number, MumbleChannel[]>();
    for (const ch of get().channels.values()) {
      if (ch.parent === undefined || !get().channels.has(ch.parent)) {
        roots.push(ch);
      } else {
        const list = childrenMap.get(ch.parent) || [];
        list.push(ch);
        childrenMap.set(ch.parent, list);
      }
    }
    roots.sort((a, b) => a.position - b.position);
    for (const list of childrenMap.values()) list.sort((a, b) => a.position - b.position);
    return { roots, childrenMap };
  },

  clear: () => set((s) => {
    s.channels.clear();
    s.users.clear();
    s.selfSession = null;
    s.currentChannelId = null;
  }),
}))) {
