interface Props {
  values: number[]; // length 42, 0..4
}

const levelBg = [
  "bg-surface-2",
  "bg-[oklch(0.85_0.08_270)]",
  "bg-[oklch(0.72_0.15_275)]",
  "bg-[oklch(0.58_0.22_285)]",
  "bg-[oklch(0.48_0.26_295)]",
];

const dayLabels = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export function HeatMap({ values }: Props) {
  // Render as 6 rows x 7 cols
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 pb-1 text-[11px] text-muted-foreground">
        {dayLabels.map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {values.map((v, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg ${levelBg[v] ?? levelBg[0]} transition-transform hover:scale-110`}
            title={`уровень ${v}`}
          />
        ))}
      </div>
    </div>
  );
}
