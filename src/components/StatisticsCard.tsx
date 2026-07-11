import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}

export function StatisticsCard({ label, value, hint, icon, accent }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]",
        accent && "bg-gradient-primary text-white shadow-glow ring-0",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={cn(
              "text-xs font-medium",
              accent ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              "mt-1 text-2xl font-extrabold",
              accent ? "text-white" : "text-foreground",
            )}
          >
            {value}
          </div>
          {hint && (
            <div
              className={cn("mt-0.5 text-xs", accent ? "text-white/80" : "text-muted-foreground")}
            >
              {hint}
            </div>
          )}
        </div>
        {icon && (
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl",
              accent ? "bg-white/20 text-white" : "bg-surface-2 text-[oklch(0.45_0.25_285)]",
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
