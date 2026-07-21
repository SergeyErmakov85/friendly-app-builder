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
  /** Сколько раз задание было отмечено сегодня (0..MAX_DOTS). */
  count?: number;
  history: HistoryEntry[];

  // --- Поля ABA-программы (необязательные: старый UI работает без них) ---
  successCriterion?: string; // Критерий успешности
  method?: string; // Метод (NET / DTT / Shaping / ТУЕ / шейпинг / ...)
  reinforcement?: string; // Режим поощрения (FR1 / FR1 → VR3 / ...)
  prompts?: string; // Подсказки
  errorCorrection?: string; // Коррекция ошибки
  steps?: string[]; // Этапы / Шаги
  program?: string; // Источник программы
  inventory?: string; // Инвентарь (подручные средства)
}

export interface Category {
  id: string;
  title: string;
  order: number;
  icon: string;
}

export interface DayStat {
  date: string; // yyyy-mm-dd
  done: number; // сколько игр отмечено хотя бы раз
  count: number; // суммарное число отметок за день
  total: number; // максимум = games.length * MAX_DOTS
}

export const MAX_DOTS = 10;

/** Запись в дневнике «Игрушки»: фото + название игрушки + описание игры. */
export interface ToyLogEntry {
  id: string;
  toyName: string;
  description: string;
  /** Фото в виде data-URL (base64), хранятся в IndexedDB. */
  photos: string[];
  createdAt: string; // ISO
}
