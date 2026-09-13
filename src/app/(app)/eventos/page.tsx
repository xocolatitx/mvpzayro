"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Eye, Plus, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DAY_LABELS, RESERVATION_STATUS_COLORS, RESERVATION_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCrmStore } from "@/stores/crm-store";
import type { ReservationStatus } from "@/types";

export default function EventosPage() {
  const events = useCrmStore((s) => s.events);
  const reservations = useCrmStore((s) => s.reservations);
  const clients = useCrmStore((s) => s.clients);
  const rrppMembers = useCrmStore((s) => s.rrppMembers);
  const updateReservationStatus = useCrmStore((s) => s.updateReservationStatus);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const statuses: ReservationStatus[] = [
    "pendiente",
    "confirmada",
    "asistio",
    "no_show",
    "cancelada",
  ];

  const sorted = [...events].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  const selectedEvent = selectedEventId
    ? events.find((event) => event.id === selectedEventId) ?? null
    : null;

  const selectedReservations = selectedEvent
    ? reservations.filter((reservation) => reservation.event_id === selectedEvent.id)
    : [];
  const selectedRrpp = selectedEvent?.rrpp_id
    ? rrppMembers.find((rrpp) => rrpp.id === selectedEvent.rrpp_id) ?? null
    : null;

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

      {selectedEvent && (
        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Evento activo
              </p>
              <h2 className="mt-1 text-lg font-black">{selectedEvent.name}</h2>
              <p className="text-sm text-zinc-400">
                {selectedEvent.club} · {formatDate(selectedEvent.event_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                RRPP
              </p>
              <p className="text-sm font-semibold text-zinc-200">
                {selectedRrpp?.name ?? "Sin RRPP"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Stat label="Reservas" value={selectedReservations.length} />
            <Stat label="VIP" value={selectedReservations.filter((r) => r.is_vip).length} />
            <Stat label="Entradas" value={selectedEvent.entries_count} />
            <Stat label="Facturación" value={formatCurrency(selectedEvent.revenue_estimate)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/reservas/nueva?evento=${selectedEvent.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-black hover:bg-zinc-200"
            >
              <Ticket className="h-3.5 w-3.5" />
              Crear reserva
            </Link>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Reservas del evento
              </p>
              <span className="text-[10px] text-zinc-500">
                {selectedReservations.length} total
              </span>
            </div>
            <div className="space-y-2">
              {selectedReservations.length === 0 ? (
                <p className="text-xs text-zinc-500">Sin reservas aún</p>
              ) : (
                selectedReservations.map((reservation) => {
                  const client = clients.find((c) => c.id === reservation.client_id);
                  const statusLabel = RESERVATION_STATUS_LABELS[reservation.status];
                  return (
                    <div key={reservation.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-900 px-3 py-2">
                      <div className="min-w-[150px]">
                        <p className="text-sm font-semibold text-zinc-100">
                          {client?.name ?? "Cliente"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {reservation.people_count} personas · {statusLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[10px] ${reservation.is_vip ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"}`}>{reservation.is_vip ? "VIP" : "Entry"}</span>
                        <span className={`rounded-full border px-2 py-1 text-[10px] ${RESERVATION_STATUS_COLORS[reservation.status]}`}>{statusLabel}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={(event) => {
                              event.stopPropagation();
                              updateReservationStatus(reservation.id, status);
                            }}
                            className={`rounded-full px-2 py-1 text-[9px] font-medium transition-colors ${
                              reservation.status === status
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
                })
              )}
            </div>
          </div>
        </section>
      )}

      <div className="space-y-3">
        {sorted.map((event) => {
          const isToday = event.event_date === today;
          const isSelected = event.id === selectedEvent?.id;
          return (
            <div
              key={event.id}
              className={`rounded-xl border p-4 cursor-pointer transition hover:border-white/40 ${
                isToday
                  ? "border-white/20 bg-linear-to-br from-zinc-900 to-black"
                  : "border-white/10 bg-zinc-900/50"
              } ${isSelected ? "ring-1 ring-white/70" : ""}`}
              onClick={() => {
                setSelectedEventId(event.id);
              }}
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
                <div className="flex gap-2">
                  {isToday && (
                    <Badge className="border-0 bg-orange-500/20 text-orange-400">
                      HOY
                    </Badge>
                  )}
                  <button
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-300 hover:bg-white hover:text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEventId(event.id);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    Ver
                  </button>
                </div>
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
