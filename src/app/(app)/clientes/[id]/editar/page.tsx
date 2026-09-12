"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";
import { useCrmStore } from "@/stores/crm-store";

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const client = useCrmStore((s) => s.clients.find((c) => c.id === id));
  const updateClient = useCrmStore((s) => s.updateClient);

  if (!client) {
    return (
      <div className="py-12 text-center text-zinc-500">Cliente no encontrado</div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/clientes/${id}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="text-xl font-black">EDITAR CLIENTE</h1>

      <ClientForm
        defaultValues={client}
        submitLabel="Guardar cambios"
        onSubmit={(data) => {
          updateClient(id, {
            ...data,
            phone: data.phone ?? null,
            university: data.university ?? null,
            usual_club: data.usual_club ?? null,
          });
          router.push(`/clientes/${id}`);
        }}
      />
    </div>
  );
}
