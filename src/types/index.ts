export type ClientType =
  | "nuevo"
  | "recurrente"
  | "vip"
  | "core_member"
  | "connector"
  | "top_connector";

export type PreferredDay = "viernes" | "sabado" | "ambos";

export type ReservationStatus =
  | "pendiente"
  | "confirmada"
  | "asistio"
  | "no_show"
  | "cancelada";

export type ScoreAction =
  | "primera_salida"
  | "vuelve"
  | "trae_grupo"
  | "reserva_vip"
  | "repite_vip"
  | "trae_otro_grupo"
  | "alta_frecuencia";

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  type: ClientType;
  university: string | null;
  origin: string;
  preferred_day: PreferredDay;
  usual_club: string | null;
  usual_group_size: number;
  is_vip: boolean;
  zayro_score: number;
  notes: string | null;
  rrpp_id: string | null;
  group_id: string | null;
  outings_count: number;
  vip_count: number;
  reservations_count: number;
  estimated_spend: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  usual_day: PreferredDay;
  avg_size: number;
  usual_club: string | null;
  leader_client_id: string | null;
  last_outing_at: string | null;
  created_at: string;
  members?: Client[];
  leader?: Client | null;
}

export interface Event {
  id: string;
  name: string;
  club: string;
  event_date: string;
  day_of_week: PreferredDay;
  rrpp_id: string | null;
  entries_count: number;
  vip_count: number;
  reservations_count: number;
  revenue_estimate: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  client_id: string;
  group_id: string | null;
  event_id: string | null;
  people_count: number;
  is_vip: boolean;
  status: ReservationStatus;
  notes: string | null;
  estimated_spend: number;
  actual_spend: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  event?: Event;
}

export interface RrppMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  commission_rate: number;
  active: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalClients: number;
  vipClients: number;
  totalGroups: number;
  activeClients: number;
  newClientsThisWeek: number;
  entriesThisWeek: number;
  reservationsThisWeek: number;
  estimatedRevenue: number;
}

export interface CreateClientInput {
  name: string;
  phone?: string;
  type?: ClientType;
  university?: string;
  origin?: string;
  preferred_day?: PreferredDay;
  usual_club?: string;
  usual_group_size?: number;
  is_vip?: boolean;
  notes?: string;
  group_id?: string;
  rrpp_id?: string;
}
