import type { ClientType, PreferredDay, ReservationStatus } from "@/types";

export const CLUBS = ["Bandido", "Mucho", "Sala Moon", "Marina Beach"] as const;

export const UNIVERSITIES = [
  "UV",
  "UPV",
  "UJI",
  "Erasmus",
  "Otra",
] as const;

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  nuevo: "Cliente nuevo",
  recurrente: "Cliente recurrente",
  vip: "VIP",
  core_member: "Core Member",
  connector: "VIP / Connector",
  top_connector: "Top Connector",
};

export const CLIENT_TYPE_COLORS: Record<ClientType, string> = {
  nuevo: "bg-zinc-500/20 text-zinc-300",
  recurrente: "bg-emerald-500/20 text-emerald-400",
  vip: "bg-amber-500/20 text-amber-400",
  core_member: "bg-blue-500/20 text-blue-400",
  connector: "bg-purple-500/20 text-purple-400",
  top_connector: "bg-yellow-500/20 text-yellow-300",
};

export const DAY_LABELS: Record<PreferredDay, string> = {
  viernes: "Viernes",
  sabado: "Sábado",
  ambos: "Viernes / Sábado",
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  asistio: "Asistió",
  no_show: "No Show",
  cancelada: "Cancelada",
};

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400",
  confirmada: "bg-blue-500/20 text-blue-400",
  asistio: "bg-emerald-500/20 text-emerald-400",
  no_show: "bg-red-500/20 text-red-400",
  cancelada: "bg-zinc-500/20 text-zinc-400",
};

export const SCORE_POINTS = {
  primera_salida: 1,
  vuelve: 2,
  trae_grupo: 5,
  reserva_vip: 10,
  repite_vip: 15,
  trae_otro_grupo: 5,
  alta_frecuencia: 5,
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "Home" },
  { href: "/clientes", label: "Clientes", icon: "Users" },
  { href: "/eventos", label: "Eventos", icon: "Calendar" },
  { href: "/reservas", label: "Reservas", icon: "Ticket" },
  { href: "/mas", label: "Más", icon: "Menu" },
] as const;
