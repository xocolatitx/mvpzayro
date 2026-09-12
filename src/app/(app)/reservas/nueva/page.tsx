"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
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
import { useCrmStore } from "@/stores/crm-store";

const schema = z.object({
  client_id: z.string().min(1, "Selecciona un cliente"),
  event_id: z.string().optional(),
  people_count: z.coerce.number().min(1),
  is_vip: z.boolean(),
  status: z.enum(["pendiente", "confirmada", "asistio", "no_show", "cancelada"]),
});

type FormData = z.infer<typeof schema>;

function NuevaReservaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("cliente");

  const clients = useCrmStore((s) => s.clients);
  const events = useCrmStore((s) => s.events);
  const addReservation = useCrmStore((s) => s.addReservation);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: preselectedClient ?? "",
      people_count: 1,
      is_vip: false,
      status: "pendiente",
    },
  });

  const isVip = watch("is_vip");

  return (
    <form
      onSubmit={handleSubmit((data) => {
        addReservation({
          client_id: data.client_id,
          event_id: data.event_id || null,
          group_id: null,
          people_count: data.people_count,
          is_vip: data.is_vip,
          status: data.status,
          notes: null,
        });
        router.push("/reservas");
      })}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Select
          value={watch("client_id")}
          onValueChange={(v) => setValue("client_id", v ?? "")}
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue placeholder="Seleccionar cliente" />
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
        <Label>Evento (opcional)</Label>
        <Select
          value={watch("event_id") || ""}
          onValueChange={(v) => setValue("event_id", v ?? undefined)}
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue placeholder="Sin evento" />
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
          value={watch("status")}
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
