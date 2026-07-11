interface Props {
  values: number[]; // length 42, 0..22 — сколько игр выполнено за день
}

const MAX_GAMES = 22;

/**
 * 22 оттенка синего: 1 игра — светло-голубой, все 22 — тёмно-синий,
 * почти сиреневый. Интерполяция в OKLCH (палитра проекта).
 */
const levelColor = (v: number): string => {
  const t = (Math.min(v, MAX_GAMES) - 1) / (MAX_GAMES - 1);
  const l = 0.88 - t * 0.46;
  const c = 0.07 + t * 0.19;
  const h = 245 + t * 55;
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(0)})`;
};

const dayLabels = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export function HeatMap({ values }: Props) {
  // Render as 6 rows x 7 cols
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
        {values.map((v, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg ${v > 0 ? "" : "bg-surface-2"} transition-transform hover:scale-110`}
            style={v > 0 ? { backgroundColor: levelColor(v) } : undefined}
            title={v > 0 ? `выполнено ${v} из ${MAX_GAMES}` : "нет занятий"}
          />
        ))}
      </div>
    </div>
  );
}
