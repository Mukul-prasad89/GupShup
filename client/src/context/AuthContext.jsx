import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setMemoryToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.wake(); // warm a sleeping free-tier backend ASAP, then load session
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload) => {
    const d = await api.login(payload);
    setMemoryToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (payload) => {
    const d = await api.register(payload);
    setMemoryToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setMemoryToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
