"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClientSearch({ value, onChange }: ClientSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar cliente..."
        className="border-white/10 bg-zinc-900 pl-10"
      />
    </div>
  );
}
