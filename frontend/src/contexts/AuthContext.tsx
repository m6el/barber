'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { RecordModel } from 'pocketbase';
import getPocketBase from '@/lib/pocketbase';

interface AuthContextType {
  user: RecordModel | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const pb = getPocketBase();
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser(pb.authStore.model as RecordModel);
      setToken(pb.authStore.token);
    }
    setIsLoading(false);

    const unsubscribe = pb.authStore.onChange((t, model) => {
      setToken(t);
      setUser(model as RecordModel | null);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const pb = getPocketBase();
    const authData = await pb.collection('users').authWithPassword(email, password);
    setUser(authData.record);
    setToken(authData.token);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const pb = getPocketBase();
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
    });
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    const pb = getPocketBase();
    pb.authStore.clear();
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
