import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ban,
  ClipboardList,
  Gauge,
  HelpCircle,
  Layers,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";
import { ReadyDots } from "@/components/ReadyDots";
import { KinesioMarks } from "@/lib/data/dailyMarks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  kinAssessmentIntro,
  kinConclusion,
  kinCriteria,
  kinDisclaimer,
  kinDosing,
  kinDualTasks,
  kinDualTasksIntro,
  kinEquipment,
  kinEquipmentIntro,
  kinFoundations,
  kinIntro,
  kinMonitoringIntro,
  kinNotice,
  kinPhases,
  kinQuestions,
  kinRedFlags,
  kinRedFlagsIntro,
  kinSafetyIntro,
  kinScale,
  kinSessions,
  kinWeeks,
  phaseLabels,
  type ExercisePhase,
  type KinExercise,
} from "@/lib/data/kinesiotherapy";

export const Route = createFileRoute("/kinesiotherapy")({
  component: KinesiotherapyPage,
  head: () => ({
    meta: [
      { title: "Кинезиотерапия — Трекер развивающих занятий" },
      {
        name: "description",
        content:
          "Игровая кинезиотерапия для ребёнка 3 лет: четырёхнедельная программа из 12 занятий, протоколы безопасности и шкала мониторинга.",
      },
    ],
  }),
});

