import { motion } from "framer-motion";
import {
  Blocks,
  Copy,
  Ear,
  Eye,
  Hand,
  MessageCircle,
  Mic,
  Music,
  Shapes,
  Sparkles,
  Timer,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Category, Game } from "@/lib/data/types";
import { GameCard } from "./GameCard";

const iconMap: Record<string, LucideIcon> = {
  messages: MessageCircle,
  eye: Eye,
  copy: Copy,
  blocks: Blocks,
  shapes: Shapes,
  ear: Ear,
  mic: Mic,
  timer: Timer,
  hand: Hand,
  wind: Wind,
  music: Music,
};

interface Props {
  category: Category;
  games: Game[];
  highlightId?: string;
  onToggle: (id: string) => void;
  onSetCount: (id: string, count: number) => void;
}

export function CategoryBlock({ category, games, highlightId, onToggle, onSetCount }: Props) {
  const Icon = iconMap[category.icon] ?? Sparkles;
  const done = games.filter((g) => g.status === "done").length;
  const totalMin = games.reduce((a, g) => a + g.durationMin, 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-foreground">{category.title}</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {done}/{games.length} · ~{totalMin} мин
        </div>
      </div>

      {games.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface/60 p-6 text-center text-sm text-muted-foreground">
          Пока пусто — добавим позже.
        </div>
      ) : (
        <motion.div
          className="space-y-2.5"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              highlight={g.id === highlightId}
              onToggle={onToggle}
              onSetCount={onSetCount}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
