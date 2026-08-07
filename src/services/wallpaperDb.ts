import { db, auth, collection, doc, setDoc, deleteDoc, getDocs, query, orderBy } from '../lib/firebase';

export interface DbWallpaper {
  id: string;
  name: string;
  fileBlob?: Blob; // Optional for cloud sync
  url?: string;    // URL if available
  type: 'image' | 'video' | 'lively';
  mimeType: string;
  palette: any;
  createdAt: number;
  userId?: string;
}

const DB_NAME = 'ApexOsWallpapersDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_wallpapers';

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('IndexedDB could not be opened'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Syncs wallpaper metadata to Firestore
 */
async function syncToCloud(wallpaper: DbWallpaper): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // We don't save the Blob to Firestore as it's too large.
    // We save everything else.
    const { fileBlob, ...meta } = wallpaper;
    const wallRef = doc(db, 'wallpapers', wallpaper.id);
    await setDoc(wallRef, {
      ...meta,
      userId: user.uid,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.error('Firestore sync error:', err);
  }
}

export async function saveWallpaper(wallpaper: DbWallpaper): Promise<void> {
  // 1. Save to Local IndexedDB (for the actual Blob)
  const dbInst = await initDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = dbInst.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(wallpaper);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  // 2. Sync Metadata to Cloud
  await syncToCloud(wallpaper);
}

export async function getWallpaper(id: string): Promise<DbWallpaper | null> {
  const dbInst = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = dbInst.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllWallpapers(): Promise<DbWallpaper[]> {
  const dbInst = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = dbInst.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      // Sort by newest first
      results.sort((a, b) => b.createdAt - a.createdAt);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteWallpaper(id: string): Promise<void> {
  // 1. Delete from Local
  const dbInst = await initDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = dbInst.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  // 2. Delete from Cloud
  const user = auth.currentUser;
  if (user) {
    try {
      await deleteDoc(doc(db, 'wallpapers', id));
    } catch (err) {
      console.error('Firestore delete error:', err);
    }
  }
}

/**
 * Downloads metadata from cloud and returns IDs that are missing locally.
 * In a more complete implementation, this would handle full sync.
 */
export async function syncFromCloud(): Promise<any[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(collection(db, 'wallpapers'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('Firestore sync from cloud error:', err);
    return [];
  }
}
