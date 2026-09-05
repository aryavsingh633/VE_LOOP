import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const applySession = useCallback((session) => {
    sessionStorage.setItem('velop_access_token', session.token);
    setUser(session.user);
    return session;
  }, []);
  useEffect(() => {
    const token = sessionStorage.getItem('velop_access_token');
    if (!token) {
      setReady(true);
      return;
    }
    authService
      .me()
      .then(({ user: nextUser }) => setUser(nextUser))
      .catch(() => sessionStorage.removeItem('velop_access_token'))
      .finally(() => setReady(true));
  }, []);
  const login = useCallback(
    async (payload) => applySession(await authService.login(payload)),
    [applySession],
  );
  const register = useCallback(
    async (payload) => applySession(await authService.register(payload)),
    [applySession],
  );
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      sessionStorage.removeItem('velop_access_token');
      setUser(null);
    }
  }, []);
  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, ready, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
