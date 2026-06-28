import React from 'react';
import type { MumbleUser } from '@/protocol/types';

interface UserItemProps {
  user: MumbleUser;
  isSelf: boolean;
}

export function UserItem({ user, isSelf }: UserItemProps) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 text-sm rounded ${
        isSelf ? 'text-green-400 font-medium' : 'text-mumble-text2'
      } hover:bg-mumble-hover`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
        isSelf ? 'bg-mumble-accent text-black' : 'bg-mumble-bg3'
      }`}>
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="truncate">{user.name}</span>
      {user.selfMute && <span className="text-xs">🔇</span>}
      {user.selfDeaf && <span className="text-xs">🎧</span>}
    </div>
  );
}
