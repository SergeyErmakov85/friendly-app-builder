import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Сегодня", icon: Home },
  { to: "/stats", label: "Статистика", icon: BarChart3 },
  { to: "/more", label: "Ещё", icon: Settings },
] as const;

export function NavigationBar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <div className="mx-auto max-w-md px-4">
        <div className="flex items-center justify-around rounded-3xl border border-white/60 bg-white/80 p-2 shadow-soft backdrop-blur-xl">
          {tabs.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-all",
                  active ? "text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-primary shadow-glow" />
                )}
                <Icon className={cn("h-5 w-5", active && "drop-shadow")} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
