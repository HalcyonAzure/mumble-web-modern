import React from 'react';

interface VoiceIndicatorProps {
  active?: boolean;
  level?: number;
}

export function VoiceIndicator({ active, level = 0 }: VoiceIndicatorProps) {
  const bars = [0.3, 0.5, 0.7, 0.9, 0.6];
  const scale = active ? level / 100 : 0;

  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm bg-mumble-accent transition-all duration-100"
          style={{ height: `${Math.max(20, h * 100 * scale)}%` }}
        />
      ))}
    </div>
  );
}
