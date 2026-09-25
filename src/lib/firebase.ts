import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from 'firebase/auth';
import type { SavedCombination } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (with databaseId specified if provided)
let db: Firestore;
try {
  if (firebaseConfigJson.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch {
  db = getFirestore(app);
}

// Initialize Auth
let auth: Auth;
try {
  auth = getAuth(app);
  signInAnonymously(auth).catch((err) => {
    console.warn('Anonymous auth sign-in notice:', err);
  });
} catch (e) {
  console.warn('Auth init notice:', e);
}

// Device identifier to isolate user lists across sessions
const DEVICE_KEY = 'numberpick_device_id';
const LOCAL_STORAGE_KEY = 'numberpick_saved_combinations_cache';

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_default';
  }
}

// Fallback local cache helpers
function getLocalCache(): SavedCombination[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache(items: SavedCombination[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Save combination to Firestore
 */
export async function saveCombinationToFirestore(
  numbers: number[],
  label?: string
): Promise<SavedCombination> {
  const deviceId = getOrCreateDeviceId();
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const now = Date.now();

  const tempItem: SavedCombination = {
    id: 'local_' + now,
    numbers: sortedNumbers,
    createdAt: now,
    label: label || `조합 #${getLocalCache().length + 1}`,
  };

  try {
    const colRef = collection(db, 'saved_numbers');
    const docRef = await addDoc(colRef, {
      numbers: sortedNumbers,
      createdAt: serverTimestamp(),
      createdMillis: now,
      label: tempItem.label,
      deviceId: deviceId,
    });

    const savedItem: SavedCombination = {
      ...tempItem,
      id: docRef.id,
    };

    // Update local cache
    const current = getLocalCache().filter((c) => c.id !== savedItem.id);
    setLocalCache([savedItem, ...current]);

    return savedItem;
  } catch (err) {
    console.warn('Firestore write fallback to local cache:', err);
    // Even if firestore errors (network/offline), keep local cache updated
    const current = getLocalCache();
    setLocalCache([tempItem, ...current]);
    return tempItem;
  }
}

/**
 * Delete combination from Firestore
 */
export async function deleteCombinationFromFirestore(id: string): Promise<void> {
  // Update local cache immediately
  const filtered = getLocalCache().filter((c) => c.id !== id);
  setLocalCache(filtered);

  if (id.startsWith('local_')) {
    return;
  }

  try {
    const docRef = doc(db, 'saved_numbers', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }
}

/**
 * Realtime subscribe to saved combinations in Firestore
 */
export function subscribeToSavedCombinations(
  callback: (items: SavedCombination[]) => void
): () => void {
  const deviceId = getOrCreateDeviceId();

  // Send local cache first for instant initial render
  const initialCache = getLocalCache();
  if (initialCache.length > 0) {
    callback(initialCache);
  }

  try {
    const colRef = collection(db, 'saved_numbers');
    const q = query(colRef, where('deviceId', '==', deviceId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SavedCombination[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const millis = data.createdMillis || (data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now());
          items.push({
            id: docSnap.id,
            numbers: data.numbers || [],
            createdAt: millis,
            label: data.label || '조합',
          });
        });

        // Sort descending by creation date
        items.sort((a, b) => b.createdAt - a.createdAt);

        // Keep local cache in sync
        setLocalCache(items);
        callback(items);
      },
      (error) => {
        console.warn('Firestore onSnapshot listener fallback:', error);
        callback(getLocalCache());
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Firestore subscription setup error:', e);
    callback(getLocalCache());
    return () => {};
  }
}
