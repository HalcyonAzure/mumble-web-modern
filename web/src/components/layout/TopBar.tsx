import React from 'react';
import { Mic, MicOff, Headphones, LogOut } from 'lucide-react';
import { useMumbleClient } from '@/hooks/useMumbleClient';
import { useConnectionStore, useChannelStore } from '@/stores';

export function TopBar() {
  const { disconnect } = useMumbleClient();
  const status = useConnectionStore((s) => s.status);
  const serverInfo = useConnectionStore((s) => s.serverInfo);
  const currentChannelId = useChannelStore((s) => s.currentChannelId);
  const channels = useChannelStore((s) => s.channels);

  const currentChannel = currentChannelId ? channels.get(currentChannelId) : null;

  return (
    <div className="h-12 flex items-center px-4 bg-mumble-bg2 border-b border-mumble-border">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">{currentChannel?.name || 'Mumble'}</span>
        {serverInfo?.welcomeText && (
          <span className="text-xs text-mumble-text2 ml-2">{serverInfo.welcomeText.slice(0, 50)}</span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-mumble-hover text-mumble-text2 hover:text-mumble-text transition-colors">
          <Mic size={18} />
        </button>
        <button className="p-2 rounded-lg hover:bg-mumble-hover text-mumble-text2 hover:text-mumble-text transition-colors">
          <Headphones size={18} />
        </button>
        <button
          onClick={disconnect}
          className="p-2 rounded-lg hover:bg-mumble-hover text-mumble-text2 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
