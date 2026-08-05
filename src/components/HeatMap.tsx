interface Cell {
  date: string;
  day: number;
  value: number;
}

interface Props {
  cells: (Cell | null)[]; // календарь месяца, пн..вс
  max?: number;
}

/**
 * Плавная интерполяция от светло-голубого к тёмно-фиолетовому (палитра проекта).
 */
const levelColor = (v: number, max: number): string => {
  const t = Math.max(0, Math.min(1, (v - 1) / Math.max(1, max - 1)));
  const l = 0.88 - t * 0.46;
  const c = 0.07 + t * 0.19;
  const h = 245 + t * 55;
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(0)})`;
};

const dayLabels = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export function HeatMap({ cells, max = 22 }: Props) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 pb-1 text-[11px] text-muted-foreground">
        {dayLabels.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) =>
          c === null ? (
            <div key={`empty-${i}`} className="aspect-square" />
          ) : (
            <div
              key={c.date}
              className={`relative aspect-square rounded-lg ${c.value > 0 ? "" : "bg-surface-2"} transition-transform hover:scale-110`}
              style={c.value > 0 ? { backgroundColor: levelColor(c.value, max) } : undefined}
              title={c.value > 0 ? `отметок: ${c.value} из ${max}` : "нет занятий"}
            >
              <span
                className={`absolute left-1 top-0.5 text-[9px] font-medium leading-none ${
                  c.value > max / 2 ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {c.day}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
