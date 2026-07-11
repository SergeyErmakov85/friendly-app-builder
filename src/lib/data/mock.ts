import type { Category, DayStat, Game } from "./types";

export const categories: Category[] = [
  { id: "morning", title: "Утро", order: 1, icon: "sunrise" },
  { id: "day", title: "Днём", order: 2, icon: "sun" },
  { id: "after-walk", title: "После прогулки", order: 3, icon: "trees" },
  { id: "evening", title: "Вечером", order: 4, icon: "moon" },
  { id: "before-sleep", title: "Перед сном", order: 5, icon: "bed" },
];

const g = (
  id: string,
  title: string,
  description: string,
  categoryId: string,
  durationMin: number,
  priority: number,
  status: Game["status"] = "todo",
  tags: string[] = [],
  goal = "Развитие внимания и координации",
): Game => ({
  id,
  title,
  description,
  ageMin: 2,
  ageMax: 4,
  durationMin,
  goal,
  categoryId,
  tags,
  difficulty: "easy",
  priority,
  icon: "sparkles",
  instruction: "Покажите пример и попросите ребёнка повторить. Хвалите за старание.",
  notes: "",
  status,
  history: [],
});

export const games: Game[] = [
  g("m1", "Ладонь–кулак", "Меняем положения руки под счёт.", "morning", 5, 1, "done", ["моторика"]),
  g("m2", "Зарядка «потянулись»", "Растяжка и махи руками, как деревья на ветру.", "morning", 7, 2, "done", ["тело"]),
  g("m3", "Умываемся весело", "Игра-ритуал: шаги умывания под считалку.", "morning", 4, 3, "todo", ["быт"]),
  g("m4", "Пальчиковый счёт", "Считаем до 10, загибая пальцы вместе.", "morning", 6, 4, "todo", ["счёт", "речь"]),

  g("d1", "Сортировка по цвету", "Раскладываем кубики по цветным мискам.", "day", 10, 1, "done", ["логика"]),
  g("d2", "Найди пару", "Ищем одинаковые карточки на столе.", "day", 8, 2, "todo", ["память"]),
  g("d3", "Танец повторюшка", "Повторяем простые движения под музыку.", "day", 6, 3, "todo", ["тело", "музыка"]),
  g("d4", "Мозаика из крышек", "Собираем узор из разноцветных крышек.", "day", 12, 4, "todo", ["моторика"]),

  g("a1", "Прыжки по классикам", "Рисуем мелом и прыгаем по клеткам.", "after-walk", 10, 1, "todo", ["тело"]),
  g("a2", "Кто что услышал?", "Слушаем звуки улицы и называем их.", "after-walk", 5, 2, "done", ["внимание"]),
  g("a3", "Собираем природный клад", "Ищем шишки, листики, камушки.", "after-walk", 15, 3, "todo", ["природа"]),

  g("e1", "Театр теней", "Показываем зверей руками на стене.", "evening", 8, 1, "todo", ["фантазия"]),
  g("e2", "Читаем по картинкам", "Придумываем историю по книжке.", "evening", 12, 2, "todo", ["речь"]),
  g("e3", "Игра «Съедобное—несъедобное»", "Кидаем мячик и отвечаем.", "evening", 6, 3, "done", ["реакция"]),
  g("e4", "Массаж пальчиков", "Считалка + мягкий массаж ладошек.", "evening", 5, 4, "todo", ["моторика", "тело"]),

  g("s1", "Дыхание бабочки", "Медленные глубокие вдохи под сказку.", "before-sleep", 4, 1, "todo", ["покой"]),
  g("s2", "Сказка на ушко", "Тихая история со счастливым концом.", "before-sleep", 10, 2, "todo", ["речь"]),
  g("s3", "Обнимашки-медведи", "Крепкое объятие как большой медведь.", "before-sleep", 3, 3, "todo", ["связь"]),
];

export const dayStats14: DayStat[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  const total = 18 + (i % 3);
  const done = Math.max(0, Math.min(total, Math.round(total * (0.35 + Math.sin(i) * 0.3 + i * 0.02))));
  return { date: d.toISOString().slice(0, 10), done, total };
});

// 6-week heatmap intensity 0..4
export const heatmap6w: number[] = Array.from({ length: 42 }, (_, i) => {
  const seed = Math.sin(i * 1.7) * 0.5 + 0.5;
  return Math.min(4, Math.floor(seed * 5));
});
