"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { ClientDetailActions } from "@/components/clients/client-detail-actions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CLIENT_TYPE_COLORS,
  CLIENT_TYPE_LABELS,
  DAY_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate, formatPhone } from "@/lib/format";
import { useCrmStore } from "@/stores/crm-store";

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const client = useCrmStore((s) => s.clients.find((c) => c.id === id));
  const group = useCrmStore((s) =>
    s.groups.find((g) => g.id === client?.group_id)
  );

  if (!client) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">Cliente no encontrado</p>
        <Link href="/clientes" className="mt-4 text-sm text-white underline">
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Clientes
      </Link>

      <div>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          {client.name}
        </h1>
        {client.phone && (
          <a
            href={`tel:${client.phone}`}
            className="mt-2 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <Phone className="h-4 w-4" />
            {formatPhone(client.phone)}
          </a>
        )}
      </div>

      <Badge
        className={`border-0 text-xs uppercase ${CLIENT_TYPE_COLORS[client.type]}`}
      >
        {CLIENT_TYPE_LABELS[client.type]}
      </Badge>

      <section className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/50 p-4">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          PERFIL
        </h2>
        <div className="space-y-2 text-sm">
          <Row label="Tipo" value={CLIENT_TYPE_LABELS[client.type]} />
          {client.university && (
            <Row label="Universidad" value={client.university} />
          )}
          <Row label="Origen" value={client.origin} />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/50 p-4">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          HÁBITOS
        </h2>
        <div className="space-y-2 text-sm">
          <Row label="Día" value={DAY_LABELS[client.preferred_day]} />
          {client.usual_club && (
            <Row label="Club" value={client.usual_club} />
          )}
          <Row label="Grupo" value={`${client.usual_group_size} personas`} />
          {group && <Row label="Grupo habitual" value={group.name} />}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/50 p-4">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          CONSUMO
        </h2>
        <div className="space-y-2 text-sm">
          <Row label="Salidas" value={String(client.outings_count)} />
          <Row label="VIP" value={String(client.vip_count)} />
          <Row label="Reservas" value={String(client.reservations_count)} />
          <Row
            label="Gasto estimado"
            value={formatCurrency(client.estimated_spend)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900 to-black p-4 text-center">
        <p className="text-xs font-bold tracking-widest text-zinc-500">
          ZAYRO SCORE
        </p>
        <p className="mt-1 text-5xl font-black tabular-nums">{client.zayro_score}</p>
      </section>

      <section className="space-y-2 text-sm text-zinc-400">
        <h2 className="text-xs font-bold tracking-widest text-zinc-500">
          ÚLTIMA ACTIVIDAD
        </h2>
        <p>{formatDate(client.last_activity_at)}</p>
      </section>

      <Separator className="bg-white/10" />

      <ClientDetailActions client={client} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}
