"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      data-testid="profile-logout"
      className="flex w-full items-center gap-2 rounded-2xl bg-cherry/[0.06] px-4 py-3 text-sm font-bold text-cherry hover:bg-cherry/[0.12]"
    >
      <LogOut size={16} />
      Sign out
    </button>
  );
}