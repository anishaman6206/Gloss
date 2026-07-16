"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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

  // Native Google sign-in via the Median JS Bridge: no OAuth redirect exists
  // inside the wrapper's webview, so we get an ID token straight into this
  // callback and hand it to our own verifier instead of NextAuth's.
  const loginNative = useCallback(() => {
    window.median?.socialLogin.google.login({
      callback: async (response) => {
        if (!("idToken" in response)) {
          console.log("User cancelled login or did not fully authorize.");
          return;
        }

        const res = await fetch("/api/auth/native/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: response.idToken }),
        }).catch(() => null);

        if (res?.ok) {
          await refresh();
          router.push("/scan");
        }
      },
    });
  }, [refresh, router]);

  const login = useCallback(() => {
    if (isMedianApp()) {
      loginNative();
    } else {
      signIn("google", { callbackUrl: "/api/auth/bootstrap" });
    }
  }, [loginNative]);

  return (
    <AuthCtx.Provider value={{ user, sub, loading, refresh, logout, login }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
