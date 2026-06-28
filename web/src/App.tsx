import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConnectScreen } from '@/components/layout/ConnectScreen';
import { useMumbleClient } from '@/hooks/useMumbleClient';
import { useConnectionStore } from '@/stores';

function App() {
  const { status } = useMumbleClient();

  // Apply theme
  useEffect(() => {
    const theme = useConnectionStore.getState().serverInfo ? 'dark' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return status === 'connected' ? <AppLayout /> : <ConnectScreen />;
}

export default App;
