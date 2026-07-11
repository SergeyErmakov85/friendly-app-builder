import type { Category, DayStat, Game } from "./types";
import { categories as mockCategories, dayStats14, games as mockGames, heatmap6w } from "./mock";

/**
 * DataService is the single access point for all app data.
 * Currently backed by in-memory mock data + localStorage for game status.
 * Swapping to Supabase later requires no UI changes.
 */
class DataServiceImpl {
  private games: Game[];
  private readonly STORAGE_KEY = "tracker.gameStatus.v1";

  constructor() {
    this.games = mockGames.map((g) => ({ ...g }));
    this.hydrate();
  }

  private hydrate() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const map = JSON.parse(raw) as Record<string, Game["status"]>;
      this.games = this.games.map((g) => (map[g.id] ? { ...g, status: map[g.id] } : g));
    } catch {
      // ignore
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    const map: Record<string, Game["status"]> = {};
    for (const g of this.games) map[g.id] = g.status;
    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(map));
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
    return dayStats14;
  }

  getHeatmap6w(): number[] {
    return heatmap6w;
  }

  getStreaks() {
    // mock streak values
    return { current: 4, best: 12, activeDays: 27, totalGames: 156 };
  }
}

export const DataService = new DataServiceImpl();
