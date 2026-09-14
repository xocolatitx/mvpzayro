"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientForm } from "@/components/clients/client-form";
import { useCrmStore } from "@/stores/crm-store";

const schema = z.object({
  client_id: z.string().min(1, "Selecciona un cliente"),
  event_id: z.string().min(1, "Selecciona un evento"),
  people_count: z.coerce.number().min(1),
  estimated_spend: z.coerce.number().min(0),
  actual_spend: z.coerce.number().min(0),
  is_vip: z.boolean(),
  status: z.enum(["pendiente", "confirmada", "asistio", "no_show", "cancelada"]),
});

type FormData = z.infer<typeof schema>;

function NuevaReservaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("cliente");
  const preselectedEvent = searchParams.get("evento");

  const clients = useCrmStore((s) => s.clients);
  const events = useCrmStore((s) => s.events);
  const addReservation = useCrmStore((s) => s.addReservation);
  const addClient = useCrmStore((s) => s.addClient);
  const [showClientForm, setShowClientForm] = useState(false);

  const preselectedClientName = searchParams.get("clienteNombre") ?? null;
  const preselectedEventName = searchParams.get("eventoNombre") ?? null;
  const preselectedEventClub = searchParams.get("eventoClub") ?? null;

  const displayNameForClient = (clientId: string) => {
    const existing = clients.find((client) => client.id === clientId);
    return existing?.name ?? preselectedClientName ?? "Seleccionar cliente";
  };

  const displayNameForEvent = (eventId: string) => {
    const existing = events.find((event) => event.id === eventId);
    if (existing) {
      return `${existing.club} — ${existing.name}`;
    }
    if (preselectedEventClub && preselectedEventName) {
      return `${preselectedEventClub} — ${preselectedEventName}`;
    }
    return "Seleccionar evento";
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: preselectedClient ?? "",
      event_id: preselectedEvent ?? "",
      people_count: 1,
      estimated_spend: 0,
      actual_spend: 0,
      is_vip: false,
      status: "pendiente",
    },
  });

  useEffect(() => {
    if (preselectedClient && clients.some((client) => client.id === preselectedClient)) {
      setValue("client_id", preselectedClient, { shouldDirty: true });
    }
  }, [preselectedClient, clients, setValue]);

  useEffect(() => {
    if (preselectedEvent && events.some((event) => event.id === preselectedEvent)) {
      setValue("event_id", preselectedEvent, { shouldDirty: true });
    }
  }, [preselectedEvent, events, setValue]);

  const clientId = useWatch({ control, name: "client_id" });
  const eventId = useWatch({ control, name: "event_id" });
  const status = useWatch({ control, name: "status" });
  const isVip = useWatch({ control, name: "is_vip" });

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit((data) => {
          addReservation({
            client_id: data.client_id,
            event_id: data.event_id,
            group_id: null,
            people_count: data.people_count,
            is_vip: data.is_vip,
            status: data.status,
            notes: null,
            estimated_spend: data.estimated_spend,
            actual_spend: data.actual_spend,
          });
          router.push("/reservas");
        })}
        className="space-y-4"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Cliente</Label>
            <button
              type="button"
              className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase text-zinc-300 hover:bg-white hover:text-black"
              onClick={() => setShowClientForm((value) => !value)}
            >
              {showClientForm ? "Cerrar" : "+ Nuevo cliente"}
            </button>
          </div>

          <Select
            value={clientId}
            onValueChange={(v) => setValue("client_id", v ?? "")}
          >
            <SelectTrigger className="border-white/10 bg-zinc-900">
              <span className="max-w-60 truncate">
                {displayNameForClient(clientId ?? "")}
              </span>
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Evento</Label>
          <Select
            value={eventId || ""}
            onValueChange={(v) => setValue("event_id", v ?? "")}
          >
            <SelectTrigger className="border-white/10 bg-zinc-900">
              <span className="max-w-60 truncate">
                {displayNameForEvent(eventId ?? "")}
              </span>
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.club} — {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="people_count">Personas</Label>
          <Input
            id="people_count"
            type="number"
            min={1}
            {...register("people_count")}
            className="border-white/10 bg-zinc-900"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="estimated_spend">Consumo pedido (€)</Label>
            <Input
              id="estimated_spend"
              type="number"
              min={0}
              step="1"
              {...register("estimated_spend")}
              className="border-white/10 bg-zinc-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actual_spend">Consumo final (€)</Label>
            <Input
              id="actual_spend"
              type="number"
              min={0}
              step="1"
              {...register("actual_spend")}
              className="border-white/10 bg-zinc-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/50 p-3">
          <input
            id="is_vip"
            type="checkbox"
            checked={isVip}
            onChange={(e) => setValue("is_vip", e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="is_vip">Reserva VIP</Label>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setValue("status", v as FormData["status"])
            }
          >
            <SelectTrigger className="border-white/10 bg-zinc-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="asistio">Asistió</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white font-bold text-black hover:bg-zinc-200"
          size="lg"
        >
          Crear reserva
        </Button>
      </form>

      {showClientForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
          <ClientForm
            inline
            submitLabel="Crear cliente y usarlo"
            onSubmit={async (data) => {
              const created = await addClient(data);
              setValue("client_id", created.id, { shouldDirty: true });
              setShowClientForm(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function NuevaReservaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">NUEVA RESERVA</h1>
      <Suspense fallback={<p className="text-zinc-500">Cargando...</p>}>
        <NuevaReservaForm />
      </Suspense>
    </div>
  );
}
