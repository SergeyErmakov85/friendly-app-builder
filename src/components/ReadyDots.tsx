import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { MAX_DOTS } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface Props {
  count: number;
  onSetCount: (count: number) => void;
  className?: string;
}

/**
 * Блок «Ребёнок готов» + ряд из 10 кружочков-счётчика.
 * Точная копия управления из GameCard, вынесенная для страниц,
 * где карточки не являются Game (кинезиотерапия, дневник «Игрушки»).
 */
export function ReadyDots({ count, onSetCount, className }: Props) {
  const [ready, setReady] = useState(count > 0);

  useEffect(() => {
    if (count > 0) setReady(true);
  }, [count]);

  const handleDot = (i: number) => {
    if (!ready) return;
    onSetCount(count === i ? i - 1 : i);
  };

  return (
    <div className={className}>
      {/* Кнопка «Ребёнок готов» — активирует возможность отмечать выполнение */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setReady((v) => !v)}
          aria-pressed={ready}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95",
            ready
              ? "bg-[oklch(0.88_0.13_150)] text-[oklch(0.32_0.09_150)] ring-1 ring-[oklch(0.78_0.15_150)]"
              : "bg-[oklch(0.94_0.09_150)] text-[oklch(0.38_0.11_150)] ring-1 ring-[oklch(0.86_0.11_150)] shadow-[0_2px_8px_-2px_oklch(0.78_0.15_150/0.5)] hover:bg-[oklch(0.91_0.11_150)]",
          )}
        >
          {ready && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          Ребёнок готов
        </button>
      </div>

      {/* Ряд из 10 кружочков-счётчика */}
      <div
        className="mt-3 flex items-center justify-between gap-1.5 pr-1"
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
              disabled={!ready}
              onClick={() => handleDot(i)}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full transition-all active:scale-90",
                filled
                  ? "bg-[oklch(0.78_0.13_195)] shadow-[0_2px_8px_-2px_oklch(0.72_0.15_195/0.6)] ring-1 ring-[oklch(0.72_0.15_195)]"
                  : "bg-surface-2 ring-1 ring-black/[0.04] hover:bg-[oklch(0.94_0.04_195)]",
                !ready && "opacity-40 cursor-not-allowed",
              )}
            >
              <span className="sr-only">{i}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
