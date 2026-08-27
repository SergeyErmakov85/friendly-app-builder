import { supabase } from "@/integrations/supabase/client";
import { clearOwnerCache, resolveOwnerId } from "./accountLink";
import { DataService, EsdmService, SpeechGamesService } from "./DataService";
import type { DataServiceImpl } from "./DataService";

/**
 * Cloud sync: связывает три экземпляра DataService с таблицами `game_marks`
 * и `game_notes`. При смене пользователя подгружает историю из БД в память,
 * при каждой отметке — асинхронно апсертит строку в БД.
 *
 * UI остаётся синхронным: локальные изменения применяются моментально,
 * запись в облако идёт в фоне.
 *
 * Строки в БД принадлежат не вошедшему пользователю, а общему владельцу
 * связанных учёток (см. `accountLink.ts`), поэтому объединённые учётки
 * работают с одной историей отметок и заметок.
 */

const SERVICES: Record<string, DataServiceImpl> = {
  core: DataService,
  speech: SpeechGamesService,
  esdm: EsdmService,
};

let currentUserId: string | null = null;
let started = false;

async function pullFor(serviceName: string, svc: DataServiceImpl, ownerId: string) {
  const { data: marks } = await supabase
    .from("game_marks")
    .select("game_id,date,count")
    .eq("user_id", ownerId)
    .eq("service", serviceName);

  const history: Record<string, Record<string, number>> = {};
  for (const row of marks ?? []) {
    const bucket = history[row.date] ?? {};
    if (row.count > 0) bucket[row.game_id] = row.count;
    history[row.date] = bucket;
  }
  svc.replaceHistory(history);

  const { data: notes } = await supabase
    .from("game_notes")
    .select("game_id,note")
    .eq("user_id", ownerId)
    .eq("service", serviceName);
  const noteMap: Record<string, string> = {};
  for (const row of notes ?? []) noteMap[row.game_id] = row.note;
  svc.replaceNotes(noteMap);
}

function wireWrites() {
  for (const [serviceName, svc] of Object.entries(SERVICES)) {
    svc.setSyncHandler(async (payload) => {
      if (!currentUserId) return;
      try {
        const ownerId = await resolveOwnerId(currentUserId);
        if (payload.kind === "mark") {
          if (payload.count === 0) {
            await supabase
              .from("game_marks")
              .delete()
              .eq("user_id", ownerId)
              .eq("service", serviceName)
              .eq("game_id", payload.gameId)
              .eq("date", payload.date);
          } else {
            await supabase.from("game_marks").upsert(
              {
                user_id: ownerId,
                service: serviceName,
                game_id: payload.gameId,
                date: payload.date,
                count: payload.count,
              },
              { onConflict: "user_id,service,game_id,date" },
            );
          }
        } else if (payload.kind === "note") {
          if (!payload.note) {
            await supabase
              .from("game_notes")
              .delete()
              .eq("user_id", ownerId)
              .eq("service", serviceName)
              .eq("game_id", payload.gameId);
          } else {
            await supabase.from("game_notes").upsert(
              {
                user_id: ownerId,
                service: serviceName,
                game_id: payload.gameId,
                note: payload.note,
              },
              { onConflict: "user_id,service,game_id" },
            );
          }
        }
      } catch (err) {
        console.warn("[cloudSync] write failed", err);
      }
    });
  }
}

async function switchUser(userId: string | null) {
  currentUserId = userId;
  if (!userId) {
    clearOwnerCache();
    for (const svc of Object.values(SERVICES)) {
      svc.replaceHistory({});
      svc.replaceNotes({});
    }
    return;
  }
  const ownerId = await resolveOwnerId(userId);
  await Promise.all(
    Object.entries(SERVICES).map(([name, svc]) => pullFor(name, svc, ownerId)),
  );
  window.dispatchEvent(new CustomEvent("tracker:cloud-synced"));
}

export function startCloudSync() {
  if (started) return;
  started = true;
  wireWrites();
  supabase.auth.getSession().then(({ data }) => {
    void switchUser(data.session?.user?.id ?? null);
  });
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
      const newId = session?.user?.id ?? null;
      if (newId !== currentUserId) void switchUser(newId);
    }
  });
}
