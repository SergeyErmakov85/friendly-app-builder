import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";

export const Route = createFileRoute("/development-games")({
  component: DevelopmentGamesPage,
  head: () => ({
    meta: [
      { title: "Развивающие игры — Трекер развивающих занятий" },
      {
        name: "description",
        content: "Развивающие игры и занятия.",
      },
    ],
  }),
});

function DevelopmentGamesPage() {
  return (
    <div>
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Развивающие игры</h1>
        </div>
      </header>

      <main className="px-4 pt-6" />
    </div>
  );
}
