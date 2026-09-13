"use client";

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
import { CLUBS, UNIVERSITIES } from "@/lib/constants";
import type { Client, CreateClientInput, ClientType } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  phone: z.string().optional(),
  type: z.enum([
    "nuevo",
    "recurrente",
    "vip",
    "core_member",
    "connector",
    "top_connector",
  ]),
  university: z.string().optional(),
  origin: z.string().min(1, "Origen requerido"),
  preferred_day: z.enum(["viernes", "sabado", "ambos"]),
  usual_club: z.string().optional(),
  usual_group_size: z.coerce.number().min(1).max(50),
  is_vip: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface ClientFormProps {
  defaultValues?: Partial<Client>;
  onSubmit: (data: CreateClientInput) => void | Promise<void>;
  submitLabel?: string;
  inline?: boolean;
}

export function ClientForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
  inline = false,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      type: defaultValues?.type ?? "nuevo",
      university: defaultValues?.university ?? "",
      origin: defaultValues?.origin ?? "España",
      preferred_day: defaultValues?.preferred_day ?? "viernes",
      usual_club: defaultValues?.usual_club ?? "",
      usual_group_size: defaultValues?.usual_group_size ?? 1,
      is_vip: defaultValues?.is_vip ?? false,
    },
  });

  const preferredDay = useWatch({ control, name: "preferred_day" });
  const isVip = useWatch({ control, name: "is_vip" });
  const university = useWatch({ control, name: "university" });
  const usualClub = useWatch({ control, name: "usual_club" });
  const clientType = useWatch({ control, name: "type" });
  const origin = useWatch({ control, name: "origin" });

  const submitClient = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      phone: data.phone || undefined,
      university: data.university || undefined,
      usual_club: data.usual_club || undefined,
    });
  });

  const fields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Pablo García"
          className="border-white/10 bg-zinc-900"
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="+34 612 345 678"
          type="tel"
          className="border-white/10 bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={clientType}
          onValueChange={(v) => setValue("type", v as ClientType)}
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nuevo">Nuevo</SelectItem>
            <SelectItem value="recurrente">Recurrente</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="core_member">Core member</SelectItem>
            <SelectItem value="connector">Connector</SelectItem>
            <SelectItem value="top_connector">Top connector</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Universidad</Label>
        <Select
          value={university || ""}
          onValueChange={(v) => setValue("university", v ?? undefined)}
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {UNIVERSITIES.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Origen</Label>
        <Select
          value={origin || "España"}
          onValueChange={(v) => setValue("origin", v ?? "España")}
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue placeholder="Seleccionar origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="España">España</SelectItem>
            <SelectItem value="Erasmus">Erasmus</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Día habitual</Label>
        <Select
          value={preferredDay}
          onValueChange={(v) =>
            setValue("preferred_day", v as FormData["preferred_day"])
          }
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viernes">Viernes</SelectItem>
            <SelectItem value="sabado">Sábado</SelectItem>
            <SelectItem value="ambos">Viernes / Sábado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Club habitual</Label>
        <Select
          value={usualClub || ""}
          onValueChange={(v) => setValue("usual_club", v ?? undefined)}
        >
          <SelectTrigger className="border-white/10 bg-zinc-900">
            <SelectValue placeholder="Seleccionar club" />
          </SelectTrigger>
          <SelectContent>
            {CLUBS.map((club) => (
              <SelectItem key={club} value={club}>
                {club}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="usual_group_size">Grupo habitual (personas)</Label>
        <Input
          id="usual_group_size"
          type="number"
          min={1}
          max={50}
          {...register("usual_group_size")}
          className="border-white/10 bg-zinc-900"
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/50 p-3">
        <input
          id="is_vip"
          type="checkbox"
          checked={isVip}
          onChange={(e) => setValue("is_vip", e.target.checked)}
          className="h-4 w-4 rounded border-white/20"
        />
        <Label htmlFor="is_vip" className="cursor-pointer">
          Cliente VIP
        </Label>
      </div>

    </>
  );

  if (inline) {
    return (
      <div className="space-y-4">
        {fields}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void submitClient()}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
        >
          {submitLabel}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitClient} className="space-y-4">
      {fields}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white font-bold text-black hover:bg-zinc-200"
        size="lg"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
