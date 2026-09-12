"use client";

import { useRouter } from "next/navigation";
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
import { CLUBS } from "@/lib/constants";
import { useCrmStore } from "@/stores/crm-store";

const schema = z.object({
  name: z.string().min(2),
  club: z.string().min(2),
  event_date: z.string().min(1),
  day_of_week: z.enum(["viernes", "sabado", "ambos"]),
});

type FormData = z.infer<typeof schema>;

export default function NuevoEventoPage() {
  const router = useRouter();
  const addEvent = useCrmStore((s) => s.addEvent);
  const rrpp = useCrmStore((s) => s.rrppMembers[0]);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        event_date: new Date().toISOString().split("T")[0],
        day_of_week: "viernes",
      },
    });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">NUEVO EVENTO</h1>

      <form
        onSubmit={handleSubmit((data) => {
          addEvent({
            ...data,
            rrpp_id: rrpp?.id ?? null,
            entries_count: 0,
            vip_count: 0,
            reservations_count: 0,
            revenue_estimate: 0,
          });
          router.push("/eventos");
        })}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del evento</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="BANDIDO"
            className="border-white/10 bg-zinc-900"
          />
        </div>

        <div className="space-y-2">
          <Label>Club</Label>
          <Select
            value={watch("club") || ""}
            onValueChange={(v) => setValue("club", v ?? "")}
          >
            <SelectTrigger className="border-white/10 bg-zinc-900">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {CLUBS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_date">Fecha</Label>
          <Input
            id="event_date"
            type="date"
            {...register("event_date")}
            className="border-white/10 bg-zinc-900"
          />
        </div>

        <div className="space-y-2">
          <Label>Día</Label>
          <Select
            value={watch("day_of_week")}
            onValueChange={(v) =>
              setValue("day_of_week", v as FormData["day_of_week"])
            }
          >
            <SelectTrigger className="border-white/10 bg-zinc-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viernes">Viernes</SelectItem>
              <SelectItem value="sabado">Sábado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white font-bold text-black hover:bg-zinc-200"
          size="lg"
        >
          Crear evento
        </Button>
      </form>
    </div>
  );
}
