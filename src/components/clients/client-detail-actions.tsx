"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Pencil, Plus, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrmStore } from "@/stores/crm-store";
import type { Client } from "@/types";

interface ClientDetailActionsProps {
  client: Client;
}

const linkBtnClass =
  "inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-2.5 text-sm font-medium transition-colors hover:bg-zinc-800";

export function ClientDetailActions({ client }: ClientDetailActionsProps) {
  const registerOuting = useCrmStore((s) => s.registerOuting);
  const deleteClient = useCrmStore((s) => s.deleteClient);
  const router = useRouter();

  const whatsappUrl = client.phone
    ? `https://wa.me/${client.phone.replace(/\D/g, "")}`
    : null;

  const handleDelete = async () => {
    const ok = window.confirm(`¿Eliminar a ${client.name}?`);
    if (!ok) return;

    await deleteClient(client.id);
    router.push("/clientes");
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkBtnClass}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      ) : (
        <Button variant="outline" className="border-white/10 bg-zinc-900" disabled>
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
      )}

      <Link href={`/clientes/${client.id}/editar`} className={linkBtnClass}>
        <Pencil className="h-4 w-4" />
        Editar
      </Link>

      <Link href={`/reservas/nueva?cliente=${client.id}`} className={linkBtnClass}>
        <Ticket className="h-4 w-4" />
        Nueva reserva
      </Link>

      <Button
        className="bg-white font-semibold text-black hover:bg-zinc-200"
        onClick={() => registerOuting(client.id, client.is_vip)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Registrar salida
      </Button>

      <Button
        variant="outline"
        className="border-red-500/40 bg-zinc-950 text-red-300 hover:bg-red-950"
        onClick={handleDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}
