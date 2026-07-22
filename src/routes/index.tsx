import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Gamepad2, LogIn, Puzzle, Sparkles, ToyBrick, UserPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
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
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold text-foreground">Сегодня</h1>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{formatToday()}</p>
            </div>
            <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
              <Link
                to="/kinesiotherapy"
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-surface px-2 py-1.5 text-[10px] font-semibold text-foreground shadow-card ring-1 ring-black/[0.04] transition-transform active:scale-[0.96]"
              >
                <Dumbbell className="h-4 w-4 text-[oklch(0.62_0.22_264)]" />
                Кинезио
              </Link>
              <Link
                to="/development-games"
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-surface px-2 py-1.5 text-[10px] font-semibold text-foreground shadow-card ring-1 ring-black/[0.04] transition-transform active:scale-[0.96]"
              >
                <Gamepad2 className="h-4 w-4 text-[oklch(0.62_0.22_264)]" />
                Игры
              </Link>
              <Link
                to="/esdm"
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-surface px-2 py-1.5 text-[10px] font-semibold text-foreground shadow-card ring-1 ring-black/[0.04] transition-transform active:scale-[0.96]"
              >
                <Puzzle className="h-4 w-4 text-[oklch(0.62_0.22_264)]" />
                ESDM
              </Link>
              <Link
                to="/toys"
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-surface px-2 py-1.5 text-[10px] font-semibold text-foreground shadow-card ring-1 ring-black/[0.04] transition-transform active:scale-[0.96]"
              >
                <ToyBrick className="h-4 w-4 text-[oklch(0.62_0.22_264)]" />
                Игрушки
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

          {signedIn === false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-5 space-y-2.5"
            >
              <p className="text-center text-xs text-muted-foreground">
                Войдите, чтобы отметки, статистика и фото игрушек сохранялись в облаке
              </p>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3.5 text-base font-semibold text-white shadow-glow transition-transform active:scale-[0.98]"
              >
                <LogIn className="h-5 w-5" />
                Войти
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[oklch(0.62_0.22_264)] px-5 py-3 text-base font-semibold text-[oklch(0.45_0.25_285)] transition-transform active:scale-[0.98]"
              >
                <UserPlus className="h-5 w-5" />
                Зарегистрироваться
              </Link>
            </motion.div>
          )}

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
