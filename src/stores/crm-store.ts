"use client";

import { create } from "zustand";
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

type PendingSyncType =
  | "client-create"
  | "client-update"
  | "client-delete"
  | "event-create"
  | "reservation-create"
  | "reservation-status";

type PendingSyncEntry = {
  type: PendingSyncType;
  payload: Record<string, unknown>;
  createdAt: string;
};

interface CrmStore {
  clients: Client[];
  groups: Group[];
  events: Event[];
  reservations: Reservation[];
  rrppMembers: RrppMember[];
  pendingSync: PendingSyncEntry[];
  hydrateFromSupabase: () => Promise<void>;
  addClient: (input: CreateClientInput) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addEvent: (event: Omit<Event, "id" | "created_at">) => Promise<Event>;
  addReservation: (
    data: Omit<Reservation, "id" | "created_at" | "updated_at">
  ) => Promise<Reservation> | Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void> | void;
  retryPendingSync: () => Promise<void>;
  registerOuting: (clientId: string, isVip?: boolean) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

const statusToRemote = {
  pendiente: "pending",
  confirmada: "confirmed",
  asistio: "attended",
  no_show: "no_show",
  cancelada: "cancelled",
} as const;

const statusToUi = {
  pending: "pendiente" as const,
  confirmed: "confirmada" as const,
  attended: "asistio" as const,
  no_show: "no_show" as const,
  cancelled: "cancelada" as const,
} as const;

const eventTypeToClub = { club: "club" } as const;

export const useCrmStore = create<CrmStore>()((set, get) => ({
  clients: [],
  groups: [],
  events: [],
  reservations: [],
  rrppMembers: [],
  pendingSync: [],

  retryPendingSync: async () => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const queue = [...get().pendingSync];
    if (!queue.length) return;

    const nextQueue: PendingSyncEntry[] = [];

    for (const item of queue) {
      const type = item.type;
      if (type === "client-create" && item.payload.name) {
        const { error } = await supabase
          .from("clients")
          .insert(item.payload);
        if (!error) continue;
      }

      if (type === "client-update" && typeof item.payload.id === "string") {
        const { error } = await supabase
          .from("clients")
          .update(item.payload)
          .eq("id", String(item.payload.id));
        if (!error) continue;
      }

      if (type === "client-delete" && typeof item.payload.id === "string") {
        const { error } = await supabase
          .from("clients")
          .delete()
          .eq("id", String(item.payload.id));
        if (!error) continue;
      }

      if (type === "event-create" && item.payload.name) {
        const { error } = await supabase
          .from("events")
          .insert(item.payload);
        if (!error) continue;
      }

      if (type === "reservation-create" && item.payload.client_id) {
        const { error } = await supabase
          .from("reservations")
          .insert(item.payload);
        if (!error) continue;
      }

      if (type === "reservation-status" && typeof item.payload.id === "string") {
        const { error } = await supabase
          .from("reservations")
          .update({
            status: item.payload.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", String(item.payload.id));
        if (!error) continue;
      }

      nextQueue.push(item);
    }

    if (nextQueue.length !== queue.length) {
      await get().hydrateFromSupabase();
    }

    set({ pendingSync: nextQueue });
  },

  hydrateFromSupabase: async () => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const { data: universityRows } = await supabase.from("universities").select("id,name");
    const universityNameById = new Map(
      (universityRows ?? []).map((u: Record<string, unknown>) => [String(u.id), String(u.name)])
    );

    const { data: venueRows } = await supabase.from("venues").select("id,name");
    const venueNameById = new Map(
      (venueRows ?? []).map((v: Record<string, unknown>) => [String(v.id), String(v.name)])
    );

    const { data: rrppProfileRows } = await supabase
      .from("rrpp_profiles")
      .select("id, profile_id");
    const rrppIdByProfileId = new Map(
      (rrppProfileRows ?? []).map((r: Record<string, unknown>) => [String(r.profile_id), String(r.id)])
    );

    const { data: groupMemberRows } = await supabase
      .from("group_members")
      .select("group_id, client_id, role");

    const groupIdByClientId = new Map<string, string>();
    for (const row of groupMemberRows ?? []) {
      const r = row as Record<string, unknown>;
      const clientId = String(r.client_id);
      const groupId = String(r.group_id);
      if (!groupIdByClientId.has(clientId)) {
        groupIdByClientId.set(clientId, groupId);
      }
    }

    const { data: reservationRowsForRoster } = await supabase
      .from("reservations")
      .select("client_id, rrpp_id");

    const rrppIdByClientId = new Map<string, string>();
    for (const row of reservationRowsForRoster ?? []) {
      const r = row as Record<string, unknown>;
      const clientId = String(r.client_id);
      const rrppId = typeof r.rrpp_id === "string" ? String(r.rrpp_id) : null;
      if (rrppId && !rrppIdByClientId.has(clientId)) {
        rrppIdByClientId.set(clientId, rrppId);
      }
    }

    const { data: clientRows, error: clientError } = await supabase
      .from("clients")
      .select("*");
    if (clientError || !clientRows) return;

    const hydratedClients = clientRows.map((row: Record<string, unknown>): Client => {
      const firstName = String(row.first_name ?? "");
      const lastName = String(row.last_name ?? "");
      const name = `${firstName} ${lastName}`.trim() || "Cliente";

      const universityId = typeof row.university_id === "string" ? row.university_id : null;
      const preferredClubId = typeof row.preferred_club === "string" ? row.preferred_club : null;

      return {
        id: String(row.id),
        name,
        phone: typeof row.phone === "string" ? row.phone : null,
        type: (row.type as Client["type"]) ?? "nuevo",
        university: universityId ? universityNameById.get(universityId) ?? null : null,
        origin: typeof row.origin === "string" ? row.origin : "España",
        preferred_day: (row.preferred_day as Client["preferred_day"]) ?? "viernes",
        usual_club: preferredClubId ? venueNameById.get(preferredClubId) ?? null : null,
        usual_group_size: Number(row.usual_group_size ?? 1),
        is_vip: Boolean(row.vip ?? row.is_vip),
        zayro_score: Number(row.zayro_score ?? 0),
        notes: typeof row.notes === "string" ? row.notes : null,
        rrpp_id: rrppIdByClientId.get(String(row.id)) ?? null,
        group_id: groupIdByClientId.get(String(row.id)) ?? null,
        outings_count: Number(row.outings_count ?? 0),
        vip_count: Number(row.vip_count ?? 0),
        reservations_count: Number(row.reservations_count ?? 0),
        estimated_spend: Number(row.estimated_spend ?? 0),
        last_activity_at:
          typeof row.last_activity_at === "string"
            ? row.last_activity_at
            : new Date().toISOString(),
        created_at:
          typeof row.created_at === "string"
            ? row.created_at
            : new Date().toISOString(),
        updated_at:
          typeof row.updated_at === "string"
            ? row.updated_at
            : new Date().toISOString(),
      };
    });

    const { data: groupRows, error: groupError } = await supabase
      .from("groups")
      .select("*");

    const membersByGroupId = new Map<string, string[]>();
    const leadersByGroupId = new Map<string, string>();

    for (const memberRow of groupMemberRows ?? []) {
      const groupId = String((memberRow as Record<string, unknown>).group_id);
      const clientId = String((memberRow as Record<string, unknown>).client_id);
      const role = String((memberRow as Record<string, unknown>).role ?? "member");
      const existing = membersByGroupId.get(groupId) ?? [];
      membersByGroupId.set(groupId, [...existing, clientId]);
      if (role === "leader") {
        leadersByGroupId.set(groupId, clientId);
      }
    }

    const hydratedGroups = !groupError && groupRows
      ? groupRows.map((row: Record<string, unknown>): Group => {
          const groupId = String(row.id);
          const groupMemberIds = membersByGroupId.get(groupId) ?? [];
          const groupLeaderId = leadersByGroupId.get(groupId) ?? (typeof row.leader_client_id === "string" ? row.leader_client_id : null);

          return {
            id: groupId,
            name: String(row.name ?? "Grupo"),
            usual_day: (row.usual_day as Group["usual_day"]) ?? "viernes",
            avg_size: Number(row.usual_size ?? 1),
            usual_club: null,
            leader_client_id: groupLeaderId,
            last_outing_at: null,
            created_at:
              typeof row.created_at === "string"
                ? row.created_at
                : new Date().toISOString(),
            members: hydratedClients.filter((c) => groupMemberIds.includes(c.id)),
            leader: hydratedClients.find((c) => c.id === groupLeaderId) ?? null,
          };
        })
      : [];

    const { data: eventRows, error: eventError } = await supabase
      .from("events")
      .select("*");

    const { data: rrppRows, error: rrppError } = await supabase
      .from("rrpp_profiles")
      .select("*");

    const hydratedRrpp = !rrppError && rrppRows
      ? rrppRows.map((row: Record<string, unknown>): RrppMember => ({
          id: String(row.id),
          name: String(row.display_name ?? "RRPP"),
          phone: typeof row.phone === "string" ? row.phone : null,
          email: typeof row.email === "string" ? row.email : null,
          commission_rate: Number(row.commission_value ?? 0),
          active: Boolean(row.active),
          created_at:
            typeof row.created_at === "string"
              ? row.created_at
              : new Date().toISOString(),
        }))
      : [];

    const { data: reservationRows, error: reservationError } = await supabase
      .from("reservations")
      .select("*");

    const hydratedReservations = !reservationError && reservationRows
      ? reservationRows.map((row: Record<string, unknown>): Reservation => ({
          id: String(row.id),
          client_id: String(row.client_id),
          group_id: typeof row.group_id === "string" ? row.group_id : null,
          event_id: typeof row.event_id === "string" ? row.event_id : null,
          people_count: Number(row.people_count ?? 1),
          is_vip: String(row.reservation_type ?? "entry") === "vip",
          status: statusToUi[String(row.status) as keyof typeof statusToUi] ?? "pendiente",
          notes: typeof row.notes === "string" ? row.notes : null,
          estimated_spend: Number(row.estimated_spend ?? 0),
          actual_spend: Number(row.actual_spend ?? 0),
          created_at:
            typeof row.created_at === "string"
              ? row.created_at
              : new Date().toISOString(),
          updated_at:
            typeof row.updated_at === "string"
              ? row.updated_at
              : new Date().toISOString(),
        }))
      : [];

    const hydratedEvents = !eventError && eventRows
      ? eventRows.map((row: Record<string, unknown>): Event => {
          const rowEventId = String(row.id);
          const eventReservations = hydratedReservations.filter((r) => r.event_id === rowEventId);
          const vipReservations = eventReservations.filter((r) => r.is_vip);
          const billing = eventReservations.reduce((sum, r) => {
            return sum + (r.people_count * 35 + (r.is_vip ? 80 : 0));
          }, 0);

          return {
            id: String(row.id),
            name: String(row.name ?? "Evento"),
            club: venueNameById.get(String(row.venue_id)) ?? "Club",
            event_date: typeof row.event_date === "string" ? row.event_date : new Date().toISOString().split("T")[0],
            day_of_week: (row.day_of_week as Event["day_of_week"]) ?? "viernes",
            rrpp_id:
              typeof row.created_by === "string"
                ? rrppIdByProfileId.get(String(row.created_by)) ?? null
                : null,
            entries_count: eventReservations.length,
            vip_count: vipReservations.length,
            reservations_count: eventReservations.length,
            revenue_estimate: billing,
            created_at:
              typeof row.created_at === "string"
                ? row.created_at
                : new Date().toISOString(),
          };
        })
      : [];

    set(() => ({
      clients: hydratedClients,
      events: hydratedEvents,
      groups: hydratedGroups,
      reservations: hydratedReservations,
      rrppMembers: hydratedRrpp,
    }));
  },

  addClient: async (input) => {
    const now = new Date().toISOString();
    const clientId = generateId();
    const client: Client = {
      id: clientId,
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
      rrpp_id: input.rrpp_id ?? null,
      group_id: input.group_id ?? null,
      outings_count: 0,
      vip_count: 0,
      reservations_count: 0,
      estimated_spend: 0,
      last_activity_at: now,
      created_at: now,
      updated_at: now,
    };

    const supabase = createSupabaseClient();
    if (supabase) {
      const fullName = input.name.trim();
      const nameParts = fullName.split(/\s+/);
      const first_name = nameParts.shift() ?? fullName;
      const last_name = nameParts.join(" ");

      const universityQuery = input.university ?? "";
      const { data: universityByName } = await supabase
        .from("universities")
        .select("id")
        .or(`name.eq.${universityQuery},short_name.eq.${universityQuery}`)
        .maybeSingle();

      const { data: venueByName } = await supabase
        .from("venues")
        .select("id")
        .eq("name", input.usual_club ?? "")
        .maybeSingle();

      const payload = {
        id: client.id,
        first_name,
        last_name: last_name || null,
        phone: client.phone,
        email: null,
        university_id: universityByName?.id ?? null,
        origin: client.origin,
        preferred_club: venueByName?.id ?? null,
        preferred_day: client.preferred_day,
        frequency: "new",
        usual_group_size: client.usual_group_size,
        vip: client.is_vip,
        notes: client.notes,
        status: "active",
        marketing_consent: false,
        created_by: null,
        last_activity_at: client.last_activity_at,
        created_at: client.created_at,
        updated_at: client.updated_at,
      };

      const { error } = await supabase.from("clients").insert(payload);
      if (!error) {
        await useCrmStore.getState().hydrateFromSupabase();
        return client;
      }

      set((s) => ({
        pendingSync: [
          ...s.pendingSync,
          {
            type: "client-create",
            payload: input as unknown as Record<string, unknown>,
            createdAt: now,
          },
        ],
      }));
    }

    set((s) => ({ clients: [client, ...s.clients] }));
    return client;
  },

  updateClient: async (id, data) => {
    const now = new Date().toISOString();
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) {
      const fullName = String(data.name).trim();
      const parts = fullName.split(/\s+/);
      payload.first_name = parts.shift() ?? fullName;
      payload.last_name = parts.length ? parts.join(" ") : null;
    }
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.origin !== undefined) payload.origin = data.origin;
    if (data.preferred_day !== undefined) payload.preferred_day = data.preferred_day;
    if (data.usual_group_size !== undefined) payload.usual_group_size = data.usual_group_size;
    if (data.is_vip !== undefined) payload.vip = data.is_vip;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.zayro_score !== undefined) payload.zayro_score = data.zayro_score;
    if (data.estimated_spend !== undefined) payload.estimated_spend = data.estimated_spend;
    if (data.last_activity_at !== undefined) payload.last_activity_at = data.last_activity_at;

    if (data.university !== undefined) {
      const universityQuery = data.university ?? "";
      const { data: universityRow } = await supabase
        .from("universities")
        .select("id")
        .or(`name.eq.${universityQuery},short_name.eq.${universityQuery}`)
        .maybeSingle();
      payload.university_id = universityRow?.id ?? null;
    }

    if (data.usual_club !== undefined) {
      const { data: venueRow } = await supabase
        .from("venues")
        .select("id")
        .eq("name", data.usual_club ?? "")
        .maybeSingle();
      payload.preferred_club = venueRow?.id ?? null;
    }

    payload.updated_at = now;

    const { error } = await supabase.from("clients").update(payload).eq("id", id);
    if (!error) {
      await useCrmStore.getState().hydrateFromSupabase();
      return;
    }

    set((s) => ({
      pendingSync: [
        ...s.pendingSync,
        {
          type: "client-update",
          payload: { id, ...data } as Record<string, unknown>,
          createdAt: now,
        },
      ],
    }));
  },

