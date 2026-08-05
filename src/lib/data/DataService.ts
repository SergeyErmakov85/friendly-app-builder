import type { Category, DayStat, Game } from "./types";
import { MAX_DOTS } from "./types";
import { categories as mockCategories, games as mockGames } from "./mock";
import { speechCategories, speechGames } from "./speechGames";
import { esdmCategories, esdmGames } from "./esdmGames";

const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseKey = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const shiftKey = (key: string, days: number): string => {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
};

type DayCounts = Record<string, number>; // gameId -> count 0..MAX_DOTS

/**
 * DataService — единая точка доступа к данным.
 *
 * История хранится по дням: { "yyyy-mm-dd": { gameId: count } }, где count —
 * сколько раз в этот день задание было отмечено (0..10). «Статус» игры на
 * сегодня = count > 0. Все графики строятся из этой истории.
 */
interface DataSet {
  games: Game[];
  categories: Category[];
  historyKey: string;
  legacyKeys?: string[];
  notesKey?: string;
}

export type SyncPayload =
  | { kind: "mark"; gameId: string; date: string; count: number }
  | { kind: "note"; gameId: string; note: string };

export class DataServiceImpl {
  private games: Game[];
  private categories: Category[];
  private history: Record<string, DayCounts> = {};
  private notes: Record<string, string> = {};
  private readonly HISTORY_KEY: string;
  private readonly LEGACY_KEYS: string[];
  private readonly NOTES_KEY?: string;
  private syncHandler?: (payload: SyncPayload) => void;

  constructor(data: DataSet) {
    this.games = data.games.map((g) => ({ ...g, count: 0 }));
    this.categories = data.categories;
    this.HISTORY_KEY = data.historyKey;
    this.LEGACY_KEYS = data.legacyKeys ?? [];
    this.NOTES_KEY = data.notesKey;
    this.hydrate();
  }

  setSyncHandler(fn: (payload: SyncPayload) => void) {
    this.syncHandler = fn;
  }

  replaceHistory(next: Record<string, DayCounts>) {
    this.history = { ...next };
    this.persist();
    const today = this.history[dateKey(new Date())] ?? {};
    this.games = this.games.map((g) => ({
      ...g,
      count: today[g.id] ?? 0,
      status: (today[g.id] ?? 0) > 0 ? "done" : "todo",
    }));
  }

