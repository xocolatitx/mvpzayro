"use client";

import Link from "next/link";
import { ArrowLeft, Crown, Users } from "lucide-react";
import { DAY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useCrmStore } from "@/stores/crm-store";

export default function GruposPage() {
  const groups = useCrmStore((s) => s.groups);
  const clients = useCrmStore((s) => s.clients);

  return (
    <div className="space-y-4">
      <Link
        href="/mas"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Más
      </Link>

      <h1 className="text-lg font-bold tracking-wide">GRUPOS</h1>

      {groups.map((group) => {
        const members = clients.filter((c) => c.group_id === group.id);
        const leader = clients.find((c) => c.id === group.leader_client_id);

        return (
          <div
            key={group.id}
            className="rounded-xl border border-white/10 bg-zinc-900/50 p-4"
          >
            <h2 className="text-lg font-bold uppercase">{group.name}</h2>

            <div className="mt-3 space-y-1 text-sm text-zinc-400">
              <p>Habitual: {DAY_LABELS[group.usual_day]}</p>
              <p>Media: {group.avg_size} personas</p>
              {group.usual_club && <p>Club: {group.usual_club}</p>}
              {group.last_outing_at && (
                <p>Última salida: {formatDate(group.last_outing_at)}</p>
              )}
            </div>

            {leader && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-yellow-400">
                    GROUP LEADER
                  </p>
                  <Link
                    href={`/clientes/${leader.id}`}
                    className="font-semibold hover:underline"
                  >
                    {leader.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold tracking-widest text-zinc-500">
                <Users className="h-3.5 w-3.5" />
                MIEMBROS
              </p>
              <div className="space-y-1">
                {members.map((m) => (
                  <Link
                    key={m.id}
                    href={`/clientes/${m.id}`}
                    className="block rounded-lg px-2 py-1.5 text-sm hover:bg-white/5"
                  >
                    {m.name}
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
