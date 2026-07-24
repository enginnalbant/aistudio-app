// ========================================================
// CLIENT-SIDE MOCK FIREBASE ENGINE (AUTH & FIRESTORE)
// ========================================================

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: {
    providerId: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  }[];
}

class MockAuth {
  private listeners: Set<(user: User | null) => void> = new Set();
  private _currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('_mock_auth_current');
      if (stored) {
        try {
          this._currentUser = JSON.parse(stored);
        } catch (e) {
          this._currentUser = null;
        }
      } else {
        // Automatically sign in a default mock user for demonstration so that
        // they don't have to sign in manually, or leave it to them.
        // Let's sign in a default mock user if none exists so the app works instantly!
        const defaultUser: User = {
          uid: 'mock_user_default',
          email: 'enginnalbant9@gmail.com',
          displayName: 'Engin Nalbant',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          emailVerified: true,
          isAnonymous: false,
          tenantId: null,
          providerData: [{ providerId: 'google.com', email: 'enginnalbant9@gmail.com' }]
        };
        this._currentUser = defaultUser;
        window.localStorage.setItem('_mock_auth_current', JSON.stringify(defaultUser));
      }
    }
  }

  get currentUser() {
    return this._currentUser;
  }

  setCurrentUser(user: User | null) {
    this._currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.setItem('_mock_auth_current', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('_mock_auth_current');
      }
    }
    this.listeners.forEach(cb => cb(user));
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.add(callback);
    // Fire immediately
    setTimeout(() => callback(this._currentUser), 0);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const auth = new MockAuth();

export class GoogleAuthProvider {
  static credentialFromResult(result: any) {
    return result.credential || null;
  }
  addScope(scope: string) {
    // No-op
  }
}
export const googleProvider = new GoogleAuthProvider();

export const browserPopupRedirectResolver = {};

export function onAuthStateChanged(authInstance: any, callback: (user: User | null) => void) {
  return authInstance.onAuthStateChanged(callback);
}

export async function signInWithPopup(authInstance: any, provider: any, resolver?: any) {
  const user: User = {
    uid: 'google_user_' + Math.random().toString(36).substring(2, 11),
    email: 'enginnalbant9@gmail.com',
    displayName: 'Engin Nalbant',
    photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: [{ providerId: 'google.com', email: 'enginnalbant9@gmail.com' }]
  };
  authInstance.setCurrentUser(user);
  return { 
    user,
    credential: {
      accessToken: 'mock_google_access_token'
    }
  };
}

export async function signOut(authInstance: any) {
  authInstance.setCurrentUser(null);
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, password: string) {
  if (typeof window === 'undefined') throw new Error("Window is undefined");
  const usersRaw = window.localStorage.getItem('_mock_auth_users');
  const users = usersRaw ? JSON.parse(usersRaw) : [];
  const found = users.find((u: any) => u.email === email && u.password === password);
  if (!found) {
    throw new Error("Geçersiz e-posta veya şifre.");
  }
  const user: User = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName || email.split('@')[0],
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: []
  };
  authInstance.setCurrentUser(user);
  return { user };
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, password: string) {
  if (typeof window === 'undefined') throw new Error("Window is undefined");
  const usersRaw = window.localStorage.getItem('_mock_auth_users');
  const users = usersRaw ? JSON.parse(usersRaw) : [];
  const exists = users.some((u: any) => u.email === email);
  if (exists) {
    throw new Error("Bu e-posta adresi zaten kullanımda.");
  }
  const uid = 'mock_user_' + Math.random().toString(36).substring(2, 11);
  const newUser = { uid, email, password, displayName: email.split('@')[0] };
  users.push(newUser);
  window.localStorage.setItem('_mock_auth_users', JSON.stringify(users));

  const user: User = {
    uid,
    email,
    displayName: newUser.displayName,
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: []
  };
  authInstance.setCurrentUser(user);
  return { user };
}

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Mock Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// CLIENT-SIDE MOCK FIRESTORE DATABASE ENGINE
// ==========================================

export const db = { type: 'db' };

function getStorageKey(path: string): string {
  return `_mock_firestore_${path}`;
}

function getCollectionData(path: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getStorageKey(path));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Error reading from mock firestore:', err);
    return [];
  }
}

function saveCollectionData(path: string, data: any[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getStorageKey(path), JSON.stringify(data));
  } catch (err) {
    console.warn('Error writing to mock firestore:', err);
  }
}

function parseDocPath(docPath: string) {
  const parts = docPath.split('/');
  const docId = parts.pop() || '';
  const collPath = parts.join('/');
  return { collPath, docId };
}

export function collection(parent: any, ...pathSegments: string[]) {
  let parts: string[] = [];
  if (parent && parent.path) {
    parts = parent.path.split('/');
  }
  parts.push(...pathSegments);
  const path = parts.filter(Boolean).join('/');
  return { type: 'collection', path };
}

export function doc(parent: any, ...pathSegments: string[]) {
  let parts: string[] = [];
  if (parent && parent.path) {
    parts = parent.path.split('/');
  }
  parts.push(...pathSegments);
  const path = parts.filter(Boolean).join('/');
  return { type: 'doc', path };
}

