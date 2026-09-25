import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  Database,
} from 'firebase/database';
import type { AppConfig, AppState, MenuItem, OrderItem } from './types/index.ts';

// Read config from Vite environment variables (protecting credentials from git)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let database: Database | null = null;
let isFirebaseConfigured = false;

// Check if credentials are provided
if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    database = getDatabase(app);
    isFirebaseConfigured = true;
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to local sync:', err);
  }
} else {
  console.info('[Firebase] Config keys not detected in environment, using WebSocket/local sync.');
}

export { database, isFirebaseConfigured };

const DB_ROOT = 'seafood_system';

export function listenToFirebase(
  defaultState: AppState,
  onUpdate: (state: AppState) => void
): () => void {
  if (!database || !isFirebaseConfigured) {
    return () => {};
  }

  const rootRef = ref(database, DB_ROOT);

  // Subscribe in real-time to changes
  const unsubscribe = onValue(
    rootRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // First-time database initialization with default values
        set(rootRef, defaultState).catch((err) => {
          console.warn('[Firebase] Initial seed write error:', err);
        });
        onUpdate(defaultState);
      } else {
        // Normalize data to ensure robust structures
        const normalizedState: AppState = {
          config: data.config || defaultState.config,
          users: Array.isArray(data.users) ? data.users : (data.users ? Object.values(data.users) : defaultState.users),
          menuItems: Array.isArray(data.menuItems)
            ? data.menuItems
            : (data.menuItems ? Object.values(data.menuItems) : defaultState.menuItems),
          orders: data.orders || {},
        };
        onUpdate(normalizedState);
      }
    },
    (error) => {
      console.warn('[Firebase] onValue subscription error:', error.message);
    }
  );

  return unsubscribe;
}

export async function setFirebaseConfig(config: Partial<AppConfig>) {
  if (!database) return;
  try {
    const configRef = ref(database, `${DB_ROOT}/config`);
    const snap = await get(configRef);
    const existing = snap.val() || {};
    await set(configRef, { ...existing, ...config });
  } catch (err) {
    console.error('[Firebase] Error updating config:', err);
  }
}

export async function addFirebaseUser(name: string, currentUsers: string[]) {
  if (!database) return;
  const trimmed = name.trim();
  if (!trimmed || currentUsers.includes(trimmed)) return;
  try {
    const usersRef = ref(database, `${DB_ROOT}/users`);
    await set(usersRef, [...currentUsers, trimmed]);
  } catch (err) {
    console.error('[Firebase] Error adding user:', err);
  }
}

export async function setFirebaseMenu(menuItems: MenuItem[]) {
  if (!database) return;
  try {
    const menuRef = ref(database, `${DB_ROOT}/menuItems`);
    await set(menuRef, menuItems);
  } catch (err) {
    console.error('[Firebase] Error updating menu:', err);
  }
}

export async function setFirebaseUserOrder(userName: string, items: OrderItem[]) {
  if (!database) return;
  try {
    const orderRef = ref(database, `${DB_ROOT}/orders/${userName}`);
    if (items.length === 0) {
      await set(orderRef, null);
    } else {
      await set(orderRef, {
        userName,
        items,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    console.error('[Firebase] Error updating user order:', err);
  }
}

export async function clearFirebaseAllOrders() {
  if (!database) return;
  try {
    const ordersRef = ref(database, `${DB_ROOT}/orders`);
    await set(ordersRef, null);
  } catch (err) {
    console.error('[Firebase] Error clearing all orders:', err);
  }
}
