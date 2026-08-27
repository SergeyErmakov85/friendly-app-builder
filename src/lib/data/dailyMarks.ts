import { supabase } from "@/integrations/supabase/client";
import { resolveOwnerId } from "./accountLink";
import { MAX_DOTS } from "./types";

const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type DayCounts = Record<string, number>; // id -> count 0..MAX_DOTS

/**
 * DailyMarksService — лёгкий счётчик «10 кружочков» для страниц, где задания
 * не являются Game (кинезиотерапия, дневник «Игрушки»). История хранится как
 * { "yyyy-mm-dd": { id: count } } в localStorage; при входе в аккаунт отметки
 * дублируются в таблицу `game_marks` (колонка `service` различает разделы)
 * под общим владельцем связанных учёток (см. `accountLink.ts`).
 */
export class DailyMarksService {
  private history: Record<string, DayCounts> = {};

  constructor(
    private readonly storageKey: string,
    private readonly service: string,
  ) {
    this.hydrate();
  }

  private hydrate() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (raw) this.history = JSON.parse(raw) as Record<string, DayCounts>;
    } catch {
      this.history = {};
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.history));
  }

  /** Отметки на сегодня: { id: count }. */
  getToday(): DayCounts {
    return { ...(this.history[dateKey(new Date())] ?? {}) };
  }

  /** Установить количество отметок (0..MAX_DOTS) и вернуть срез «сегодня». */
  setCount(id: string, count: number): DayCounts {
    const c = Math.max(0, Math.min(MAX_DOTS, Math.round(count)));
    const key = dateKey(new Date());
    const bucket = { ...(this.history[key] ?? {}) };
    if (c > 0) bucket[id] = c;
    else delete bucket[id];
    if (Object.keys(bucket).length > 0) this.history[key] = bucket;
    else delete this.history[key];
    this.persist();
    void this.push(id, key, c);
    return { ...bucket };
  }

  private async push(id: string, date: string, count: number) {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;
      const ownerId = await resolveOwnerId(userId);
      if (count === 0) {
        await supabase
          .from("game_marks")
          .delete()
          .eq("user_id", ownerId)
          .eq("service", this.service)
          .eq("game_id", id)
          .eq("date", date);
      } else {
        await supabase
          .from("game_marks")
          .upsert(
            { user_id: ownerId, service: this.service, game_id: id, date, count },
            { onConflict: "user_id,service,game_id,date" },
          );
      }
    } catch (err) {
      console.warn(`[dailyMarks:${this.service}] write failed`, err);
    }
  }

  /** Подтянуть сегодняшние отметки из облака и слить с локальными. */
  async pullToday(): Promise<DayCounts> {
    try {
      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id;
      if (!userId) return this.getToday();
      const ownerId = await resolveOwnerId(userId);
      const key = dateKey(new Date());
      const { data } = await supabase
        .from("game_marks")
        .select("game_id,count")
        .eq("user_id", ownerId)
        .eq("service", this.service)
        .eq("date", key);
      if (data) {
        const bucket = { ...(this.history[key] ?? {}) };
        for (const row of data) if (row.count > 0) bucket[row.game_id] = row.count;
        if (Object.keys(bucket).length > 0) this.history[key] = bucket;
        this.persist();
      }
    } catch (err) {
      console.warn(`[dailyMarks:${this.service}] pull failed`, err);
    }
    return this.getToday();
  }
}

/** Отметки упражнений кинезиотерапии (/kinesiotherapy). */
export const KinesioMarks = new DailyMarksService("tracker.kinesio.counts.v1", "kinesio");

/** Отметки на странице «Игрушки» (/toys): записи + «Творчество» и «Музыка». */
export const ToysMarks = new DailyMarksService("tracker.toys.counts.v1", "toys");
