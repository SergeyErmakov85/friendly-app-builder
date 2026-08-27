import { supabase } from "@/integrations/supabase/client";
import { resolveOwnerId } from "./accountLink";
import type { ToyLogEntry } from "./types";

/**
 * ToyLogService — дневник «Игрушки», хранится в Supabase:
 * записи → таблица `toy_entries`, фото → приватный bucket `toy-photos`
 * (структура ключей: `<user_id>/<toyEntryId>/<index>.<ext>`).
 *
 * В интерфейс отдаём фото как signed URL — это data-совместимо с прежним UI,
 * где `entry.photos` подставлялся в `<img src>`.
 *
 * Записи принадлежат общему владельцу связанных учёток (см. `accountLink.ts`),
 * а файлы кладём в папку текущего пользователя — доступ к ней открыт всем
 * учёткам одной «семьи».
 */

const BUCKET = "toy-photos";

async function requireUser(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Требуется вход");
  return id;
}

/** Общий владелец данных: под ним лежат записи всех связанных учёток. */
async function requireOwner(): Promise<string> {
  return resolveOwnerId(await requireUser());
}

async function signPaths(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, 60 * 60);
  if (error || !data) return [];
  return data.map((d) => d.signedUrl).filter((u): u is string => !!u);
}

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

export const ToyLogService = {
  async list(): Promise<ToyLogEntry[]> {
    const ownerId = await requireOwner();
    const { data, error } = await supabase
      .from("toy_entries")
      .select("id,toy_name,description,photo_paths,created_at")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return Promise.all(
      data.map(async (row) => ({
        id: row.id,
        toyName: row.toy_name,
        description: row.description,
        createdAt: row.created_at,
        photos: await signPaths(row.photo_paths ?? []),
      })),
    );
  },

  async add(entry: {
    toyName: string;
    description: string;
    files: File[];
  }): Promise<ToyLogEntry> {
    const userId = await requireUser();
    const ownerId = await resolveOwnerId(userId);
    const entryId = crypto.randomUUID();
    const paths: string[] = [];
    for (let i = 0; i < entry.files.length; i++) {
      const file = entry.files[i];
      const path = `${userId}/${entryId}/${i}.${extFromMime(file.type)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (error) throw error;
      paths.push(path);
    }
    const { data, error } = await supabase
      .from("toy_entries")
      .insert({
        id: entryId,
        user_id: ownerId,
        toy_name: entry.toyName,
        description: entry.description,
        photo_paths: paths,
      })
      .select("id,toy_name,description,photo_paths,created_at")
      .single();
    if (error || !data) throw error ?? new Error("insert failed");
    return {
      id: data.id,
      toyName: data.toy_name,
      description: data.description,
      createdAt: data.created_at,
      photos: await signPaths(data.photo_paths ?? []),
    };
  },

  async remove(id: string): Promise<void> {
    const ownerId = await requireOwner();
    const { data } = await supabase
      .from("toy_entries")
      .select("photo_paths")
      .eq("id", id)
      .eq("user_id", ownerId)
      .maybeSingle();
    if (data?.photo_paths?.length) {
      await supabase.storage.from(BUCKET).remove(data.photo_paths);
    }
    await supabase.from("toy_entries").delete().eq("id", id).eq("user_id", ownerId);
  },
};
