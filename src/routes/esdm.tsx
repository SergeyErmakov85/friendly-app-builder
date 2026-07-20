import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Blocks,
  Check,
  Hand,
  Lightbulb,
  NotebookPen,
  Puzzle,
  Shapes,
  Sparkles,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";
import { ProgressCircle } from "@/components/ProgressCircle";
import { EsdmService } from "@/lib/data/DataService";
import { esdmDayLabels, esdmIntro } from "@/lib/data/esdmGames";
import type { Game } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/esdm")({
  component: EsdmPage,
  head: () => ({
    meta: [
      { title: "Денверская модель (ESDM) — Трекер развивающих занятий" },
      {
        name: "description",
        content:
          "Дневник игровых занятий по Денверской модели (ESDM): 7 игр в 4 категориях, недельный трекер и заметки об успехах ребёнка.",
      },
    ],
  }),
});

const categoryIcons: Record<string, LucideIcon> = {
  blocks: Blocks,
  hand: Hand,
  shapes: Shapes,
  timer: Timer,
};

function todayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function EsdmGameCard({
  game,
  week,
  highlight,
  onToggle,
}: {
  game: Game;
  week: boolean[];
  highlight?: boolean;
  onToggle: (id: string) => void;
}) {
  const [note, setNote] = useState(() => EsdmService.getNote(game.id));
  const done = (game.count ?? 0) > 0;
  const today = todayIndex();

  const onNote = (text: string) => {
    setNote(text);
    EsdmService.setNote(game.id, text);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "group relative rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04] transition-all",
        "hover:-translate-y-0.5 hover:shadow-soft",
        done && "bg-surface-2",
        highlight && "ring-2 ring-[oklch(0.62_0.22_264)] shadow-glow",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(game.id)}
          aria-label={done ? "Сбросить отметку за сегодня" : "Отметить сыгранной сегодня"}
          className={cn(
            "mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 transition-all",
            done
              ? "bg-gradient-primary border-transparent text-white shadow-glow"
              : "border-border bg-white text-transparent hover:border-[oklch(0.62_0.22_264)]",
          )}
        >
          <motion.div
            initial={false}
            animate={{ scale: done ? 1 : 0.6, opacity: done ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </motion.div>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-[oklch(0.5_0.27_305)]" />
            <h3
              className={cn(
                "min-w-0 font-semibold text-foreground",
                done && "line-through text-muted-foreground",
              )}
            >
              {game.title}
            </h3>
          </div>
          <div className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{game.goal}</span>
          </div>
          <div className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{game.notes}</span>
          </div>
        </div>
      </div>

      {/* Недельная полоска Пн..Вс */}
      <div
        className="mt-3 flex items-center justify-between gap-1.5 pl-14 pr-1"
        role="group"
        aria-label="Отметки за неделю"
      >
        {esdmDayLabels.map((d, i) => (
          <div
            key={d}
            aria-label={`${d}: ${week[i] ? "играли" : "не играли"}`}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold transition-all",
              week[i]
                ? "bg-[oklch(0.78_0.13_195)] text-white shadow-[0_2px_8px_-2px_oklch(0.72_0.15_195/0.6)] ring-1 ring-[oklch(0.72_0.15_195)]"
                : "bg-surface-2 text-muted-foreground ring-1 ring-black/[0.04]",
              i === today && "ring-2 ring-[oklch(0.62_0.22_264)]",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Заметки / успехи ребёнка */}
      <div className="mt-3 pl-14 pr-1">
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          rows={1}
          placeholder="Заметки: успехи ребёнка (взгляд, слово, жест)…"
          className="w-full resize-y rounded-2xl bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
        />
      </div>
    </motion.div>
  );
}

function EsdmPage() {
  const categories = useMemo(() => EsdmService.getCategories(), []);
  const [games, setGames] = useState<Game[]>(() => EsdmService.getGames());
  const [highlightId, setHighlightId] = useState<string | undefined>();

  const onToggle = (id: string) => {
    setGames(EsdmService.toggleGame(id));
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
      const el = document.getElementById(`esdm-game-${next.id}`);
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
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
              <Puzzle className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Денверская модель</h1>
          </div>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Дневник игровых занятий по ESDM · 3,5 года · 7 игр
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex items-center gap-4 rounded-3xl bg-white/70 p-4 shadow-card ring-1 ring-white backdrop-blur-md"
          >
            <ProgressCircle percent={percent} size={104} stroke={10} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground">Сыграли сегодня</div>
              <div className="text-2xl font-extrabold">
                {done} <span className="text-muted-foreground">из</span> {total}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {percent === 100
                  ? "Ура, всё сыграно! 🎉"
                  : percent === 0
                    ? "Начни с одной игры 🙂"
                    : "Отличный ритм, продолжай!"}
              </div>
            </div>
          </motion.div>

          <button
            onClick={handleSuggest}
            className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-4 text-base font-semibold text-white shadow-glow transition-transform active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            Предложить следующую игру
          </button>
        </div>
      </header>

      <main className="space-y-8 px-4 pt-6">
        {/* Инструкция из дневника */}
        <section className="rounded-3xl bg-gradient-primary p-5 text-white shadow-glow">
          <div className="flex items-start gap-2">
            <NotebookPen className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Как вести дневник
              </div>
              <p className="mt-1 text-sm leading-relaxed">{esdmIntro}</p>
            </div>
          </div>
        </section>

        {/* Игры по категориям */}
        {categories.map((c) => {
          const list = games
            .filter((g) => g.categoryId === c.id)
            .sort((a, b) => a.priority - b.priority);
          const Icon = categoryIcons[c.icon] ?? Sparkles;
          const catDone = list.filter((g) => g.status === "done").length;
          return (
            <section key={c.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold text-foreground">{c.title}</h2>
                </div>
                <div className="text-xs text-muted-foreground">
                  {catDone}/{list.length}
                </div>
              </div>

              <motion.div
                className="space-y-2.5"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {list.map((g) => (
                  <div key={g.id} id={`esdm-game-${g.id}`} className="scroll-mt-24">
                    <EsdmGameCard
                      game={g}
                      week={EsdmService.getGameWeek(g.id)}
                      highlight={g.id === highlightId}
                      onToggle={onToggle}
                    />
                  </div>
                ))}
              </motion.div>
            </section>
          );
        })}

        {done === total && total > 0 && (
          <div className="rounded-3xl bg-gradient-primary p-6 text-center text-white shadow-glow">
            <div className="text-lg font-bold">Все игры сыграны сегодня ✨</div>
            <div className="mt-1 text-sm text-white/85">
              Отличный день! Не забудь записать успехи ребёнка в заметки.
            </div>
          </div>
        )}

        <p className="px-2 pb-2 text-center text-xs leading-relaxed text-muted-foreground">
          Дневник ведётся по Денверской модели раннего вмешательства (ESDM). Материалы носят
          информационный характер и не заменяют консультацию специалиста.
        </p>
      </main>
    </div>
  );
}