/* --- Мелкие строительные блоки (только существующие токены) --- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-card ring-1 ring-black/[0.04]">
      {children}
    </section>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
        {icon}
      </span>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
  );
}

function Prose({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-foreground/80">
          {p}
        </p>
      ))}
    </div>
  );
}

function Chip({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

const phaseOrder: ExercisePhase[] = ["warmup", "main", "cooldown"];

function ExerciseItem({
  ex,
  count,
  onSetCount,
}: {
  ex: KinExercise;
  count: number;
  onSetCount: (count: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]">
      <div className="text-sm font-bold text-foreground">{ex.title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{ex.purpose}</div>

      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{ex.how}</p>

      {ex.cue && (
        <p className="mt-2 rounded-2xl bg-surface-2 px-3 py-2 text-sm italic text-foreground/80">
          «{ex.cue}»
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Chip label="Упрощение" value={ex.easier} />
        <Chip label="Усложнение" value={ex.harder} />
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        {ex.dose}
      </div>

      <ReadyDots count={count} onSetCount={onSetCount} />
    </div>
  );
}

function SessionBlock({
  number,
  marks,
  onSetCount,
}: {
  number: number;
  marks: Record<string, number>;
  onSetCount: (id: string, count: number) => void;
}) {
  const s = kinSessions.find((x) => x.number === number);
  if (!s) return null;
  return (
    <AccordionItem value={`session-${s.number}`} className="border-none">
      <AccordionTrigger className="rounded-2xl bg-surface-2 px-4 py-3 text-left hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
            {s.number}
          </span>
          <span className="text-sm font-semibold text-foreground">{s.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-3">
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">{s.intro}</p>
        {phaseOrder.map((ph) => {
          const list = s.exercises.filter((e) => e.phase === ph);
          if (list.length === 0) return null;
          return (
            <div key={ph} className="mb-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {phaseLabels[ph]}
              </div>
              <div className="space-y-2.5">
                {list.map((e) => (
                  <ExerciseItem
                    key={e.id}
                    ex={e}
                    count={marks[e.id] ?? 0}
                    onSetCount={(c) => onSetCount(e.id, c)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}

function KinesiotherapyPage() {
  const [marks, setMarks] = useState<Record<string, number>>(() => KinesioMarks.getToday());

  useEffect(() => {
    KinesioMarks.pullToday().then(setMarks);
  }, []);

  const onSetCount = (id: string, count: number) => {
    setMarks(KinesioMarks.setCount(id, count));
  };

  return (
    <div>
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Кинезиотерапия</h1>
        </div>
        <p className="relative mt-2 text-sm text-muted-foreground">
          Игровая программа физического развития · 3 года · 4 недели, 12 занятий
        </p>
      </header>

      <main className="space-y-5 px-4 pt-6">
        {/* Вступление */}
        <Card>
          <Prose items={kinIntro} />
        </Card>

        {/* Уведомление — единственный акцентный блок */}
        <section className="rounded-3xl bg-gradient-primary p-5 text-white shadow-glow">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {kinNotice.title}
              </div>
              <p className="mt-1 text-sm leading-relaxed">{kinNotice.text}</p>
            </div>
          </div>
        </section>

        {/* Предварительная оценка */}
        <Card>
          <SectionHead icon={<HelpCircle className="h-4 w-4" />} title="Предварительная оценка" />
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">{kinAssessmentIntro}</p>
          <ol className="space-y-2">
            {kinQuestions.map((q) => (
              <li key={q.n} className="flex gap-3 rounded-2xl bg-surface-2 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                  {q.n}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{q.title}</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{q.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* Основы */}
        <Card>
          <SectionHead
            icon={<Layers className="h-4 w-4" />}
            title="Биомеханические и нейрофизиологические основы"
          />
          <Prose items={kinFoundations} />
        </Card>

        {/* Безопасность */}
        <Card>
          <SectionHead
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Протоколы безопасности"
          />
          <p className="text-sm leading-relaxed text-foreground/80">{kinSafetyIntro}</p>

          <div className="mt-4 text-sm font-semibold text-foreground">
            Идентификация «красных флагов»
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{kinRedFlagsIntro}</p>
          <div className="mt-3 space-y-2">
            {kinRedFlags.map((f) => (
              <div key={f.category} className="rounded-2xl bg-surface-2 p-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {f.category}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{f.signs}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 text-sm font-semibold text-foreground">{kinDosing.title}</div>
          <div className="mt-1 space-y-2">
            {kinDosing.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/80">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            {kinDosing.exclusionsIntro}
          </p>
          <ul className="mt-2 space-y-2">
            {kinDosing.exclusions.map((e, i) => (
              <li key={i} className="flex gap-2 rounded-2xl bg-surface-2 p-3">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground/80">{e}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Мониторинг */}
        <Card>
          <SectionHead
            icon={<Gauge className="h-4 w-4" />}
            title="Система мониторинга и оценки прогресса"
          />
          <p className="text-sm leading-relaxed text-foreground/80">{kinMonitoringIntro}</p>
          <div className="mt-3 space-y-2">
            {kinScale.map((l) => (
              <div key={l.score} className="flex gap-3 rounded-2xl bg-surface-2 p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                  {l.score}
                </span>
                <p className="text-sm leading-relaxed text-foreground/80">{l.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm font-semibold text-foreground">
            Критерии для еженедельного наблюдения
          </div>
          <div className="mt-2 space-y-2">
            {kinCriteria.map((c) => (
              <div key={c.title} className="rounded-2xl bg-surface-2 p-3">
                <div className="text-sm font-semibold text-foreground">{c.title}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{c.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Фазы */}
        {kinPhases.map((ph) => (
          <Card key={ph.phase}>
            <SectionHead icon={<Layers className="h-4 w-4" />} title={ph.title} />
            <div className="mb-2 text-xs font-medium text-muted-foreground">{ph.weeks}</div>
            <p className="text-sm leading-relaxed text-foreground/80">{ph.text}</p>
          </Card>
        ))}

        {/* Недели и занятия */}
        {kinWeeks.map((w) => (
          <Card key={w.number}>
            <SectionHead
              icon={<ClipboardList className="h-4 w-4" />}
              title={`Неделя ${w.number}. ${w.title}`}
            />
            <p className="text-sm leading-relaxed text-foreground/80">{w.summary}</p>
            {w.note && (
              <p className="mt-2 rounded-2xl bg-surface-2 p-3 text-sm leading-relaxed text-foreground/80">
                {w.note}
              </p>
            )}

            <Accordion type="multiple" className="mt-3 space-y-2">
              {w.sessions.map((n) => (
                <SessionBlock key={n} number={n} marks={marks} onSetCount={onSetCount} />
              ))}
            </Accordion>

            {w.number === 4 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-foreground">Двойные задачи</div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {kinDualTasksIntro}
                </p>
                <div className="mt-2 space-y-2">
                  {kinDualTasks.map((d) => (
                    <div key={d.title} className="rounded-2xl bg-surface-2 p-3">
                      <div className="text-sm font-semibold text-foreground">{d.title}</div>
                      <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{d.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {/* Инвентарь */}
        <Card>
          <SectionHead
            icon={<Package className="h-4 w-4" />}
            title="Материально-техническое обеспечение"
          />
          <p className="text-sm leading-relaxed text-foreground/80">{kinEquipmentIntro}</p>
          <div className="mt-3 space-y-2">
            {kinEquipment.map((e) => (
              <div key={e.pro} className="rounded-2xl bg-surface-2 p-3">
                <div className="text-sm font-semibold text-foreground">{e.pro}</div>
                <div className="mt-1 text-sm text-foreground/80">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Дома:{" "}
                  </span>
                  {e.home}
                </div>
                <div className="mt-1 text-sm text-foreground/80">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Зачем:{" "}
                  </span>
                  {e.purpose}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Заключение */}
        <Card>
          <SectionHead icon={<Sparkles className="h-4 w-4" />} title="Заключение и выводы" />
          <Prose items={kinConclusion} />
        </Card>

        <p className="px-2 pb-2 text-center text-xs leading-relaxed text-muted-foreground">
          {kinDisclaimer}
        </p>
      </main>
    </div>
  );
}
