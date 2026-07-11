import type { Category, DayStat, Game } from "./types";
import { categories as mockCategories, games as mockGames } from "./mock";

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

/**
 * DataService is the single access point for all app data.
 * Currently backed by in-memory mock data + localStorage for completion history.
 * Swapping to Supabase later requires no UI changes.
 *
 * История хранится по дням: { "yyyy-mm-dd": [id выполненных игр] }.
 * Статусы «сегодня» выводятся из записи текущего дня, поэтому каждый новый
 * день чеклист начинается заново, а вся статистика считается из истории.
 */
class DataServiceImpl {
  private games: Game[];
  private history: Record<string, string[]> = {};
  private readonly HISTORY_KEY = "tracker.history.v1";
  private readonly LEGACY_STATUS_KEY = "tracker.gameStatus.v1";

  constructor() {
    this.games = mockGames.map((g) => ({ ...g }));
    this.hydrate();
  }

  private hydrate() {
    if (typeof window === "undefined") return;
    try {
      // Старый формат без дат не переносим — статистика начинается с нуля.
      window.localStorage.removeItem(this.LEGACY_STATUS_KEY);
      const raw = window.localStorage.getItem(this.HISTORY_KEY);
      if (raw) this.history = JSON.parse(raw) as Record<string, string[]>;
    } catch {
      this.history = {};
    }
    const today = new Set(this.history[dateKey(new Date())] ?? []);
    this.games = this.games.map((g) => ({
      ...g,
      status: today.has(g.id) ? "done" : "todo",
    }));
  }

  private persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
  }

  private doneOn(key: string): number {
    return this.history[key]?.length ?? 0;
  }

  getCategories(): Category[] {
    return [...mockCategories].sort((a, b) => a.order - b.order);
  }

  getGames(): Game[] {
    return this.games;
  }

  getGamesByCategory(categoryId: string): Game[] {
    return this.games
      .filter((g) => g.categoryId === categoryId)
      .sort((a, b) => a.priority - b.priority);
  }

  toggleGame(id: string): Game[] {
    this.games = this.games.map((g) =>
      g.id === id ? { ...g, status: g.status === "done" ? "todo" : "done" } : g,
    );
    const key = dateKey(new Date());
    const done = this.games.filter((g) => g.status === "done").map((g) => g.id);
    if (done.length > 0) this.history[key] = done;
    else delete this.history[key];
    this.persist();
    return this.games;
  }

  getDailyProgress() {
    const total = this.games.length;
    const done = this.games.filter((g) => g.status === "done").length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  getNextSuggested(): Game | undefined {
    return [...this.games]
      .filter((g) => g.status === "todo")
      .sort((a, b) => a.priority - b.priority)[0];
  }

  getDayStats14(): DayStat[] {
    const total = this.games.length;
    const todayKey = dateKey(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const key = shiftKey(todayKey, i - 13);
      return { date: key, done: this.doneOn(key), total };
    });
  }

  /**
   * 6 недель × 7 дней (пн..вс), последняя строка — текущая неделя.
   * Значение ячейки — сколько игр выполнено в этот день (0..22).
   */
  getHeatmap6w(): number[] {
    const now = new Date();
    const todayKey = dateKey(now);
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 35);
    const mondayKey = dateKey(monday);
    return Array.from({ length: 42 }, (_, i) => {
      const key = shiftKey(mondayKey, i);
      return key > todayKey ? 0 : this.doneOn(key);
    });
  }

  getStreaks() {
    const activeKeys = Object.keys(this.history).filter((k) => this.history[k].length > 0);
    const set = new Set(activeKeys);
    const totalGames = activeKeys.reduce((sum, k) => sum + this.history[k].length, 0);

    let best = 0;
    for (const k of set) {
      if (set.has(shiftKey(k, -1))) continue; // не начало серии
      let len = 1;
      let cursor = shiftKey(k, 1);
      while (set.has(cursor)) {
        len++;
        cursor = shiftKey(cursor, 1);
      }
      best = Math.max(best, len);
    }

    // Текущая серия: от сегодня (или от вчера, если сегодня пока пусто).
    let current = 0;
    let cursor = dateKey(new Date());
    if (!set.has(cursor)) cursor = shiftKey(cursor, -1);
    while (set.has(cursor)) {
      current++;
      cursor = shiftKey(cursor, -1);
    }

    return { current, best, activeDays: set.size, totalGames };
  }

  /** Активные дни (есть хотя бы одна отметка) за последние 7 дней. */
  getWeeklyActive() {
    const todayKey = dateKey(new Date());
    let active = 0;
    for (let i = 0; i < 7; i++) {
      if (this.doneOn(shiftKey(todayKey, -i)) > 0) active++;
    }
    return { active, total: 7 };
  }

  /**
   * Процент по каждой игре: доля активных дней за период, когда игра
   * была выполнена. Пока активных дней нет — у всех 0%.
   */
  getGameCompletionRates(days = 30) {
    const todayKey = dateKey(new Date());
    const activeKeys: string[] = [];
    for (let i = 0; i < days; i++) {
      const key = shiftKey(todayKey, -i);
      if (this.doneOn(key) > 0) activeKeys.push(key);
    }
    return [...this.games]
      .sort((a, b) => a.priority - b.priority)
      .map((g) => {
        const doneDays = activeKeys.filter((k) => this.history[k].includes(g.id)).length;
        return {
          id: g.id,
          title: g.title,
          percent: activeKeys.length ? Math.round((doneDays / activeKeys.length) * 100) : 0,
        };
      });
  }
}

export const DataService = new DataServiceImpl();
