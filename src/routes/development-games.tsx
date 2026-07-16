import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Ban,
  BookOpen,
  CalendarCheck,
  FlaskConical,
  Lightbulb,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";
import { ProgressCircle } from "@/components/ProgressCircle";
import { CategoryBlock } from "@/components/CategoryBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SpeechGamesService } from "@/lib/data/DataService";
import {
  categoryIntros,
  speechDisclaimer,
  speechIntro,
  speechNotice,
  speechSchedule,
  speechScience,
  speechSourcesEn,
  speechSourcesRu,
  speechTechniques,
  speechTechniquesIntro,
  zrrAdaptation,
  zrrAvoid,
  zrrDiagnostics,
} from "@/lib/data/speechGames";
import type { Game } from "@/lib/data/types";

export const Route = createFileRoute("/development-games")({
  component: DevelopmentGamesPage,
  head: () => ({
    meta: [
      { title: "Запуск речи — Трекер развивающих занятий" },
      {
        name: "description",
        content:
          "Развивающие игры для запуска речи у детей 3 лет: 27 игр и 6 упражнений при ЗРР с подробными инструкциями, отмечай сыгранное сегодня.",
      },
    ],
  }),
});

/* --- Строительные блоки в стиле страницы «Кинезиотерапия» --- */

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

function NumberedItem({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-3 rounded-2xl bg-surface-2 p-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
        {n}
      </span>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{text}</p>
      </div>
    </li>
  );
}

