"use client";

import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DAY_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCrmStore } from "@/stores/crm-store";

export default function EventosPage() {
  const events = useCrmStore((s) => s.events);
  const sorted = [...events].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide">EVENTOS</h1>
        <Link
          href="/eventos/nuevo"
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-white px-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Link>
      </div>

      <div className="space-y-3">
        {sorted.map((event) => {
          const isToday = event.event_date === today;
          return (
            <div
              key={event.id}
              className={`rounded-xl border p-4 ${
                isToday
                  ? "border-white/20 bg-gradient-to-br from-zinc-900 to-black"
                  : "border-white/10 bg-zinc-900/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.event_date)} · {DAY_LABELS[event.day_of_week]}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{event.name}</h3>
                  <p className="text-sm text-zinc-400">{event.club}</p>
                </div>
                {isToday && (
                  <Badge className="border-0 bg-orange-500/20 text-orange-400">
                    HOY
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <Stat label="Entradas" value={event.entries_count} />
                <Stat label="VIP" value={event.vip_count} />
                <Stat label="Reservas" value={event.reservations_count} />
                <Stat
                  label="Facturación"
                  value={formatCurrency(event.revenue_estimate)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-black/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
