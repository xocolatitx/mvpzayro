"use client";

import { create } from "zustand";
import {
  DEMO_CLIENTS,
  DEMO_EVENTS,
  DEMO_GROUPS,
  DEMO_RESERVATIONS,
  DEMO_RRPP,
} from "@/lib/data/demo-data";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { getClientTier } from "@/lib/zayro-score";
import type {
  Client,
  CreateClientInput,
  Event,
  Group,
  Reservation,
  ReservationStatus,
  RrppMember,
} from "@/types";

interface CrmStore {
  clients: Client[];
  groups: Group[];
  events: Event[];
  reservations: Reservation[];
  rrppMembers: RrppMember[];
  pendingSync: CreateClientInput[];
  hydrateFromSupabase: () => Promise<void>;
  addClient: (input: CreateClientInput) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addEvent: (event: Omit<Event, "id" | "created_at">) => Event;
  addReservation: (
    data: Omit<Reservation, "id" | "created_at" | "updated_at">
  ) => Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  registerOuting: (clientId: string, isVip?: boolean) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useCrmStore = create<CrmStore>()((set) => ({
  clients: DEMO_CLIENTS,
  groups: DEMO_GROUPS,
  events: DEMO_EVENTS,
  reservations: DEMO_RESERVATIONS,
  rrppMembers: DEMO_RRPP,
  pendingSync: [],

  hydrateFromSupabase: async () => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const { data, error } = await supabase.from("clients").select("*");
    if (error || !data) return;

    const hydrated = data.map((row: any): Client => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      phone: row.phone ?? null,
      type: row.type ?? "nuevo",
      university: row.university ?? null,
      origin: row.origin ?? "España",
      preferred_day: row.preferred_day ?? "viernes",
      usual_club: row.usual_club ?? null,
      usual_group_size: Number(row.usual_group_size ?? 1),
      is_vip: Boolean(row.is_vip),
      zayro_score: Number(row.zayro_score ?? 0),
      notes: row.notes ?? null,
      rrpp_id: row.rrpp_id ?? null,
      group_id: row.group_id ?? null,
      outings_count: Number(row.outings_count ?? 0),
      vip_count: Number(row.vip_count ?? 0),
      reservations_count: Number(row.reservations_count ?? 0),
      estimated_spend: Number(row.estimated_spend ?? 0),
      last_activity_at: row.last_activity_at ?? new Date().toISOString(),
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
    }));

    set(() => ({ clients: hydrated }));
  },

  addClient: async (input) => {
    const now = new Date().toISOString();
    const client: Client = {
      id: generateId(),
      name: input.name,
      phone: input.phone ?? null,
      type: input.type ?? "nuevo",
      university: input.university ?? null,
      origin: input.origin ?? "España",
      preferred_day: input.preferred_day ?? "viernes",
      usual_club: input.usual_club ?? null,
      usual_group_size: input.usual_group_size ?? 1,
      is_vip: input.is_vip ?? false,
      zayro_score: 0,
      notes: input.notes ?? null,
      rrpp_id: input.rrpp_id ?? DEMO_RRPP[0]?.id ?? null,
      group_id: input.group_id ?? null,
      outings_count: 0,
      vip_count: 0,
      reservations_count: 0,
      estimated_spend: 0,
      last_activity_at: now,
      created_at: now,
      updated_at: now,
    };
    set((s) => ({ clients: [client, ...s.clients] }));

    const supabase = createSupabaseClient();
    if (supabase) {
      const payload = {
        id: client.id,
        name: client.name,
        phone: client.phone,
        type: client.type,
        university: client.university,
        origin: client.origin,
        preferred_day: client.preferred_day,
        usual_club: client.usual_club,
        usual_group_size: client.usual_group_size,
        is_vip: client.is_vip,
        zayro_score: client.zayro_score,
        notes: client.notes,
        rrpp_id: client.rrpp_id,
        group_id: client.group_id,
        outings_count: client.outings_count,
        vip_count: client.vip_count,
        reservations_count: client.reservations_count,
        estimated_spend: client.estimated_spend,
        last_activity_at: client.last_activity_at,
        created_at: client.created_at,
        updated_at: client.updated_at,
      };

      const { error } = await supabase.from("clients").insert(payload);
      if (error) {
        set((s) => ({ pendingSync: [...s.pendingSync, input] }));
      }
    }

    return client;
  },

  updateClient: (id, data) => {
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === id
          ? { ...c, ...data, updated_at: new Date().toISOString() }
          : c
      ),
    }));
  },

  deleteClient: (id) => {
    set((s) => ({
      clients: s.clients.filter((c) => c.id !== id),
    }));
  },

  addEvent: (event) => {
    const newEvent: Event = {
      ...event,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    set((s) => ({ events: [newEvent, ...s.events] }));
    return newEvent;
  },

  addReservation: (data) => {
    const now = new Date().toISOString();
    const reservation: Reservation = {
      ...data,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    set((s) => ({
      reservations: [reservation, ...s.reservations],
      clients: s.clients.map((c) =>
        c.id === data.client_id
          ? {
              ...c,
              reservations_count: c.reservations_count + 1,
              last_activity_at: now,
            }
          : c
      ),
    }));
    return reservation;
  },

  updateReservationStatus: (id, status) => {
    set((s) => ({
      reservations: s.reservations.map((r) =>
        r.id === id
          ? { ...r, status, updated_at: new Date().toISOString() }
          : r
      ),
    }));
  },

  registerOuting: (clientId, isVip = false) => {
    const now = new Date().toISOString();
    set((s) => ({
      clients: s.clients.map((c) => {
        if (c.id !== clientId) return c;
        const outings = c.outings_count + 1;
        const vip = c.vip_count + (isVip ? 1 : 0);
        const scoreBoost = isVip ? 10 : outings === 1 ? 1 : 2;
        const newScore = c.zayro_score + scoreBoost;
        return {
          ...c,
          outings_count: outings,
          vip_count: vip,
          zayro_score: newScore,
          type: getClientTier(newScore),
          is_vip: c.is_vip || isVip,
          estimated_spend: c.estimated_spend + (isVip ? 80 : 35),
          last_activity_at: now,
          updated_at: now,
        };
      }),
    }));
  },
}));

export function useDashboardStats() {
  const clients = useCrmStore((s) => s.clients);
  const groups = useCrmStore((s) => s.groups);
  const events = useCrmStore((s) => s.events);
  const reservations = useCrmStore((s) => s.reservations);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoMs = weekAgo.getTime();

  const activeClients = clients.filter(
    (c) => new Date(c.last_activity_at).getTime() > weekAgoMs
  ).length;
  const newThisWeek = clients.filter(
    (c) => new Date(c.created_at).getTime() > weekAgoMs
  ).length;

  const tonightEvent = events.find(
    (e) => e.event_date === today.toISOString().split("T")[0]
  );

  return {
    totalClients: clients.length,
    vipClients: clients.filter((c) => c.is_vip).length,
    totalGroups: groups.length,
    activeClients,
    newClientsThisWeek: newThisWeek,
    entriesThisWeek: events.reduce((a, e) => a + e.entries_count, 0),
    reservationsThisWeek: reservations.length,
    estimatedRevenue: events.reduce((a, e) => a + e.revenue_estimate, 0),
    tonightEvent,
    topClients: [...clients]
      .sort((a, b) => b.zayro_score - a.zayro_score)
      .slice(0, 5),
    topConnectors: [...clients]
      .filter((c) => c.usual_group_size >= 5)
      .sort((a, b) => b.usual_group_size - a.usual_group_size)
      .slice(0, 3),
  };
}
