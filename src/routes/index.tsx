import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Gamepad2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GradientBlobs } from "@/components/GradientBlobs";
import { ProgressCircle } from "@/components/ProgressCircle";
import { CategoryBlock } from "@/components/CategoryBlock";
import { DataService } from "@/lib/data/DataService";
import type { Game } from "@/lib/data/types";

export const Route = createFileRoute("/")({
  component: TodayPage,
  head: () => ({
    meta: [
      { title: "Сегодня — Трекер развивающих занятий" },
      {
        name: "description",
        content: "Игры и занятия на сегодня: прогресс дня, ядро занятий и рекомендации.",
      },
    ],
  }),
});

function formatToday() {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());
}

function TodayPage() {
  const categories = useMemo(() => DataService.getCategories(), []);
  const [games, setGames] = useState<Game[]>(() => DataService.getGames());
  const [highlightId, setHighlightId] = useState<string | undefined>();

  const onToggle = (id: string) => {
    setGames(DataService.toggleGame(id));
  };

  const onSetCount = (id: string, count: number) => {
    setGames(DataService.setGameCount(id, count));
  };

  const done = games.filter((g) => g.status === "done").length;
  const total = games.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const handleSuggest = () => {
    const next = [...games]
      .filter((g) => g.status === "todo")
      .sort((a, b) => a.priority - b.priority)[0];
    if (!next) return;
    setHighlightId(next.id);
    setTimeout(() => {
      const el = document.getElementById(`game-${next.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    setTimeout(() => setHighlightId(undefined), 2400);
  };

  return (
    <div>
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">Сегодня</h1>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{formatToday()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/kinesiotherapy"
                className="flex flex-col items-center gap-1 rounded-2xl bg-surface px-3 py-2 text-xs font-semibold text-foreground shadow-card ring-1 ring-black/[0.04] transition-transform active:scale-[0.96]"
              >
                <Activity className="h-5 w-5 text-[oklch(0.62_0.22_264)]" />
                Кинезио
              </Link>
              <Link
                to="/development-games"
                className="flex flex-col items-center gap-1 rounded-2xl bg-surface px-3 py-2 text-xs font-semibold text-foreground shadow-card ring-1 ring-black/[0.04] transition-transform active:scale-[0.96]"
              >
                <Gamepad2 className="h-5 w-5 text-[oklch(0.62_0.22_264)]" />
                Игры
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex items-center gap-4 rounded-3xl bg-white/70 p-4 shadow-card ring-1 ring-white backdrop-blur-md"
          >
            <ProgressCircle percent={percent} size={104} stroke={10} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground">Выполнено занятий</div>
              <div className="text-2xl font-extrabold">
                {done} <span className="text-muted-foreground">из</span> {total}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {percent === 100
                  ? "Ура, всё сделано! 🎉"
                  : percent === 0
                    ? "Начни с одного пункта 🙂"
                    : "Отличный ритм, продолжай!"}
              </div>
            </div>
          </motion.div>

          <button
            onClick={handleSuggest}
            className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-4 text-base font-semibold text-white shadow-glow transition-transform active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            Предложить следующее занятие
          </button>
        </div>
      </header>

      <main id="game-list" className="space-y-8 px-4 pt-6">
        {categories.map((c) => {
          const list = games
            .filter((g) => g.categoryId === c.id)
            .sort((a, b) => a.priority - b.priority);
          return (
            <div key={c.id}>
              <div id={list[0] ? `game-${list[0].id}` : undefined} />
              {list.map((g) => (
                <div key={g.id} id={`game-${g.id}`} className="scroll-mt-24" />
              ))}
              <CategoryBlock
                category={c}
                games={list}
                highlightId={highlightId}
                onToggle={onToggle}
                onSetCount={onSetCount}
              />
            </div>
          );
        })}

        {done === total && total > 0 && (
          <div className="rounded-3xl bg-gradient-primary p-6 text-center text-white shadow-glow">
            <div className="text-lg font-bold">Всё выполнено на сегодня ✨</div>
            <div className="mt-1 text-sm text-white/85">
              Отличный день! Загляни в статистику, чтобы увидеть серию.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
