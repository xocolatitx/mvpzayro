"use client";

import Link from "next/link";
import {
  Crown,
  Database,
  Download,
  RotateCcw,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useCrmStore } from "@/stores/crm-store";
import { useEffect, useState } from "react";

export default function MasPage() {
  const resetDemo = useCrmStore((s) => s.resetDemo);
  const [online, setOnline] = useState(true);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold tracking-wide">MÁS</h1>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          MÓDULOS ZAYRO OS
        </h2>
        <div className="space-y-2">
          <ModuleLink href="/rrpp" icon={Users} label="RRPP" desc="Captaciones y rendimiento" />
          <ModuleLink href="/grupos" icon={Crown} label="Grupos" desc="Group leaders y hábitos" />
        </div>
      </section>

      <Separator className="bg-white/10" />

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          ESTADO
        </h2>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 space-y-3">
          <StatusRow
            icon={online ? Wifi : WifiOff}
            label="Conexión"
            value={online ? "Online" : "Offline — datos locales"}
            ok={online}
          />
          <StatusRow
            icon={Database}
            label="Supabase"
            value={
              supabaseReady
                ? "Conectado"
                : "Modo demo (configura .env.local)"
            }
            ok={supabaseReady}
          />
        </div>
      </section>

      <Separator className="bg-white/10" />

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          PWA
        </h2>
        <p className="text-sm text-zinc-400">
          Instala ZAYRO en tu móvil: menú del navegador → &quot;Añadir a pantalla de inicio&quot;.
        </p>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Download className="h-4 w-4" />
          Cache básico activo para uso offline parcial
        </div>
      </section>

      <Separator className="bg-white/10" />

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          ZAYRO SCORE
        </h2>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 text-sm space-y-1">
          <p>Primera salida: +1</p>
          <p>Vuelve: +2</p>
          <p>Trae 5+ personas: +5</p>
          <p>Reserva VIP: +10</p>
          <p>Repite VIP: +15</p>
          <p>Alta frecuencia: +5</p>
        </div>
      </section>

      <Button
        variant="outline"
        className="w-full border-white/10"
        onClick={() => {
          if (confirm("¿Restaurar datos demo? Se perderán los cambios locales.")) {
            resetDemo();
          }
        }}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Restaurar datos demo
      </Button>

      <p className="text-center text-xs text-zinc-600">
        ZAYRO CRM v1 · MVP
      </p>
    </div>
  );
}

function ModuleLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/50 p-4 transition-colors active:bg-zinc-800"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
    </Link>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className={`text-sm font-medium ${ok ? "text-emerald-400" : "text-zinc-400"}`}>
        {value}
      </span>
    </div>
  );
}
