import { useCallback, useEffect, useState } from 'react';
import { getClient } from '@/protocol/MumbleClient';
import { useConnectionStore, useChannelStore, useChatStore } from '@/stores';
import type { ConnectionStatus, ConnectConfig, MumbleUser } from '@/protocol/types';

export function useMumbleClient() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const client = getClient();

  const connect = useCallback(async (config: ConnectConfig) => {
    useConnectionStore.getState().setConfig(config);
    await client.connect(config);
  }, [client]);

  const disconnect = useCallback(async () => {
    await client.disconnect();
  }, [client]);

  useEffect(() => {
    const unsubs = [
      client.on('statusChange', (s: ConnectionStatus) => setStatus(s)),
      client.on('connected', (info: any) => {
        useConnectionStore.getState().setStatus('connected');
        useConnectionStore.getState().setSession(info.session);
        useConnectionStore.getState().setServerInfo({
          welcomeText: info.welcomeText || '',
          maxBandwidth: info.maxBandwidth || 0,
          allowHtml: true,
          maxUsers: 0,
        });
        useChannelStore.getState().setSelfSession(info.session);
      }),
      client.on('channelState', (ch: any) => {
        useChannelStore.getState().setChannel(ch);
      }),
      client.on('channelRemove', (id: number) => {
        useChannelStore.getState().removeChannel(id);
      }),
      client.on('userState', (u: MumbleUser) => {
        useChannelStore.getState().setUser(u);
        if (u.session === useChannelStore.getState().selfSession && u.channelId) {
          useChannelStore.getState().setCurrentChannel(u.channelId);
        }
      }),
      client.on('userRemove', (session: number) => {
        useChannelStore.getState().removeUser(session);
      }),
      client.on('textMessage', (msg: any) => {
        const users = useChannelStore.getState().users;
        const actorName = users.get(msg.actor)?.name || `#${msg.actor}`;
        useChatStore.getState().addMessage({ ...msg, actorName });
      }),
      client.on('disconnected', () => {
        useConnectionStore.getState().setStatus('disconnected');
        useConnectionStore.getState().setSession(null);
        useChannelStore.getState().clear();
        useChatStore.getState().clear();
      }),
      client.on('error', (e: string) => {
        useConnectionStore.getState().setError(e);
      }),
      client.on('serverConfig', (info: any) => {
        useConnectionStore.getState().setServerInfo(info);
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [client]);

  return { connect, disconnect, status, error: useConnectionStore((s) => s.error) };
}
