import React from 'react';
import { X } from 'lucide-react';
import { useSettingsStore } from '@/stores';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[400px] bg-mumble-bg2 rounded-xl border border-mumble-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-mumble-hover">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-mumble-text2 mb-1">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => settings.setTheme(e.target.value as any)}
              className="w-full px-3 py-2 rounded bg-mumble-bg3 border border-mumble-border text-sm"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-mumble-text2 mb-1">PTT Key</label>
            <input
              type="text"
              value={settings.pttKey}
              onChange={(e) => settings.setPttKey(e.target.value)}
              className="w-full px-3 py-2 rounded bg-mumble-bg3 border border-mumble-border text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-mumble-text2 mb-1">Input Gain</label>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.inputGain * 100}
              onChange={(e) => settings.setInputGain(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-mumble-text2 mb-1">Output Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.outputVolume * 100}
              onChange={(e) => settings.setOutputVolume(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
