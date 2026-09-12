import Link from "next/link";
import { Calendar, MapPin, Users, Wine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CLIENT_TYPE_COLORS, CLIENT_TYPE_LABELS, DAY_LABELS } from "@/lib/constants";
import type { Client } from "@/types";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link
      href={`/clientes/${client.id}`}
      className="block rounded-xl border border-white/10 bg-zinc-900/60 p-4 transition-colors active:bg-zinc-800/80"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-white">{client.name}</h3>
        <Badge
          className={`shrink-0 border-0 text-[10px] uppercase tracking-wide ${CLIENT_TYPE_COLORS[client.type]}`}
        >
          {CLIENT_TYPE_LABELS[client.type]}
        </Badge>
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-zinc-400">
        {client.usual_club && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{client.usual_club}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{DAY_LABELS[client.preferred_day]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>Grupo habitual: {client.usual_group_size}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wine className="h-3.5 w-3.5 shrink-0" />
          <span>VIP: {client.is_vip ? "Sí" : "No"}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-500">
          ZAYRO SCORE
        </span>
        <span className="text-lg font-black text-white">{client.zayro_score}</span>
      </div>
    </Link>
  );
}
