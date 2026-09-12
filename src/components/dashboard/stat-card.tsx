import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number | string;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-4",
        className
      )}
    >
      <span className="text-2xl font-black tabular-nums text-white">{value}</span>
      <span className="mt-1 text-[10px] font-semibold tracking-widest text-zinc-400">
        {label}
      </span>
    </div>
  );
}
