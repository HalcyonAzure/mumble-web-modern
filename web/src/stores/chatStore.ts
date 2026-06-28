import { create } from 'zustand';
import { immer } from 'zustand/middleware';
import type { ChatMessage } from '@/protocol/types';

interface ChatStore {
  messages: ChatMessage[];
  unreadCount: number;
  draft: string;
  addMessage: (msg: ChatMessage) => void;
  clearUnread: () => void;
  setDraft: (d: string) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>()(immer((set) => ({
  messages: [],
  unreadCount: 0,
  draft: '',
  addMessage: (msg) => set((s) => {
    s.messages.push(msg);
    if (s.messages.length > 500) s.messages.shift();
    s.unreadCount++;
  }),
  clearUnread: () => set((s) => { s.unreadCount = 0; }),
  setDraft: (draft) => set((s) => { s.draft = draft; }),
  clear: () => set((s) => {
    s.messages = [];
    s.unreadCount = 0;
    s.draft = '';
  }),
}))) {
