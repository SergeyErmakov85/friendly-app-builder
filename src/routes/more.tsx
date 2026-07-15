import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Bell,
  ChevronRight,
  Cloud,
  Download,
  Globe,
  Info,
  Moon,
  Palette,
  Trash2,
  Upload,
} from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/more")({
  component: MorePage,
  head: () => ({
    meta: [
      { title: "Ещё — Трекер развивающих занятий" },
      { name: "description", content: "Настройки уведомлений, синхронизации и резервных копий." },
    ],
  }),
});

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-card ring-1 ring-black/[0.04]">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, hint, right }: { label: string; hint?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2/60 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function MorePage() {
  const [reminders, setReminders] = useState(true);
  const [morning, setMorning] = useState(true);
  const [breaks, setBreaks] = useState(true);
  const [evening, setEvening] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <div>
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative">
          <h1 className="text-3xl font-extrabold">Ещё</h1>
          <p className="mt-1 text-sm text-muted-foreground">Настройки и данные</p>
        </div>
      </header>

      <main className="space-y-5 px-4 pt-6">
        <Section
          icon={<Activity className="h-4 w-4" />}
          title="Материалы"
          description="Справочные программы и методики."
        >
          <Link
            to="/kinesiotherapy"
            className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2/60 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">Кинезиотерапия</div>
              <div className="text-xs text-muted-foreground">
                Игровая программа физического развития · 3 года
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </Section>

        <Section
          icon={<Bell className="h-4 w-4" />}
          title="Напоминания"
          description="Приходят, пока приложение открыто или недавно закрыто."
        >
          <Row
            label="Включить напоминания"
            hint="Разрешение получено"
            right={<Switch checked={reminders} onCheckedChange={setReminders} />}
          />
          <Row
            label="Утро"
            hint="06:45"
            right={<Switch checked={morning} onCheckedChange={setMorning} />}
          />
          <Row
            label="Перерывы"
            hint="14:00"
            right={<Switch checked={breaks} onCheckedChange={setBreaks} />}
          />
          <Row
            label="Вечер"
            hint="21:00"
            right={<Switch checked={evening} onCheckedChange={setEvening} />}
          />
          <button className="w-full rounded-full border-2 border-[oklch(0.62_0.22_264)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.45_0.25_285)] transition-colors hover:bg-surface-2">
            Проверить уведомление
          </button>
        </Section>

        <Section
          icon={<Cloud className="h-4 w-4" />}
          title="Облако"
          description="История улетает на твой сервер после каждой отметки."
        >
          <Row
            label="Токен"
            right={
              <span className="rounded-xl bg-surface-2 px-3 py-1 font-mono text-xs text-muted-foreground">
                ••••••••••••
              </span>
            }
          />
          <button className="w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-glow">
            Синхронизировать сейчас
          </button>
          <div className="text-center text-xs text-[oklch(0.5_0.15_155)]">
            ☁ синхронизировано только что
          </div>
        </Section>

        <Section
          icon={<Download className="h-4 w-4" />}
          title="Данные и бэкап"
          description="Сохрани файл-бэкап и переноси данные между устройствами."
        >
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-glow">
            <Download className="h-4 w-4" />
            Сохранить бэкап в файл
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[oklch(0.62_0.22_264)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.45_0.25_285)]">
            <Upload className="h-4 w-4" />
            Загрузить из файла
          </button>
          <p className="text-xs text-muted-foreground">
            Активных дней в памяти: <span className="font-semibold text-foreground">27</span>.
            Импорт объединяет данные, ничего не стирая.
          </p>
        </Section>

        <Section icon={<Palette className="h-4 w-4" />} title="Внешний вид">
          <Row
            label="Тёмная тема"
            hint="По умолчанию — светлая"
            right={
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <Switch checked={dark} onCheckedChange={setDark} />
              </div>
            }
          />
          <Row
            label="Язык"
            hint="Русский"
            right={<Globe className="h-4 w-4 text-muted-foreground" />}
          />
        </Section>

        <Section icon={<Info className="h-4 w-4" />} title="О приложении">
          <p className="text-sm text-muted-foreground">
            Трекер развивающих занятий — мягкое сопровождение развития ребёнка. Версия 0.1 (демо).
          </p>
        </Section>

        <Section icon={<Trash2 className="h-4 w-4" />} title="Сброс">
          <p className="text-xs text-muted-foreground">
            Полностью очистить все отметки на этом устройстве. Сделай бэкап заранее — отменить
            нельзя.
          </p>
          <button className="w-full rounded-full border-2 border-destructive/60 px-5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10">
            Стереть все данные
          </button>
        </Section>
      </main>
    </div>
  );
}
