import React, { useState } from 'react';
import { useMumbleClient } from '@/hooks/useMumbleClient';

export function ConnectScreen() {
  const { connect, status } = useMumbleClient();
  const [proxyUrl, setProxyUrl] = useState('ws://localhost:64737');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleConnect = async () => {
    if (!username.trim()) return;
    await connect({
      host: 'your-mumble-server.com',
      port: 64738,
      proxyUrl,
      username: username.trim(),
      password,
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-mumble-bg">
      <div className="w-[380px] p-6 rounded-xl bg-mumble-bg2 border border-mumble-border">
        <h1 className="text-xl font-bold text-center mb-1">Mumble Web</h1>
        <p className="text-mumble-text2 text-center text-sm mb-6">Connect to your Mumble server</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-mumble-text2 mb-1">Proxy URL</label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-mumble-bg3 border border-mumble-border text-sm focus:border-mumble-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-mumble-text2 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg bg-mumble-bg3 border border-mumble-border text-sm focus:border-mumble-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-mumble-text2 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-mumble-bg3 border border-mumble-border text-sm focus:border-mumble-accent focus:outline-none"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={status === 'connecting' || !username.trim()}
            className="w-full py-2.5 rounded-lg bg-mumble-accent text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {status === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}
