import { create } from 'zustand';
import { immer } from 'zustand/middleware';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  activeTheme: 'dark' | 'light';
  pttKey: string;
  pttEnabled: boolean;
  inputGain: number;
  outputVolume: number;
  lastServer: string;
  lastPort: number;
  lastUsername: string;
}

const STORAGE_KEY = 'mumble-web-settings';

function loadSettings(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSettings(s: AppSettings) {
  try {
    const { activeTheme, ...rest } = s;
    void activeTheme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch { /* ignore */ }
}

function resolveTheme(theme: AppSettings['theme']): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

const loaded = loadSettings();
const initialTheme = loaded.theme || 'dark';

interface SettingsStore extends AppSettings {
  setTheme: (t: AppSettings['theme']) => void;
  setPttKey: (k: string) => void;
  setPttEnabled: (v: boolean) => void;
  setInputGain: (v: number) => void;
  setOutputVolume: (v: number) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(immer((set, get) => ({
  theme: initialTheme,
  activeTheme: resolveTheme(initialTheme),
  pttKey: loaded.pttKey || 'CapsLock',
  pttEnabled: loaded.pttEnabled ?? true,
  inputGain: loaded.inputGain ?? 1.0,
  outputVolume: loaded.outputVolume ?? 1.0,
  lastServer: loaded.lastServer || 'your-mumble-server.com',
  lastPort: loaded.lastPort || 64738,
  lastUsername: loaded.lastUsername || '',

  setTheme: (theme) => set((s) => {
    s.theme = theme;
    s.activeTheme = resolveTheme(theme);
    saveSettings(get());
  }),
  setPttKey: (pttKey) => set((s) => { s.pttKey = pttKey; saveSettings(get()); }),
  setPttEnabled: (v) => set((s) => { s.pttEnabled = v; saveSettings(get()); }),
  setInputGain: (v) => set((s) => { s.inputGain = v; saveSettings(get()); }),
  setOutputVolume: (v) => set((s) => { s.outputVolume = v; saveSettings(get()); }),
  updateSettings: (partial) => set((s) => { Object.assign(s, partial); saveSettings(get()); }),
}))) {
