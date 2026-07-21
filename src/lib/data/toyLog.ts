import type { ToyLogEntry } from "./types";

/**
 * ToyLogService — дневник «Игрушки» (фото + название игрушки + описание игры).
 *
 * Фото хранятся как base64 data-URL в IndexedDB (не localStorage — там лимит
 * ~5 МБ, фотографий за пару месяцев туда не поместится). Интерфейс асинхронный,
 * чтобы позже можно было подменить реализацию на Supabase Storage без правок UI.
 */

const DB_NAME = "tracker.toyLog.v1";
const STORE = "entries";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB недоступен"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export const ToyLogService = {
  async list(): Promise<ToyLogEntry[]> {
    const all = await withStore<ToyLogEntry[]>("readonly", (s) => s.getAll());
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async add(entry: Omit<ToyLogEntry, "id" | "createdAt">): Promise<ToyLogEntry> {
    const full: ToyLogEntry = {
      ...entry,
      id: `toy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    await withStore("readwrite", (s) => s.add(full));
    return full;
  },

  async remove(id: string): Promise<void> {
    await withStore("readwrite", (s) => s.delete(id));
  },

  /** Читает файлы изображений и возвращает их как data-URL. */
  readPhotos(files: FileList | File[]): Promise<string[]> {
    const list = Array.from(files);
    return Promise.all(
      list.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
  },
};
