import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SESSION_KEY } from '../services/api';

const AuthContext = createContext(null);

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = useCallback((userPayload) => {
    setSession(userPayload);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userPayload));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // The backend rejected our token (expired / revoked): drop the session.
  useEffect(() => {
    window.addEventListener('dd:unauthorized', logout);
    return () => window.removeEventListener('dd:unauthorized', logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user: session, isAuthenticated: Boolean(session?.token), login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
