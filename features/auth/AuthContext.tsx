"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion } from "./service";
import type { LoginResponse } from "./types";

interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "clinica_session";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notify() {
  for (const l of listeners) l();
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

const subscribeNoop = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const user = useMemo<LoginResponse | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }, [raw]);

  const login = useCallback(
    async (correo: string, password: string) => {
      const data = await iniciarSesion({ correo, password });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      notify();
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    notify();
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading: !hydrated, login, logout }),
    [user, hydrated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