  deleteClient: async (id) => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) {
      await useCrmStore.getState().hydrateFromSupabase();
      return;
    }

    set((s) => ({
      pendingSync: [
        ...s.pendingSync,
        {
          type: "client-delete",
          payload: { id } as Record<string, unknown>,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  },

  addEvent: async (event) => {
    const now = new Date().toISOString();
    const newEvent: Event = {
      ...event,
      id: generateId(),
      created_at: now,
    };

    const supabase = createSupabaseClient();
    if (!supabase) {
      set((s) => ({ events: [newEvent, ...s.events] }));
      return newEvent;
    }

    let venueId: string | null = null;

    const venueLookup = await supabase
      .from("venues")
      .select("id")
      .eq("name", event.club)
      .maybeSingle();

    if (venueLookup.data?.id) {
      venueId = String(venueLookup.data.id);
    } else {
      const fallbackVenue = {
        name: event.club,
        city: "Valencia",
        instagram: `@${event.club.toLowerCase().replace(/\s+/g, "")}`,
        active: true,
        notes: "Created from CRM event form",
      };

      const fallbackInsert = await supabase
        .from("venues")
        .insert(fallbackVenue)
        .select("id")
        .maybeSingle();

      if (!fallbackInsert.error && fallbackInsert.data?.id) {
        venueId = String(fallbackInsert.data.id);
      }
    }

    const rrppLookup = await supabase
      .from("rrpp_profiles")
      .select("profile_id")
      .eq("id", event.rrpp_id ?? "")
      .maybeSingle();

    const payload = {
      id: newEvent.id,
      name: event.name,
      venue_id: venueId,
      event_date: event.event_date,
      day_of_week: event.day_of_week,
      event_type: "club",
      status: "draft",
      notes: null,
      created_by: rrppLookup.data?.profile_id ?? null,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("events").insert(payload);
    if (!error) {
      await useCrmStore.getState().hydrateFromSupabase();
      return newEvent;
    }

    console.warn("No se pudo sincronizar el evento remoto", error.message);
    set((s) => ({
      events: [newEvent, ...s.events],
      pendingSync: [
        ...s.pendingSync,
        {
          type: "event-create",
          payload: {
            id: newEvent.id,
            name: event.name,
            club: event.club,
            event_date: event.event_date,
            day_of_week: event.day_of_week,
            rrpp_id: event.rrpp_id,
            entries_count: event.entries_count,
            vip_count: event.vip_count,
            reservations_count: event.reservations_count,
            revenue_estimate: event.revenue_estimate,
            created_at: now,
          } as Record<string, unknown>,
          createdAt: now,
        },
      ],
    }));
    return newEvent;
  },

  addReservation: (data) => {
    const now = new Date().toISOString();
    const reservationId = generateId();
    const reservation: Reservation = {
      ...data,
      id: reservationId,
      estimated_spend: data.estimated_spend ?? 0,
      actual_spend: data.actual_spend ?? 0,
      created_at: now,
      updated_at: now,
    };

    const supabase = createSupabaseClient();
    if (supabase) {
      void (async () => {
        const { data: eventRow } = await supabase
          .from("events")
          .select("created_by")
          .eq("id", data.event_id)
          .maybeSingle();

        const { data: rrppRow } = await supabase
          .from("rrpp_profiles")
          .select("id")
          .eq("profile_id", eventRow?.created_by ?? "")
          .maybeSingle();

        const payload = {
          id: reservation.id,
          client_id: data.client_id,
          event_id: data.event_id,
          rrpp_id: rrppRow?.id ?? null,
          group_id: data.group_id ?? null,
          people_count: data.people_count,
          reservation_type: data.is_vip ? "vip" : "entry",
          status: statusToRemote[data.status],
          table_number: null,
          estimated_spend: data.estimated_spend ?? 0,
          actual_spend: data.actual_spend ?? 0,
          notes: data.notes,
          created_at: now,
          updated_at: now,
        };

        const { error } = await supabase.from("reservations").insert(payload);
        if (!error) {
          await useCrmStore.getState().hydrateFromSupabase();
          return;
        }

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
          pendingSync: [
            ...s.pendingSync,
            {
              type: "reservation-create",
              payload: {
                ...payload,
                reservation_type: data.is_vip ? "vip" : "entry",
                estimated_spend: data.estimated_spend ?? 0,
                actual_spend: data.actual_spend ?? 0,
              } as Record<string, unknown>,
              createdAt: now,
            },
          ],
        }));
      })();
      return reservation;
    }

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

  updateReservationStatus: async (id, status) => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("reservations")
      .update({ status: statusToRemote[status], updated_at: now })
      .eq("id", id);

    if (!error) {
      await useCrmStore.getState().hydrateFromSupabase();
      return;
    }

    set((s) => ({
      pendingSync: [
        ...s.pendingSync,
        {
          type: "reservation-status",
          payload: { id, status: statusToRemote[status] } as Record<string, unknown>,
          createdAt: now,
        },
      ],
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
