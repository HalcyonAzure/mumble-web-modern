import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { getClient } from '@/protocol/MumbleClient';
import { useChannelStore } from '@/stores';
import type { MumbleChannel } from '@/protocol/types';

interface ChannelItemProps {
  channel: MumbleChannel;
  depth: number;
  isCurrent: boolean;
  children?: React.ReactNode;
}

export function ChannelItem({ channel, depth, isCurrent, children }: ChannelItemProps) {
  const [expanded, setExpanded] = useState(true);
  const users = useChannelStore((s) => s.users);
  const usersInChannel = Array.from(users.values()).filter((u) => u.channelId === channel.id);

  const handleDoubleClick = () => {
    getClient().moveToChannel(channel.id);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer select-none ${
          isCurrent ? 'bg-mumble-accent/15 border-l-2 border-mumble-accent' : 'hover:bg-mumble-hover'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => setExpanded(!expanded)}
        onDoubleClick={handleDoubleClick}
        title="Double-click to join"
      >
        <span className="text-mumble-text2">
          {children && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>
        <span className="text-mumble-accent">
          {isCurrent ? <FolderOpen size={16} /> : <Folder size={16} />}
        </span>
        <span className="text-sm font-medium flex-1 truncate">{channel.name}</span>
        {usersInChannel.length > 0 && (
          <span className="text-xs text-mumble-text2">{usersInChannel.length}</span>
        )}
      </div>

      {/* Users in this channel */}
      {expanded && usersInChannel.map((u) => (
        <div
          key={u.session}
          className={`flex items-center gap-2 px-2 py-0.5 text-sm ${
            u.session === useChannelStore.getState().selfSession ? 'text-green-400 font-medium' : 'text-mumble-text2'
          }`}
          style={{ paddingLeft: `${24 + depth * 16}px` }}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
            u.session === useChannelStore.getState().selfSession ? 'bg-mumble-accent text-black' : 'bg-mumble-bg3'
          }`}>
            {u.name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{u.name}</span>
          {u.selfMute && <span className="text-xs">🔇</span>}
          {u.selfDeaf && <span className="text-xs">🎧</span>}
        </div>
      ))}

      {/* Sub-channels */}
      {expanded && children}
    </div>
  );
}