  replaceNotes(next: Record<string, string>) {
    this.notes = { ...next };
    if (typeof window !== "undefined" && this.NOTES_KEY) {
      window.localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.notes));
    }
  }

  private hydrate() {
    if (typeof window === "undefined") return;
    try {
      // Мигрируем старый формат { date: string[] } → counts=1 за каждый id.
      for (const legacy of this.LEGACY_KEYS) {
        const raw = window.localStorage.getItem(legacy);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            for (const [date, ids] of Object.entries(parsed)) {
              if (!Array.isArray(ids)) continue;
              const bucket: DayCounts = {};
              for (const id of ids as string[]) bucket[id] = 1;
              this.history[date] = bucket;
            }
          }
        } catch {
          /* ignore */
        }
        window.localStorage.removeItem(legacy);
      }

      const raw = window.localStorage.getItem(this.HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, DayCounts>;
        this.history = { ...this.history, ...parsed };
      }
      if (this.NOTES_KEY) {
        const rawNotes = window.localStorage.getItem(this.NOTES_KEY);
        if (rawNotes) this.notes = JSON.parse(rawNotes) as Record<string, string>;
      }
    } catch {
      this.history = {};
    }
    const today = this.history[dateKey(new Date())] ?? {};
    this.games = this.games.map((g) => ({
      ...g,
      count: today[g.id] ?? 0,
      status: (today[g.id] ?? 0) > 0 ? "done" : "todo",
    }));
  }

  private persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
  }

  private countsOn(key: string): number {
    const b = this.history[key];
    if (!b) return 0;
    let s = 0;
    for (const v of Object.values(b)) s += v;
    return s;
  }

  private doneOn(key: string): number {
    const b = this.history[key];
    if (!b) return 0;
    let s = 0;
    for (const v of Object.values(b)) if (v > 0) s++;
    return s;
  }

  private writeToday() {
    const key = dateKey(new Date());
    const bucket: DayCounts = {};
    for (const g of this.games) {
      const c = g.count ?? 0;
      if (c > 0) bucket[g.id] = c;
    }
    if (Object.keys(bucket).length > 0) this.history[key] = bucket;
    else delete this.history[key];
    this.persist();
  }

  getCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.order - b.order);
  }

  getGames(): Game[] {
    return this.games;
  }

  getGamesByCategory(categoryId: string): Game[] {
    return this.games
      .filter((g) => g.categoryId === categoryId)
      .sort((a, b) => a.priority - b.priority);
  }

  /** Основной чекбокс: 0 ⟷ 1 (одна отметка). */
  toggleGame(id: string): Game[] {
    let nextCount = 0;
    this.games = this.games.map((g) => {
      if (g.id !== id) return g;
      nextCount = (g.count ?? 0) > 0 ? 0 : 1;
      return { ...g, count: nextCount, status: nextCount > 0 ? "done" : "todo" };
    });
    this.writeToday();
    this.syncHandler?.({ kind: "mark", gameId: id, date: dateKey(new Date()), count: nextCount });
    return this.games;
  }

  /** Установить конкретное количество отметок (0..MAX_DOTS). */
  setGameCount(id: string, count: number): Game[] {
    const c = Math.max(0, Math.min(MAX_DOTS, Math.round(count)));
    this.games = this.games.map((g) =>
      g.id === id ? { ...g, count: c, status: c > 0 ? "done" : "todo" } : g,
    );
    this.writeToday();
    this.syncHandler?.({ kind: "mark", gameId: id, date: dateKey(new Date()), count: c });
    return this.games;
  }

  /** Отметки игры за текущую неделю (пн..вс). */
  getGameWeek(id: string): boolean[] {
    const now = new Date();
    const monday = shiftKey(dateKey(now), -((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const key = shiftKey(monday, i);
      return (this.history[key]?.[id] ?? 0) > 0;
    });
  }

  getNote(id: string): string {
    return this.notes[id] ?? "";
  }

  setNote(id: string, text: string) {
    const trimmed = text.trim();
    if (trimmed) this.notes[id] = trimmed;
    else delete this.notes[id];
    if (typeof window !== "undefined" && this.NOTES_KEY) {
      window.localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.notes));
    }
    this.syncHandler?.({ kind: "note", gameId: id, note: trimmed });
  }

  getDailyProgress() {
    const total = this.games.length;
    const done = this.games.filter((g) => (g.count ?? 0) > 0).length;
    const totalCount = this.games.reduce((a, g) => a + (g.count ?? 0), 0);
    return {
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
      totalCount,
      maxCount: total * MAX_DOTS,
    };
  }

  getNextSuggested(): Game | undefined {
    return [...this.games]
      .filter((g) => (g.count ?? 0) === 0)
      .sort((a, b) => a.priority - b.priority)[0];
  }

  getDayStats14(): DayStat[] {
    const totalMax = this.games.length * MAX_DOTS;
    const todayKey = dateKey(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const key = shiftKey(todayKey, i - 13);
      return {
        date: key,
        done: this.doneOn(key),
        count: this.countsOn(key),
        total: totalMax,
      };
    });
  }

  /**
   * 6 недель × 7 дней (пн..вс), последняя строка — текущая неделя.
   * Значение ячейки — суммарное число отметок за день (0..games.length*10).
   */
  getHeatmap6w(): number[] {
    const now = new Date();
    const todayKey = dateKey(now);
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 35);
    const mondayKey = dateKey(monday);
    return Array.from({ length: 42 }, (_, i) => {
      const key = shiftKey(mondayKey, i);
      return key > todayKey ? 0 : this.countsOn(key);
    });
  }

  /**
   * Календарь текущего месяца (пн..вс). Пустые ячейки до 1-го числа — null.
   */
  getHeatmapMonth(): {
    label: string;
    cells: ({ date: string; day: number; value: number } | null)[];
  } {
    const now = new Date();
    const todayKey = dateKey(now);
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: ({ date: string; day: number; value: number } | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(new Date(year, month, d));
      cells.push({ date: key, day: d, value: key > todayKey ? 0 : this.countsOn(key) });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const label = first.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
    return { label, cells };
  }


  getHeatmapMax(): number {
    return this.games.length * MAX_DOTS;
  }

  getStreaks() {
    const activeKeys = Object.keys(this.history).filter((k) => this.doneOn(k) > 0);
    const set = new Set(activeKeys);
    const totalGames = activeKeys.reduce((sum, k) => sum + this.countsOn(k), 0);

    let best = 0;
    for (const k of set) {
      if (set.has(shiftKey(k, -1))) continue;
      let len = 1;
      let cursor = shiftKey(k, 1);
      while (set.has(cursor)) {
        len++;
        cursor = shiftKey(cursor, 1);
      }
      best = Math.max(best, len);
    }

    let current = 0;
    let cursor = dateKey(new Date());
    if (!set.has(cursor)) cursor = shiftKey(cursor, -1);
    while (set.has(cursor)) {
      current++;
      cursor = shiftKey(cursor, -1);
    }

    return { current, best, activeDays: set.size, totalGames };
  }

  getWeeklyActive() {
    const todayKey = dateKey(new Date());
    let active = 0;
    for (let i = 0; i < 7; i++) {
      if (this.doneOn(shiftKey(todayKey, -i)) > 0) active++;
    }
    return { active, total: 7 };
  }

  /**
   * Средний уровень отметок по игре за период: сумма count по активным дням
   * делённая на (активные дни × MAX_DOTS). Пока активных дней нет — 0 %.
   */
  getGameCompletionRates(days = 30) {
    const todayKey = dateKey(new Date());
    const activeKeys: string[] = [];
    for (let i = 0; i < days; i++) {
      const key = shiftKey(todayKey, -i);
      if (this.doneOn(key) > 0) activeKeys.push(key);
    }
    const denom = activeKeys.length * MAX_DOTS;
    return [...this.games]
      .sort((a, b) => a.priority - b.priority)
      .map((g) => {
        const sum = activeKeys.reduce((a, k) => a + (this.history[k]?.[g.id] ?? 0), 0);
        return {
          id: g.id,
          title: g.title,
          percent: denom ? Math.round((sum / denom) * 100) : 0,
          total: sum,
        };
      });
  }
}

export const DataService = new DataServiceImpl({
  games: mockGames,
  categories: mockCategories,
  historyKey: "tracker.counts.v2",
  legacyKeys: ["tracker.history.v1", "tracker.gameStatus.v1"],
});

/** Речевые игры (/development-games): те же механики, отдельная история отметок. */
export const SpeechGamesService = new DataServiceImpl({
  games: speechGames,
  categories: speechCategories,
  historyKey: "tracker.speech.counts.v1",
});

/** Игры по Денверской модели (/esdm): отдельная история + заметки родителя. */
export const EsdmService = new DataServiceImpl({
  games: esdmGames,
  categories: esdmCategories,
  historyKey: "tracker.esdm.counts.v1",
  notesKey: "tracker.esdm.notes.v1",
});
