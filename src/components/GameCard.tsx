import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Clock, Play, Sparkles } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import type { Game } from "@/lib/data/types";
import { MAX_DOTS } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { GameDetail } from "./GameDetail";

interface Props {
  game: Game;
  highlight?: boolean;
  onToggle: (id: string) => void;
  onSetCount: (id: string, count: number) => void;
}

export function GameCard({ game, highlight, onToggle, onSetCount }: Props) {
  const count = game.count ?? 0;
  const done = count > 0;

  const handleDot = (i: number) => {
    // Клик по индексу i (1..MAX_DOTS): если такой же уровень — снимаем один,
    // иначе выставляем count = i. Даёт быстрый ввод любого числа отметок.
    const target = count === i ? i - 1 : i;
    onSetCount(game.id, target);
  };

  return (
    <Drawer>
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
            aria-label={done ? "Сбросить отметки" : "Отметить выполненным"}
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
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{game.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {game.durationMin} мин
              </span>
              <span>
                {game.ageMin}–{game.ageMax} лет
              </span>
              {game.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-foreground/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <DrawerTrigger asChild>
            <button
              aria-label="Открыть методику"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft transition-transform active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
            </button>
          </DrawerTrigger>
        </div>

        {/* Ряд из 10 кружочков-счётчика */}
        <div
          className="mt-3 flex items-center justify-between gap-1.5 pl-14 pr-1"
          role="group"
          aria-label={`Счётчик отметок: ${count} из ${MAX_DOTS}`}
        >
          {Array.from({ length: MAX_DOTS }, (_, idx) => {
            const i = idx + 1;
            const filled = i <= count;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Отметить ${i}`}
                aria-pressed={filled}
                onClick={() => handleDot(i)}
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full transition-all active:scale-90",
                  filled
                    ? "bg-[oklch(0.78_0.13_195)] shadow-[0_2px_8px_-2px_oklch(0.72_0.15_195/0.6)] ring-1 ring-[oklch(0.72_0.15_195)]"
                    : "bg-surface-2 ring-1 ring-black/[0.04] hover:bg-[oklch(0.94_0.04_195)]",
                )}
              >
                <span className="sr-only">{i}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <DrawerContent>
        <DrawerTitle className="sr-only">{game.title}</DrawerTitle>
        <GameDetail game={game} />
      </DrawerContent>
    </Drawer>
  );
}
