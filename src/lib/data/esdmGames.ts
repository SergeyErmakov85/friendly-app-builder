import type { Category, Game } from "./types";

/**
 * «Дневник игровых занятий по Денверской модели (ESDM)» — контент страницы /esdm.
 * Источник: таблица esdm_games_tracker.xlsx. Отметки хранятся отдельно
 * (см. EsdmService в DataService.ts), заметки родителя — в localStorage.
 */

export const esdmCategories: Category[] = [
  { id: "esdm-object", title: "Предметные игры", order: 1, icon: "blocks" },
  { id: "esdm-sensory", title: "Сенсорно-социальные", order: 2, icon: "hand" },
  { id: "esdm-pretend", title: "Сюжетно-ролевые", order: 3, icon: "shapes" },
  { id: "esdm-motor", title: "Двигательные", order: 4, icon: "timer" },
];

export const esdmIntro =
  "Ребёнок: 3,5 года. Отмечайте дни, когда играли, — недельная полоска под каждой игрой заполняется автоматически. В поле «Заметки» фиксируйте успехи ребёнка: взгляд, слово, жест.";

export const esdmDayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type GameSeed = {
  id: string;
  n: number;
  title: string;
  categoryId: string;
  goal: string;
  tip: string;
};

const t = (p: GameSeed): Game => ({
  id: p.id,
  title: p.title,
  description: p.goal,
  ageMin: 3,
  ageMax: 4,
  durationMin: 5,
  goal: p.goal,
  categoryId: p.categoryId,
  tags: [],
  difficulty: "easy",
  priority: p.n,
  icon: "sparkles",
  instruction: "",
  notes: p.tip,
  status: "todo",
  history: [],
  program: "Денверская модель раннего вмешательства (ESDM)",
});

export const esdmGames: Game[] = [
  t({
    id: "e01",
    n: 1,
    title: "Весёлая стройка (кубики)",
    categoryId: "esdm-object",
    goal: "Очерёдность («Мой ход / Твой ход»), зрительный контакт",
    tip: "Держать кубик у лица, ждать взгляда",
  }),
  t({
    id: "e02",
    n: 2,
    title: "Поезд из коробок",
    categoryId: "esdm-object",
    goal: "Просьба о продолжении действия («Ту-ту», жест)",
    tip: "Делать паузы во время катания",
  }),
  t({
    id: "e03",
    n: 3,
    title: "По кочкам, по кочкам",
    categoryId: "esdm-sensory",
    goal: "Инициатива к продолжению, контакт лицом к лицу",
    tip: "Пауза перед финальным «Бух!»",
  }),
  t({
    id: "e04",
    n: 4,
    title: "Прятки с платком («Ку-ку»)",
    categoryId: "esdm-sensory",
    goal: "Разделённая радость, вовлечённость в контакт",
    tip: "Ждать, пока ребёнок сам потянет платок",
  }),
  t({
    id: "e05",
    n: 5,
    title: "Доктор для мишки",
    categoryId: "esdm-pretend",
    goal: "Моторное подражание («сделай как я»), действия по сюжету",
    tip: "Обыгрывать простые эмоции («Мишке больно»)",
  }),
  t({
    id: "e06",
    n: 6,
    title: "Чаепитие для игрушек",
    categoryId: "esdm-pretend",
    goal: "Понимание простых речевых инструкций, воображение",
    tip: "Использовать звукоподражания («Буль-буль», «Ам-ам»)",
  }),
  t({
    id: "e07",
    n: 7,
    title: "«Повторяй за мной» (Прыг-Стоп)",
    categoryId: "esdm-motor",
    goal: "Контроль тела, реакция на речевую команду «Стоп!»",
    tip: "Замирать вместе в смешных позах",
  }),
];
