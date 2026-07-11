import { motion } from "framer-motion";
import { Check, Clock, Play, Sparkles } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import type { Game } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { GameDetail } from "./GameDetail";

interface Props {
  game: Game;
  highlight?: boolean;
  onToggle: (id: string) => void;
}

export function GameCard({ game, highlight, onToggle }: Props) {
  const done = game.status === "done";
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
            aria-label={done ? "Отметить невыполненным" : "Отметить выполненным"}
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
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.5_0.27_305)]" />
              <h3
                className={cn(
                  "truncate font-semibold text-foreground",
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
      </motion.div>

      <DrawerContent>
        <DrawerTitle className="sr-only">{game.title}</DrawerTitle>
        <GameDetail game={game} />
      </DrawerContent>
    </Drawer>
  );
}
