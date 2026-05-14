/**
 * @file context/AuthContext.tsx
 * Estado de sesion: usuario actual, login, logout y restauracion al cargar.
 *
 * Separado de DataContext para respetar SRP: aqui solo vive lo relacionado
 * a "quien soy", no los datos del dominio.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { api, setAuthToken } from '../services/api';

interface AuthContextValue {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_USER_KEY = 'currentUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Restaurar sesion previa al montar.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!raw) return;
    try {
      setCurrentUser(JSON.parse(raw) as User);
    } catch {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    let user: User;
    try {
      user = await api.login(email, password);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 404) return false;
      throw err;
    }
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY);
    setAuthToken(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
