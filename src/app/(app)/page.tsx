"use client";

import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { formatCurrency, getGreeting } from "@/lib/format";
import { useCrmStore, useDashboardStats } from "@/stores/crm-store";

export default function DashboardPage() {
  const stats = useDashboardStats();
  const reservations = useCrmStore((s) => s.reservations);
  const clients = useCrmStore((s) => s.clients);

  const tonightReservations = stats.tonightEvent
    ? reservations.filter((r) => r.event_id === stats.tonightEvent?.id).length
    : 0;

  const tonightActiveClients = stats.tonightEvent
    ? clients.filter(
        (c) =>
          c.usual_club === stats.tonightEvent?.club ||
          c.last_activity_at.startsWith(new Date().toISOString().split("T")[0])
      ).length
    : stats.activeClients;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.15em] text-zinc-500">
          {getGreeting()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard value={stats.totalClients} label="CLIENT" />
        <StatCard value={stats.vipClients} label="VIP" />
        <StatCard value={stats.totalGroups} label="GROUPS" />
        <StatCard value={stats.activeClients} label="ACTIVE" />
      </div>

      {stats.tonightEvent && (
        <section className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-4">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h2 className="text-xs font-bold tracking-widest text-zinc-400">
              TONIGHT
            </h2>
          </div>
          <p className="text-lg font-bold text-white">
            {stats.tonightEvent.club} → {stats.tonightEvent.name}
          </p>
          <div className="mt-2 space-y-1 text-sm text-zinc-400">
            <p>{tonightActiveClients} clientes activos</p>
            <p>{tonightReservations || stats.tonightEvent.reservations_count} reservas</p>
            <p>{stats.tonightEvent.entries_count} entradas</p>
          </div>
        </section>
      )}

      <Link
        href="/clientes/nuevo"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-6 text-base font-black tracking-wide text-black transition-colors hover:bg-zinc-200"
      >
        <Plus className="h-5 w-5" />
        NUEVO CLIENTE
      </Link>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-widest text-zinc-500">
          ESTA SEMANA
        </h2>
        <div className="space-y-2 rounded-xl border border-white/10 bg-zinc-900/50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Clientes activos</span>
            <span className="font-semibold">{stats.activeClients}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Nuevos</span>
            <span className="font-semibold">{stats.newClientsThisWeek}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Entradas</span>
            <span className="font-semibold">{stats.entriesThisWeek}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Reservas</span>
            <span className="font-semibold">{stats.reservationsThisWeek}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-2">
            <span className="text-zinc-400">Estimado</span>
            <span className="font-bold text-white">
              {formatCurrency(stats.estimatedRevenue)}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-widest text-zinc-500">
          TOP CLIENTES
        </h2>
        <div className="space-y-2">
          {stats.topClients.map((client, i) => (
            <Link
              key={client.id}
              href={`/clientes/${client.id}`}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900/40 px-3 py-2.5 active:bg-zinc-800"
            >
              <span className="text-sm">
                <span className="mr-2 text-zinc-500">{i + 1}.</span>
                {client.name}
              </span>
              <span className="font-bold tabular-nums">{client.zayro_score} pts</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-widest text-zinc-500">
          ACTIVIDAD SEMANAL
        </h2>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
          <WeeklyChart />
        </div>
      </section>
    </div>
  );
}