export async function addDoc(collectionRef: any, data: any) {
  const collPath = collectionRef.path;
  const existing = getCollectionData(collPath);
  
  // Generate random 20-character unique id like Firestore
  const id = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
  const docData = { ...data, id };
  existing.push(docData);
  
  saveCollectionData(collPath, existing);
  notifyListeners(collPath);
  return { id, path: `${collPath}/${id}` };
}

export async function updateDoc(docRef: any, updatedData: any) {
  const { collPath, docId } = parseDocPath(docRef.path);
  const existing = getCollectionData(collPath);
  const index = existing.findIndex((item: any) => item.id === docId);
  if (index !== -1) {
    const resolvedData = { ...updatedData };
    for (const key of Object.keys(resolvedData)) {
      if (resolvedData[key] && resolvedData[key].type === 'increment') {
        resolvedData[key] = (existing[index][key] || 0) + resolvedData[key].value;
      }
    }
    existing[index] = { ...existing[index], ...resolvedData };
    saveCollectionData(collPath, existing);
    notifyListeners(collPath);
  }
}

export async function deleteDoc(docRef: any) {
  const { collPath, docId } = parseDocPath(docRef.path);
  const existing = getCollectionData(collPath);
  const filtered = existing.filter((item: any) => item.id !== docId);
  saveCollectionData(collPath, filtered);
  notifyListeners(collPath);
}

export function query(collectionRef: any, ...constraints: any[]) {
  return {
    type: 'query',
    path: collectionRef.path,
    constraints,
  };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function increment(value: number) {
  return { type: 'increment', value };
}

export async function getDocFromServer(docRef: any) {
  const { collPath, docId } = parseDocPath(docRef.path);
  const existing = getCollectionData(collPath);
  const found = existing.find((item: any) => item.id === docId);
  return {
    exists: () => !!found,
    id: docId,
    data: () => found || null,
  };
}

export async function getDoc(docRef: any) {
  return getDocFromServer(docRef);
}

export function writeBatch(database: any) {
  const operations: (() => void)[] = [];
  return {
    update: (docRef: any, updatedData: any) => {
      operations.push(() => {
        const { collPath, docId } = parseDocPath(docRef.path);
        const existing = getCollectionData(collPath);
        const index = existing.findIndex((item: any) => item.id === docId);
        if (index !== -1) {
          const resolvedData = { ...updatedData };
          for (const key of Object.keys(resolvedData)) {
            if (resolvedData[key] && resolvedData[key].type === 'increment') {
              resolvedData[key] = (existing[index][key] || 0) + resolvedData[key].value;
            }
          }
          existing[index] = { ...existing[index], ...resolvedData };
          saveCollectionData(collPath, existing);
          notifyListeners(collPath);
        }
      });
    },
    delete: (docRef: any) => {
      operations.push(() => {
        const { collPath, docId } = parseDocPath(docRef.path);
        const existing = getCollectionData(collPath);
        const filtered = existing.filter((item: any) => item.id !== docId);
        saveCollectionData(collPath, filtered);
        notifyListeners(collPath);
      });
    },
    commit: async () => {
      operations.forEach(op => op());
    }
  };
}

// Real-time Pub/Sub system
const listeners = new Map<string, Set<() => void>>();

function subscribe(path: string, callback: () => void) {
  if (!listeners.has(path)) {
    listeners.set(path, new Set());
  }
  listeners.get(path)!.add(callback);
  return () => {
    listeners.get(path)?.delete(callback);
    if (listeners.get(path)?.size === 0) {
      listeners.delete(path);
    }
  };
}

function notifyListeners(path: string) {
  if (listeners.has(path)) {
    listeners.get(path)!.forEach(cb => cb());
  }
}

export function onSnapshot(ref: any, onNext: (snapshot: any) => void, onError?: (error: any) => void) {
  const path = ref.path;
  
  const handleUpdate = () => {
    try {
      if (ref.type === 'doc') {
        const { collPath, docId } = parseDocPath(path);
        const data = getCollectionData(collPath);
        const found = data.find((item: any) => item.id === docId);
        onNext({
          exists: () => !!found,
          id: docId,
          data: () => found || null,
        });
      } else {
        const data = getCollectionData(path);
        let sortedData = [...data];
        
        // Handle sorting if orderBy is used
        if (ref.constraints) {
          const orderByConstraint = ref.constraints.find((c: any) => c.type === 'orderBy');
          if (orderByConstraint) {
            const { field, direction } = orderByConstraint;
            sortedData.sort((a: any, b: any) => {
              const valA = a[field];
              const valB = b[field];
              if (valA === undefined || valB === undefined) return 0;
              if (valA < valB) return direction === 'asc' ? -1 : 1;
              if (valA > valB) return direction === 'asc' ? 1 : -1;
              return 0;
            });
          }
        }
        
        onNext({
          docs: sortedData.map((docItem: any) => ({
            id: docItem.id,
            data: () => docItem,
          })),
          forEach: (callback: (doc: any) => void) => {
            sortedData.forEach((docItem: any) => {
              callback({
                id: docItem.id,
                data: () => docItem,
              });
            });
          }
        });
      }
    } catch (err) {
      if (onError) onError(err);
    }
  };

  // Run initial state update asynchronously
  const timer = setTimeout(handleUpdate, 0);

  const listenPath = ref.type === 'doc' ? parseDocPath(path).collPath : path;
  const unsub = subscribe(listenPath, handleUpdate);

  return () => {
    clearTimeout(timer);
    unsub();
  };
}
