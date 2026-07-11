import { ListChecks, Sparkles, Target } from "lucide-react";
import type { Game } from "@/lib/data/types";

function Chip({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function GameDetail({ game }: { game: Game }) {
  const hasMeta = game.method || game.reinforcement || game.prompts || game.errorCorrection;
  return (
    <div className="mx-auto max-h-[82vh] w-full max-w-md overflow-y-auto px-5 pb-8 pt-1">
      {game.tags.length > 0 && (
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[oklch(0.5_0.27_305)]" />
          <span className="text-xs font-medium text-muted-foreground">{game.tags.join(" · ")}</span>
        </div>
      )}
      <h2 className="text-2xl font-extrabold text-foreground">{game.title}</h2>

      <div className="mt-3 flex items-start gap-2 rounded-3xl bg-gradient-primary p-4 text-white shadow-glow">
        <Target className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/80">Цель</div>
          <div className="mt-0.5 text-sm font-medium">{game.goal}</div>
        </div>
      </div>

      {game.successCriterion && (
        <div className="mt-3 rounded-3xl bg-surface-2 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Критерий успешности
          </div>
          <div className="mt-1 text-sm text-foreground">{game.successCriterion}</div>
        </div>
      )}

      {hasMeta && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Chip label="Метод" value={game.method} />
          <Chip label="Поощрение" value={game.reinforcement} />
          <Chip label="Подсказки" value={game.prompts} />
          <Chip label="Коррекция ошибки" value={game.errorCorrection} />
        </div>
      )}

      {game.steps && game.steps.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
            <ListChecks className="h-4 w-4" /> Этапы
          </div>
          <ol className="space-y-2">
            {game.steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-surface p-3 shadow-card ring-1 ring-black/[0.04]"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {game.instruction && (
        <div className="mt-4">
          <div className="mb-2 font-semibold text-foreground">Как проводить</div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {game.instruction}
          </p>
        </div>
      )}

      {game.program && (
        <div className="mt-5 text-center text-xs text-muted-foreground">
          Программа · {game.program}
        </div>
      )}
    </div>
  );
}
