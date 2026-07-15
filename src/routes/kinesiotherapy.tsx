import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";

export const Route = createFileRoute("/kinesiotherapy")({
  component: KinesiotherapyPage,
  head: () => ({
    meta: [
      { title: "Кинезиотерапия — Трекер развивающих занятий" },
      {
        name: "description",
        content: "Кинезиотерапия: упражнения и активности для развития.",
      },
    ],
  }),
});

function KinesiotherapyPage() {
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
      </header>
    </div>
  );
}
