import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  push,
  remove,
  Database,
} from 'firebase/database';
import type { AppConfig, AppState, MenuItem, OrderItem } from './types/index.ts';

// Firebase Realtime Database Configuration for project: samak-c0399
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC61ENWoTnUwlX81fKIDYBy_cZtp0fDr94",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "samak-c0399.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://samak-c0399-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "samak-c0399",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "samak-c0399.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "911044104014",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:911044104014:web:1a9c2e0303cfcfbb54181f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YBWG9R7JLY",
};

let database: Database | null = null;
let isFirebaseConfigured = false;

// Check if credentials are provided
if (firebaseConfig.apiKey && (firebaseConfig.databaseURL || firebaseConfig.projectId)) {
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

export { database, database as db, isFirebaseConfigured, ref, set, push, onValue, remove };

// --- 1. إرسال الطلبات إلى Firebase (لا تحفظها محلياً فقط) ---
export function saveOrderToFirebase(
  userName: string,
  itemType: string,
  itemCount: number,
  itemQuantity: string,
  itemPrice: number
) {
  if (!database) {
    console.warn('[Firebase] Database not initialized');
    return;
  }
  const ordersRef = ref(database, 'orders');
  const newOrderRef = push(ordersRef);

  set(newOrderRef, {
    name: userName,
    type: itemType,
    count: itemCount,
    quantity: itemQuantity,
    price: itemPrice,
    timestamp: Date.now(),
  })
    .then(() => {
      console.log('تم إرسال الطلب بنجاح إلى Firebase!');
    })
    .catch((error) => {
      console.error('حدث خطأ أثناء الحفظ:', error);
    });
}

// --- 3. دالة الحذف الفوري (Instant Delete) ---
export function deleteOrder(orderId: string) {
  if (!database) return;
  const orderToDeleteRef = ref(database, `orders/${orderId}`);
  remove(orderToDeleteRef)
    .then(() => console.log('تم الحذف بنجاح من قاعدة البيانات'))
    .catch((error) => console.error('خطأ في الحذف:', error));
}

if (typeof window !== 'undefined') {
  (window as any).deleteOrder = deleteOrder;
  (window as any).saveOrderToFirebase = saveOrderToFirebase;
}

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
          history: data.history || defaultState.history || {},
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

export async function setFirebaseUsers(users: string[]) {
  if (!database) return;
  try {
    const usersRef = ref(database, `${DB_ROOT}/users`);
    await set(usersRef, users);
  } catch (err) {
    console.error('[Firebase] Error setting users:', err);
  }
}

export async function deleteFirebaseUser(name: string, updatedUsers: string[]) {
  if (!database) return;
  try {
    const usersRef = ref(database, `${DB_ROOT}/users`);
    await set(usersRef, updatedUsers);
    const orderRef = ref(database, `${DB_ROOT}/orders/${name}`);
    await set(orderRef, null);
  } catch (err) {
    console.error('[Firebase] Error deleting user:', err);
  }
}

export async function renameFirebaseUser(oldName: string, newName: string, updatedUsers: string[], existingOrderItems?: OrderItem[]) {
  if (!database) return;
  try {
    const usersRef = ref(database, `${DB_ROOT}/users`);
    await set(usersRef, updatedUsers);

    if (existingOrderItems && existingOrderItems.length > 0) {
      const oldOrderRef = ref(database, `${DB_ROOT}/orders/${oldName}`);
      await set(oldOrderRef, null);
      const newOrderRef = ref(database, `${DB_ROOT}/orders/${newName}`);
      await set(newOrderRef, {
        userName: newName,
        items: existingOrderItems,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    console.error('[Firebase] Error renaming user:', err);
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

export async function addFirebaseOrderHistory(entry: any) {
  if (!database) return;
  try {
    const historyRef = ref(database, `${DB_ROOT}/history/${entry.id}`);
    await set(historyRef, entry);
  } catch (err) {
    console.error('[Firebase] Error saving order history to Firebase:', err);
  }
}

export async function deleteFirebaseOrderHistory(id: string) {
  if (!database) return;
  try {
    const historyItemRef = ref(database, `${DB_ROOT}/history/${id}`);
    await set(historyItemRef, null);
  } catch (err) {
    console.error('[Firebase] Error deleting order history item:', err);
  }
}
