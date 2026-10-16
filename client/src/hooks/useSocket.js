import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL, getMemoryToken } from '../lib/api.js';

// Single shared socket per app lifetime. Avoids duplicate connections on re-render.
let sharedSocket = null;
let sharedCount = 0;

export function useSocket() {
  const [status, setStatus] = useState(sharedSocket?.connected ? 'connected' : 'connecting');
  const ref = useRef(null);

  useEffect(() => {
    sharedCount += 1;
    if (!sharedSocket) {
      sharedSocket = io(API_URL, {
        withCredentials: true,
        auth: { token: getMemoryToken() },
        reconnection: true,
        reconnectionAttempts: Infinity,
      });
    }
    const s = sharedSocket;
    ref.current = s;

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('reconnecting');
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    if (s.connected) setStatus('connected');

    return () => {
      sharedCount -= 1;
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      // Keep shared socket alive for app lifetime; disconnect on full unmount only.
      if (sharedCount <= 0 && s) {
        s.disconnect();
        sharedSocket = null;
      }
    };
  }, []);

  return { socket: ref.current, status, shared: () => sharedSocket };
}
