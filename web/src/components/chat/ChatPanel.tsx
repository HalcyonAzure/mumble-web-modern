import React, { useState, useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { useChatStore, useChannelStore } from '@/stores';
import { getClient } from '@/protocol/MumbleClient';

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentChannelId = useChannelStore((s) => s.currentChannelId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !currentChannelId) return;
    getClient().sendTextMessage(input.trim(), currentChannelId);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
      </div>
      <div className="p-3 border-t border-mumble-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg bg-mumble-bg3 border border-mumble-border text-sm resize-none h-[36px] focus:border-mumble-accent focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-mumble-accent text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
