"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
};

export type SubStatus = {
  isActive: boolean;
  isTrialing: boolean;
  isPaid: boolean;
  daysLeft: number;
  status: string;
};

type Ctx = {
  user: AuthUser | null;
  sub: SubStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  login: () => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  sub: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  login: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSub(data.subscription);
      } else {
        setUser(null);
        setSub(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setSub(null);
  }, []);

  const login = useCallback(() => {
    signIn("google", { callbackUrl: "/api/auth/bootstrap" });
  }, []);

  return (
    <AuthCtx.Provider value={{ user, sub, loading, refresh, logout, login }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
