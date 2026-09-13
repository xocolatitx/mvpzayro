"use client";

import { useEffect } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useCrmStore } from "@/stores/crm-store";

interface AppShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function AppShell({ children, hideHeader }: AppShellProps) {
  const hydrateFromSupabase = useCrmStore((s) => s.hydrateFromSupabase);

  useEffect(() => {
    void hydrateFromSupabase();
  }, [hydrateFromSupabase]);

  return (
    <div className="min-h-dvh bg-black text-white">
      {!hideHeader && <AppHeader />}
      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
