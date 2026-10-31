/**
 * Offline outbox foundation. Stable UUIDs make retries identifiable.
 * Not yet wired to the accounting UI or a remote sync adapter.
 */
export type OutboxOperation = 'upsert' | 'archive';
export interface OutboxItem<T = unknown> {
  id: string; module: string; operation: OutboxOperation; recordId: string;
  payload: T; createdAt: string; attempts: number;
}
const DB_NAME = 'aysm-compta-offline';
const STORE = 'outbox';
function openDb(): Promise<IDBDatabase> {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB غير متاح على هذا المتصفح'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('تعذر فتح مخزن العمل دون إنترنت'));
  });
}
export async function enqueueOffline<T>(item: Omit<OutboxItem<T>, 'id' | 'createdAt' | 'attempts'>): Promise<OutboxItem<T>> {
  const db = await openDb();
  const record: OutboxItem<T> = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString(), attempts: 0 };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).add(record);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error('تعذر حفظ العملية محلياً'));
  }); db.close(); return record;
}
export async function listOfflineQueue(): Promise<OutboxItem[]> {
  const db = await openDb();
  const items = await new Promise<OutboxItem[]>((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as OutboxItem[]).sort((a,b) => a.createdAt.localeCompare(b.createdAt)));
    req.onerror = () => reject(req.error || new Error('تعذر قراءة العمليات المعلقة'));
  }); db.close(); return items;
}
export async function removeFromOfflineQueue(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error || new Error('تعذر حذف العملية بعد تأكيد المزامنة'));
  }); db.close();
}
