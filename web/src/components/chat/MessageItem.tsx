import React from 'react';
import { formatTime } from '@/lib/utils';
import type { ChatMessage } from '@/protocol/types';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="px-2 py-1 hover:bg-white/[0.02] rounded">
      <span className="text-xs text-mumble-text2 mr-2">{formatTime(message.timestamp)}</span>
      <span className="text-sm font-medium text-mumble-accent mr-2">{message.actorName}</span>
      <span className="text-sm text-mumble-text">{message.message}</span>
    </div>
  );
}