function DevelopmentGamesPage() {
  const categories = useMemo(() => SpeechGamesService.getCategories(), []);
  const [games, setGames] = useState<Game[]>(() => SpeechGamesService.getGames());
  const [highlightId, setHighlightId] = useState<string | undefined>();

  const onToggle = (id: string) => {
    setGames(SpeechGamesService.toggleGame(id));
  };

  const onSetCount = (id: string, count: number) => {
    setGames(SpeechGamesService.setGameCount(id, count));
  };

  const done = games.filter((g) => g.status === "done").length;
  const total = games.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const handleSuggest = () => {
    const next = [...games]
      .filter((g) => g.status === "todo")
      .sort((a, b) => a.priority - b.priority)[0];
    if (!next) return;
    setHighlightId(next.id);
    setTimeout(() => {
      const el = document.getElementById(`speech-game-${next.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    setTimeout(() => setHighlightId(undefined), 2400);
  };

  return (
    <div>
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Запуск речи</h1>
          </div>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Развивающие игры для запуска речи · 3 года · только подручные средства
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex items-center gap-4 rounded-3xl bg-white/70 p-4 shadow-card ring-1 ring-white backdrop-blur-md"
          >
            <ProgressCircle percent={percent} size={104} stroke={10} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground">Сыграли сегодня</div>
              <div className="text-2xl font-extrabold">
                {done} <span className="text-muted-foreground">из</span> {total}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {percent === 100
                  ? "Ура, всё сыграно! 🎉"
                  : percent === 0
                    ? "Начни с одной игры 🙂"
                    : "Отличный ритм, продолжай!"}
              </div>
            </div>
          </motion.div>

          <button
            onClick={handleSuggest}
            className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-4 text-base font-semibold text-white shadow-glow transition-transform active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            Предложить следующую игру
          </button>
        </div>
      </header>

      <main className="space-y-8 px-4 pt-6">
        {/* Вступление */}
        <Card>
          <div className="space-y-3">
            {speechIntro.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/80">
                {p}
              </p>
            ))}
          </div>
        </Card>

        {/* Важно — акцентный блок */}
        <section className="rounded-3xl bg-gradient-primary p-5 text-white shadow-glow">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {speechNotice.title}
              </div>
              <p className="mt-1 text-sm leading-relaxed">{speechNotice.text}</p>
            </div>
          </div>
        </section>

        {/* Что говорит наука */}
        <Card>
          <SectionHead
            icon={<FlaskConical className="h-4 w-4" />}
            title="Что говорит наука о «запуске речи»"
          />
          <Accordion type="multiple" className="space-y-2">
            {speechScience.map((s, i) => (
              <AccordionItem key={i} value={`science-${i}`} className="border-none">
                <AccordionTrigger className="rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm font-semibold text-foreground hover:no-underline">
                  {s.title}
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2">
                  <p className="text-sm leading-relaxed text-foreground/80">{s.text}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* 10 сквозных техник */}
        <Card>
          <SectionHead
            icon={<Lightbulb className="h-4 w-4" />}
            title="Десять сквозных техник — «двигатель» всех игр"
          />
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">{speechTechniquesIntro}</p>
          <ol className="space-y-2">
            {speechTechniques.map((t) => (
              <NumberedItem key={t.n} n={t.n} title={t.title} text={t.text} />
            ))}
          </ol>
        </Card>

        {/* Игры по категориям — как на главной */}
        {categories.map((c) => {
          const list = games
            .filter((g) => g.categoryId === c.id)
            .sort((a, b) => a.priority - b.priority);
          return (
            <div key={c.id}>
              {list.map((g) => (
                <div key={g.id} id={`speech-game-${g.id}`} className="scroll-mt-24" />
              ))}

              {/* Перед блоком упражнений при ЗРР — вводные карточки раздела */}
              {c.id === "speech-zrr" && (
                <div className="mb-5 space-y-5">
                  <Card>
                    <SectionHead
                      icon={<Stethoscope className="h-4 w-4" />}
                      title="Если у ребёнка ЗРР: сначала — диагностика"
                    />
                    <div className="space-y-3">
                      {zrrDiagnostics.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground/80">
                          {p}
                        </p>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionHead
                      icon={<Lightbulb className="h-4 w-4" />}
                      title="Как адаптировать все игры при ЗРР"
                    />
                    <ol className="space-y-2">
                      {zrrAdaptation.map((a, i) => (
                        <NumberedItem key={i} n={i + 1} title={a.title} text={a.text} />
                      ))}
                    </ol>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                      Все приёмы согласуются с поведенческими программами раннего вмешательства
                      (обучение в естественной среде, шейпинг, временная задержка подсказки,
                      обучение просьбам) — если с ребёнком уже работает команда специалистов, игры
                      встраиваются в общую систему, а не конкурируют с ней.
                    </p>
                  </Card>
                </div>
              )}

              <div className="mb-3 px-1 text-sm leading-relaxed text-muted-foreground">
                {categoryIntros[c.id]}
              </div>
              <CategoryBlock
                category={c}
                games={list}
                highlightId={highlightId}
                onToggle={onToggle}
                onSetCount={onSetCount}
              />
            </div>
          );
        })}

        {/* Чего избегать */}
        <Card>
          <SectionHead icon={<Ban className="h-4 w-4" />} title="Чего избегать" />
          <ul className="space-y-2">
            {zrrAvoid.map((a, i) => (
              <li key={i} className="flex gap-2 rounded-2xl bg-surface-2 p-3">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm leading-relaxed text-foreground/80">{a}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Режим занятий */}
        <Card>
          <SectionHead
            icon={<CalendarCheck className="h-4 w-4" />}
            title="Режим занятий и отслеживание прогресса"
          />
          <div className="space-y-2">
            {speechSchedule.map((s) => (
              <div key={s.title} className="rounded-2xl bg-surface-2 p-3">
                <div className="text-sm font-semibold text-foreground">{s.title}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{s.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Источники */}
        <Card>
          <SectionHead icon={<BookOpen className="h-4 w-4" />} title="Источники" />
          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="sources-en" className="border-none">
              <AccordionTrigger className="rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm font-semibold text-foreground hover:no-underline">
                Англоязычные (доказательная база и методики)
              </AccordionTrigger>
              <AccordionContent className="px-1 pt-2">
                <ol className="space-y-2">
                  {speechSourcesEn.map((s, i) => (
                    <li key={i} className="text-xs leading-relaxed text-foreground/70">
                      {i + 1}. {s}
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sources-ru" className="border-none">
              <AccordionTrigger className="rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm font-semibold text-foreground hover:no-underline">
                Российские (игровой репертуар и методики)
              </AccordionTrigger>
              <AccordionContent className="px-1 pt-2">
                <ol className="space-y-2">
                  {speechSourcesRu.map((s, i) => (
                    <li key={i} className="text-xs leading-relaxed text-foreground/70">
                      {i + 1}. {s}
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {done === total && total > 0 && (
          <div className="rounded-3xl bg-gradient-primary p-6 text-center text-white shadow-glow">
            <div className="text-lg font-bold">Все игры сыграны сегодня ✨</div>
            <div className="mt-1 text-sm text-white/85">
              Отличный день! Завтра начнём заново — повторение работает на вас.
            </div>
          </div>
        )}

        <p className="px-2 pb-2 text-center text-xs leading-relaxed text-muted-foreground">
          {speechDisclaimer}
        </p>
      </main>
    </div>
  );
}
