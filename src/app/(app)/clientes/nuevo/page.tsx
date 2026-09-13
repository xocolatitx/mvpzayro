"use client";

import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { useCrmStore } from "@/stores/crm-store";

export default function NuevoClientePage() {
  const router = useRouter();
  const addClient = useCrmStore((s) => s.addClient);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-widest text-zinc-500">
          ALTA RÁPIDA
        </p>
        <h1 className="text-xl font-black">+ NUEVO CLIENTE</h1>
      </div>

      <ClientForm
        submitLabel="Guardar cliente"
        onSubmit={async (data) => {
          const client = await addClient(data);
          router.push(`/clientes/${client.id}`);
        }}
      />
    </div>
  );
}
