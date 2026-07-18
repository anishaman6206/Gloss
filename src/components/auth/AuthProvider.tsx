"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";

// The Median wrapper injects "median" into the in-app webview's user agent.
// Absent in every regular desktop/mobile browser.
function isMedianApp() {
  return typeof navigator !== "undefined" && navigator.userAgent.indexOf("median") >= 0;
}

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
  streak: number;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  login: () => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  sub: null,
  streak: 0,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  login: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSub(data.subscription);
        setStreak(data.streak ?? 0);
      } else {
        setUser(null);
        setSub(null);
        setStreak(0);
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
    setStreak(0);
  }, []);

  // Native Google sign-in via the Median JS Bridge. Uses redirectUri mode
  // (a real navigation carrying the verified token to our backend), not the
  // callback mode: the native account picker can recreate the webview's JS
  // context, which would silently drop an in-memory callback. The redirect
  // lands on /api/auth/native/google, which establishes the session and
  // sends the browser on to /scan — remounting this provider, whose effect
  // below then picks the new session up via the normal refresh() call.
  const loginNative = useCallback(() => {
    window.median?.socialLogin.google.login({
      redirectUri: `${window.location.origin}/api/auth/native/google`,
    });
  }, []);

  const login = useCallback(() => {
    if (isMedianApp()) {
      loginNative();
    } else {
      signIn("google", { callbackUrl: "/api/auth/bootstrap" });
    }
  }, [loginNative]);

  return (
    <AuthCtx.Provider value={{ user, sub, streak, loading, refresh, logout, login }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
