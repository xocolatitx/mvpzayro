"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientCard } from "@/components/clients/client-card";
import { ClientSearch } from "@/components/clients/client-search";
import { useCrmStore } from "@/stores/crm-store";

export default function ClientesPage() {
  const clients = useCrmStore((s) => s.clients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "recurrente">("all");

  const filtered = useMemo(() => {
    let result = clients;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.usual_club?.toLowerCase().includes(q) ||
          c.university?.toLowerCase().includes(q)
      );
    }

    if (filter === "vip") result = result.filter((c) => c.is_vip);
    if (filter === "recurrente")
      result = result.filter((c) => c.outings_count >= 2);

    return [...result].sort((a, b) => b.zayro_score - a.zayro_score);
  }, [clients, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide">CLIENTES</h1>
        <Link
          href="/clientes/nuevo"
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-white px-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Link>
      </div>

      <ClientSearch value={search} onChange={setSearch} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["all", "Todos"],
            ["vip", "VIP"],
            ["recurrente", "Recurrentes"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No hay clientes que coincidan
          </p>
        ) : (
          filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))
        )}
      </div>
    </div>
  );
}
