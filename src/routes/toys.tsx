import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, ToyBrick, Trash2, X } from "lucide-react";
import { GradientBlobs } from "@/components/GradientBlobs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ToyLogService } from "@/lib/data/toyLog";
import type { ToyLogEntry } from "@/lib/data/types";

export const Route = createFileRoute("/toys")({
  component: ToysPage,
  head: () => ({
    meta: [
      { title: "Игрушки — Трекер развивающих занятий" },
      {
        name: "description",
        content: "Фото игрушек и заметки о том, как вы в них играли.",
      },
    ],
  }),
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function AddEntryDrawer({ onAdded }: { onAdded: (e: ToyLogEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [toyName, setToyName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setToyName("");
    setDescription("");
    setFiles([]);
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
  };

  const onFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const arr = Array.from(list);
    setFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeAt = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      const url = prev[i];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const canSave = description.trim().length > 0 || files.length > 0;

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const entry = await ToyLogService.add({
        toyName: toyName.trim(),
        description: description.trim(),
        files,
      });
      onAdded(entry);
      reset();
      setOpen(false);
    } catch (err) {
      console.error("[toys] add failed", err);
      alert("Не получилось сохранить запись. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };




  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DrawerTrigger asChild>
        <button className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-4 text-base font-semibold text-white shadow-glow transition-transform active:scale-[0.98]">
          <ImagePlus className="h-5 w-5" />
          Добавить запись
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="text-left">
          <DrawerTitle>Новая запись</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Фото игрушки и пара слов о том, как вы играли.
          </p>
        </DrawerHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-4 pb-2">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            {previews.length === 0 ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl bg-surface-2 px-4 py-6 text-sm font-medium text-muted-foreground ring-1 ring-black/[0.04] transition-colors active:scale-[0.98]"
              >
                <Camera className="h-6 w-6 text-[oklch(0.62_0.22_264)]" />
                Добавить фото
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/[0.04]"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeAt(i)}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="grid aspect-square place-items-center rounded-xl bg-surface-2 text-muted-foreground ring-1 ring-black/[0.04]"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <input
            value={toyName}
            onChange={(e) => setToyName(e.target.value)}
            placeholder="Название игрушки (необязательно)"
            className="w-full rounded-2xl bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Как играли, что понравилось, что получилось…"
            className="w-full resize-y rounded-2xl bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
          />
        </div>

        <DrawerFooter>
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
          <DrawerClose asChild>
            <button className="w-full rounded-full border-2 border-[oklch(0.62_0.22_264)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.45_0.25_285)]">
              Отмена
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function EntryCard({ entry, onDelete }: { entry: ToyLogEntry; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]"
    >
      {entry.photos.length > 0 && (
        <div
          className={
            entry.photos.length === 1
              ? "mb-3 overflow-hidden rounded-2xl"
              : "mb-3 grid grid-cols-3 gap-1.5"
          }
        >
          {entry.photos.map((src, i) => (
            <div
              key={i}
              className={
                entry.photos.length === 1
                  ? "aspect-[4/3] w-full overflow-hidden rounded-2xl"
                  : "aspect-square overflow-hidden rounded-xl"
              }
            >
              <img
                src={src}
                alt={entry.toyName || "Игрушка"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {entry.toyName && (
            <div className="truncate text-sm font-semibold text-foreground">{entry.toyName}</div>
          )}
          {entry.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{entry.description}</p>
          )}
          <div className="mt-1.5 text-xs capitalize text-muted-foreground/70">
            {formatDate(entry.createdAt)}
          </div>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Удалить запись"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function ToysPage() {
  const [entries, setEntries] = useState<ToyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ToyLogService.list()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const onAdded = (entry: ToyLogEntry) => setEntries((prev) => [entry, ...prev]);

  const onDelete = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await ToyLogService.remove(id);
  };

  return (
    <div>
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
              <ToyBrick className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Игрушки</h1>
          </div>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Фото игрушек и заметки о том, как вы в них играли
          </p>

          <div className="mt-6">
            <AddEntryDrawer onAdded={onAdded} />
          </div>
        </div>
      </header>

      <main className="space-y-4 px-4 pt-6 pb-4">
        {loading ? null : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface px-6 py-12 text-center shadow-card ring-1 ring-black/[0.04]">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft">
              <ToyBrick className="h-7 w-7" />
            </div>
            <div className="text-base font-semibold text-foreground">Пока пусто</div>
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              Добавь первое фото игрушки и опиши, как вы в неё играли 🙂
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
