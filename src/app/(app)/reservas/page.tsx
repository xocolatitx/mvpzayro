"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  RESERVATION_STATUS_COLORS,
  RESERVATION_STATUS_LABELS,
} from "@/lib/constants";
import { useCrmStore } from "@/stores/crm-store";
import type { ReservationStatus } from "@/types";

export default function ReservasPage() {
  const reservations = useCrmStore((s) => s.reservations);
  const clients = useCrmStore((s) => s.clients);
  const events = useCrmStore((s) => s.events);
  const updateStatus = useCrmStore((s) => s.updateReservationStatus);

  const statuses: ReservationStatus[] = [
    "pendiente",
    "confirmada",
    "asistio",
    "no_show",
    "cancelada",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide">RESERVAS</h1>
        <Link
          href="/reservas/nueva"
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-white px-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </Link>
      </div>

      <div className="space-y-3">
        {reservations.map((res) => {
          const client = clients.find((c) => c.id === res.client_id);
          const event = events.find((e) => e.id === res.event_id);

          return (
            <div
              key={res.id}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/clientes/${res.client_id}`}
                    className="font-semibold hover:underline"
                  >
                    {client?.name ?? "Cliente"}
                  </Link>
                  {event && (
                    <p className="mt-0.5 text-sm text-zinc-400">
                      {event.club} · {event.name}
                    </p>
                  )}
                </div>
                <Badge
                  className={`shrink-0 border-0 text-[10px] uppercase ${RESERVATION_STATUS_COLORS[res.status]}`}
                >
                  {RESERVATION_STATUS_LABELS[res.status]}
                </Badge>
              </div>

              <div className="mt-3 flex gap-4 text-sm text-zinc-400">
                <span>{res.people_count} personas</span>
                {res.is_vip && (
                  <span className="text-amber-400">VIP</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(res.id, status)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      res.status === status
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {RESERVATION_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
