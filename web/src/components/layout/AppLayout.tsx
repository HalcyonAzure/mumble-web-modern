import React from 'react';
import { TopBar } from './TopBar';
import { ChannelTree } from '@/components/channel/ChannelTree';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useChannelStore } from '@/stores';

export function AppLayout() {
  const { roots, childrenMap } = useChannelStore((s) => s.getChannelTree());
  const currentChannelId = useChannelStore((s) => s.currentChannelId);
  const selfSession = useChannelStore((s) => s.selfSession);

  return (
    <div className="flex flex-col h-screen bg-mumble-bg text-mumble-text">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: Channel Tree */}
        <div className="w-[280px] flex flex-col border-r border-mumble-border bg-mumble-bg2">
          <div className="flex-1 overflow-y-auto p-3">
            {roots.map((ch) => (
              <ChannelTree
                key={ch.id}
                channel={ch}
                childrenMap={childrenMap}
                depth={0}
                currentChannelId={currentChannelId}
                selfSession={selfSession}
              />
            ))}
          </div>
        </div>

        {/* Main: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
