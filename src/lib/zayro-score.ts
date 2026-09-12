import { SCORE_POINTS } from "@/lib/constants";
import type { ClientType, ScoreAction } from "@/types";

export function getScorePoints(action: ScoreAction): number {
  return SCORE_POINTS[action];
}

export function getClientTier(score: number): ClientType {
  if (score >= 80) return "top_connector";
  if (score >= 50) return "connector";
  if (score >= 30) return "core_member";
  if (score >= 15) return "vip";
  if (score >= 3) return "recurrente";
  return "nuevo";
}

export function getTierLabel(type: ClientType): string {
  const labels: Record<ClientType, string> = {
    nuevo: "Nuevo",
    recurrente: "Recurrente",
    vip: "VIP",
    core_member: "Core Member",
    connector: "Connector",
    top_connector: "Top Connector",
  };
  return labels[type];
}

export function calculateScoreFromStats(stats: {
  outings: number;
  vipReservations: number;
  groupBrings: number;
  repeatVip: number;
}): number {
  let score = 0;
  if (stats.outings >= 1) score += SCORE_POINTS.primera_salida;
  if (stats.outings >= 2) score += SCORE_POINTS.vuelve * (stats.outings - 1);
  score += stats.groupBrings * SCORE_POINTS.trae_grupo;
  score += stats.vipReservations * SCORE_POINTS.reserva_vip;
  score += stats.repeatVip * SCORE_POINTS.repite_vip;
  if (stats.outings >= 5) score += SCORE_POINTS.alta_frecuencia;
  return score;
}
