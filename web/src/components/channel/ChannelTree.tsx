import React from 'react';
import { ChannelItem } from './ChannelItem';
import type { MumbleChannel, MumbleUser } from '@/protocol/types';

interface ChannelTreeProps {
  channel: MumbleChannel;
  childrenMap: Map<number, MumbleChannel[]>;
  depth: number;
  currentChannelId: number | null;
  selfSession: number | null;
}

export function ChannelTree({ channel, childrenMap, depth, currentChannelId, selfSession }: ChannelTreeProps) {
  const children = childrenMap.get(channel.id) || [];

  return (
    <ChannelItem
      channel={channel}
      depth={depth}
      isCurrent={channel.id === currentChannelId}
    >
      {children.map((ch) => (
        <ChannelTree
          key={ch.id}
          channel={ch}
          childrenMap={childrenMap}
          depth={depth + 1}
          currentChannelId={currentChannelId}
          selfSession={selfSession}
        />
      ))}
    </ChannelItem>
  );
}
