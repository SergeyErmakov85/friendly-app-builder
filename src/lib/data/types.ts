export type GameStatus = "todo" | "done";
export type Difficulty = "easy" | "medium" | "hard";

export interface HistoryEntry {
  date: string; // ISO date
  durationMin: number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  ageMin: number;
  ageMax: number;
  durationMin: number;
  goal: string;
  categoryId: string;
  tags: string[];
  difficulty: Difficulty;
  priority: number;
  icon: string;
  instruction: string;
  notes: string;
  status: GameStatus;
  history: HistoryEntry[];
}

export interface Category {
  id: string;
  title: string;
  order: number;
  icon: string;
}

export interface DayStat {
  date: string; // yyyy-mm-dd
  done: number;
  total: number;
}
