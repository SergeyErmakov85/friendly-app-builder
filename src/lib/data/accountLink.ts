import { supabase } from "@/integrations/supabase/client";

/**
 * Связанные учётные записи.
 *
 * Несколько учёток можно объединить в одну «семью»: в таблице `account_links`
 * связанная учётка (`member_id`) указывает на общего владельца данных
 * (`owner_id`). Отметки занятий, заметки и записи об игрушках читаются и
 * пишутся под этим общим идентификатором — поэтому все связанные учётки
 * видят и меняют один и тот же набор данных.
 *
 * Файлы в storage остаются в папке текущего пользователя: правила доступа
 * к bucket уже открыты для всех учёток одной «семьи».
 */

/** userId → ownerId; связь меняется редко, лишний запрос не нужен. */
const ownerCache = new Map<string, string>();

export async function resolveOwnerId(userId: string): Promise<string> {
  const cached = ownerCache.get(userId);
  if (cached) return cached;

  let ownerId: string | null = null;

  // Основной путь — та же функция, на которой построены правила доступа в БД.
  const { data: rpcOwner, error: rpcError } = await supabase.rpc("data_owner_id");
  if (!rpcError && typeof rpcOwner === "string") {
    ownerId = rpcOwner;
  } else {
    // Запасной путь — читаем связь напрямую.
    const { data } = await supabase
      .from("account_links")
      .select("owner_id")
      .eq("member_id", userId)
      .maybeSingle();
    if (data?.owner_id) ownerId = data.owner_id;
  }

  // Учётка без связей сама себе владелец.
  const resolved = ownerId ?? userId;
  ownerCache.set(userId, resolved);
  return resolved;
}

export function clearOwnerCache() {
  ownerCache.clear();
}
