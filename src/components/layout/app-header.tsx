"use client";

import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  showActions?: boolean;
}

export function AppHeader({ showActions = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl">
      <Link href="/" className="text-xl font-black tracking-[0.2em] text-white">
        ZAYRO
      </Link>
      {showActions && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-white/10"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Link
            href="/mas"
            aria-label="Ajustes"
            className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      )}
    </header>
  );
}
