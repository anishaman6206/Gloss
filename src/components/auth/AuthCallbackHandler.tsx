"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";

export function AuthCallbackHandler() {
  const processed = useRef(false);
  const { refresh } = useAuth();

  useEffect(() => {
    if (processed.current) return;
    const hash = window.location.hash;
    if (!hash?.includes("session_id=")) return;

    processed.current = true;
    const params = new URLSearchParams(hash.slice(1));
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    (async () => {
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });
      } finally {
        // Strip hash and refresh session state
        history.replaceState(null, "", window.location.pathname + window.location.search);
        await refresh();
      }
    })();
  }, [refresh]);

  return null;
}
