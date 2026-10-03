"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "../lib/api";
import { LoginResponse } from "../lib/types";

interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "clinica_session";

// --- Suscripción a localStorage ---
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // cambios desde otras pestañas
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

// Indica si ya estamos en el cliente (false en servidor, true tras hidratar)
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

  async function login(correo: string, password: string) {
    const data = await loginRequest({ correo, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notify();
    router.push("/dashboard");
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    notify();
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading: !hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
