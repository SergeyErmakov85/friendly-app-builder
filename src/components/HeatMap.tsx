interface Props {
  values: number[]; // length 42, 0..max — суммарное число отметок за день
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

export function HeatMap({ values, max = 22 }: Props) {
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
            style={v > 0 ? { backgroundColor: levelColor(v, max) } : undefined}
            title={v > 0 ? `отметок: ${v} из ${max}` : "нет занятий"}
          />
        ))}
      </div>
    </div>
  );
}
