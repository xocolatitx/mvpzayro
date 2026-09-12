import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: es });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("+34")) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

export function getGreeting(name = "Juan"): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return `GOOD MORNING, ${name.toUpperCase()}`;
  if (hour >= 14 && hour < 20) return `GOOD AFTERNOON, ${name.toUpperCase()}`;
  return `GOOD NIGHT, ${name.toUpperCase()}`;
}
