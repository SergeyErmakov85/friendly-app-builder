import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Activity, CalendarDays, Flame, Trophy } from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";
import { StatisticsCard } from "@/components/StatisticsCard";
import { HeatMap } from "@/components/HeatMap";
import { DataService } from "@/lib/data/DataService";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "Статистика — Трекер развивающих занятий" },
      {
        name: "description",
        content: "Серии, активные дни, тепловая карта и прогресс по занятиям.",
      },
    ],
  }),
});

function StatsPage() {
  const streaks = useMemo(() => DataService.getStreaks(), []);
  const days = useMemo(() => DataService.getDayStats14(), []);
  const heat = useMemo(() => DataService.getHeatmap6w(), []);
  const heatMax = useMemo(() => DataService.getHeatmapMax(), []);
  const week = useMemo(() => DataService.getWeeklyActive(), []);
  const byGame = useMemo(() => DataService.getGameCompletionRates(30), []);

  const maxDone = Math.max(1, ...days.map((d) => d.count));

  return (
    <div>
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative">
          <h1 className="text-3xl font-extrabold">Статистика</h1>
          <p className="mt-1 text-sm text-muted-foreground">Регулярность, серии и живой прогресс</p>
        </div>
      </header>

      <main className="space-y-6 px-4 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <StatisticsCard
            label="Текущая серия"
            value={
              <>
                {streaks.current}{" "}
                <span className="text-base font-medium text-muted-foreground">дн.</span>
              </>
            }
            hint="день зачтён"
            icon={<Flame className="h-4 w-4" />}
            accent
          />
          <StatisticsCard
            label="Лучшая серия"
            value={
              <>
                {streaks.best}{" "}
                <span className="text-base font-medium text-muted-foreground">дн.</span>
              </>
            }
            icon={<Trophy className="h-4 w-4" />}
          />
          <StatisticsCard
            label="Ядро закрыто"
            value={
              <>
                {week.active}{" "}
                <span className="text-base font-medium text-muted-foreground">из {week.total}</span>
              </>
            }
            hint="неделя"
            icon={<Activity className="h-4 w-4" />}
          />
          <StatisticsCard
            label="Всего активных дней"
            value={streaks.activeDays}
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </div>

        <section className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]">
          <h3 className="mb-3 font-semibold">Последние 14 дней</h3>
          <div className="flex h-32 items-end gap-1.5">
            {days.map((d) => {
              const h = (d.count / maxDone) * 100;
              return (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-primary transition-all"
                      style={{ height: `${Math.max(6, h)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(d.date).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]">
          <h3 className="mb-3 font-semibold">Тепловая карта ядра ★ (6 недель)</h3>
          <HeatMap values={heat} max={heatMax} />
        </section>

        <section className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]">
          <h3 className="mb-4 font-semibold">Что проседает — % за 30 дней</h3>
          <div className="space-y-3">
            {byGame.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <div className="w-1/2 text-sm text-foreground">★ {g.title}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${g.percent}%` }}
                  />
                </div>
                <div className="w-10 text-right text-xs font-medium text-muted-foreground">
                  {g.percent}%
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
