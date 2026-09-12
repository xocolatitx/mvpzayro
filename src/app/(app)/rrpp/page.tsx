"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, Users } from "lucide-react";
import { useCrmStore } from "@/stores/crm-store";

export default function RrppPage() {
  const rrppMembers = useCrmStore((s) => s.rrppMembers);
  const clients = useCrmStore((s) => s.clients);
  const reservations = useCrmStore((s) => s.reservations);

  return (
    <div className="space-y-4">
      <Link
        href="/mas"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Más
      </Link>

      <h1 className="text-lg font-bold tracking-wide">RRPP</h1>

      {rrppMembers.map((member) => {
        const captured = clients.filter((c) => c.rrpp_id === member.id);
        const memberReservations = reservations.filter((r) =>
          captured.some((c) => c.id === r.client_id)
        );
        const entries = captured.reduce((a, c) => a + c.outings_count, 0);

        return (
          <div
            key={member.id}
            className="rounded-xl border border-white/10 bg-zinc-900/50 p-4"
          >
            <h2 className="text-xl font-bold">{member.name}</h2>
            {member.phone && (
              <p className="text-sm text-zinc-400">{member.phone}</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric
                icon={Users}
                label="Clientes captados"
                value={captured.length}
              />
              <Metric
                icon={TrendingUp}
                label="Entradas"
                value={entries}
              />
              <Metric label="Reservas" value={memberReservations.length} />
              <Metric
                label="Comisión"
                value={`${member.commission_rate}%`}
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-bold tracking-widest text-zinc-500">
                TOP CAPTADOS
              </p>
              <div className="space-y-1">
                {[...captured]
                  .sort((a, b) => b.zayro_score - a.zayro_score)
                  .slice(0, 5)
                  .map((c) => (
                    <Link
                      key={c.id}
                      href={`/clientes/${c.id}`}
                      className="flex justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-white/5"
                    >
                      <span>{c.name}</span>
                      <span className="text-zinc-400">{c.zayro_score} pts</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-black/30 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <p className="mt-0.5 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
