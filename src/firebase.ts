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
import type { AppConfig, AppState, MenuItem, OrderItem, UserOrder } from './types/index.ts';

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
const DB_BASE_URL = (
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  'https://samak-c0399-default-rtdb.firebaseio.com'
).replace(/\/$/, '');

async function firebaseRestPut(subPath: string, payload: any): Promise<void> {
  try {
    await fetch(`${DB_BASE_URL}/${DB_ROOT}/${subPath}.json`, {
      method: payload === null ? 'DELETE' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload === null ? undefined : JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[Firebase REST] Write fallback warning:', err);
  }
}

export function normalizeFirebaseData(data: any, defaultState: AppState): AppState {
  const rawOrders = data?.orders || {};
  const normalizedOrders: Record<string, UserOrder> = {};
  if (rawOrders && typeof rawOrders === 'object') {
    Object.entries(rawOrders).forEach(([userKey, orderVal]: [string, any]) => {
      if (orderVal && typeof orderVal === 'object') {
        const rawItems = orderVal.items;
        let itemsArray: OrderItem[] = [];
        if (Array.isArray(rawItems)) {
          itemsArray = rawItems.filter(Boolean);
        } else if (rawItems && typeof rawItems === 'object') {
          itemsArray = Object.values(rawItems).filter(
            (it: any) => it && typeof it === 'object' && (it.itemType || it.name)
          ) as OrderItem[];
        }

        if (itemsArray.length > 0) {
          normalizedOrders[userKey] = {
            ...orderVal,
            userName: orderVal.userName || userKey,
            updatedAt: orderVal.updatedAt || Date.now(),
            items: itemsArray,
          };
        }
      }
    });
  }

  return {
    config: data?.config || defaultState.config,
    users: Array.isArray(data?.users)
      ? data.users.filter(Boolean)
      : data?.users && typeof data.users === 'object'
      ? (Object.values(data.users).filter(Boolean) as string[])
      : defaultState.users,
    menuItems: Array.isArray(data?.menuItems)
      ? data.menuItems.filter(Boolean)
      : data?.menuItems && typeof data.menuItems === 'object'
      ? (Object.values(data.menuItems).filter(Boolean) as MenuItem[])
      : defaultState.menuItems,
    orders: normalizedOrders,
    history: data?.history || {},
  };
}

export async function fetchFirebaseStateRest(defaultState: AppState): Promise<AppState | null> {
  try {
    const res = await fetch(`${DB_BASE_URL}/${DB_ROOT}.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return normalizeFirebaseData(data, defaultState);
      }
    }
  } catch (err) {
    console.warn('[Firebase REST] Fetch error:', err);
  }
  return null;
}

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
        const normalizedState = normalizeFirebaseData(data, defaultState);
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
  try {
    if (database) {
      const configRef = ref(database, `${DB_ROOT}/config`);
      const snap = await get(configRef);
      const existing = snap.val() || {};
      const merged = { ...existing, ...config };
      await Promise.all([set(configRef, merged), firebaseRestPut('config', merged)]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error updating config:', err);
  }
  await firebaseRestPut('config', config);
}

export async function addFirebaseUser(name: string, updatedUsers: string[]) {
  const trimmed = name.trim();
  if (!trimmed) return;
  try {
    if (database) {
      const usersRef = ref(database, `${DB_ROOT}/users`);
      const snap = await get(usersRef);
      const existingRaw = snap.val();
      const existingList: string[] = Array.isArray(existingRaw)
        ? existingRaw.filter(Boolean)
        : existingRaw && typeof existingRaw === 'object'
        ? (Object.values(existingRaw).filter(Boolean) as string[])
        : [];
      const merged = Array.from(new Set([...existingList, ...updatedUsers, trimmed]));
      await Promise.all([set(usersRef, merged), firebaseRestPut('users', merged)]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error adding user:', err);
  }
  const merged = Array.from(new Set([...updatedUsers, trimmed]));
  await firebaseRestPut('users', merged);
}

export async function setFirebaseUsers(users: string[]) {
  try {
    if (database) {
      const usersRef = ref(database, `${DB_ROOT}/users`);
      await Promise.all([set(usersRef, users), firebaseRestPut('users', users)]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error setting users:', err);
  }
  await firebaseRestPut('users', users);
}

export async function deleteFirebaseUser(name: string, updatedUsers: string[]) {
  try {
    if (database) {
      const usersRef = ref(database, `${DB_ROOT}/users`);
      const orderRef = ref(database, `${DB_ROOT}/orders/${name}`);
      await Promise.all([
        set(usersRef, updatedUsers),
        set(orderRef, null),
        firebaseRestPut('users', updatedUsers),
        firebaseRestPut(`orders/${encodeURIComponent(name)}`, null),
      ]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error deleting user:', err);
  }
  await Promise.all([
    firebaseRestPut('users', updatedUsers),
    firebaseRestPut(`orders/${encodeURIComponent(name)}`, null),
  ]);
}

export async function renameFirebaseUser(
  oldName: string,
  newName: string,
  updatedUsers: string[],
  existingOrderItems?: OrderItem[]
) {
  const newOrderPayload =
    existingOrderItems && existingOrderItems.length > 0
      ? {
          userName: newName,
          items: existingOrderItems,
          updatedAt: Date.now(),
        }
      : null;

  try {
    if (database) {
      const usersRef = ref(database, `${DB_ROOT}/users`);
      await Promise.all([set(usersRef, updatedUsers), firebaseRestPut('users', updatedUsers)]);

      if (newOrderPayload) {
        const oldOrderRef = ref(database, `${DB_ROOT}/orders/${oldName}`);
        const newOrderRef = ref(database, `${DB_ROOT}/orders/${newName}`);
        await Promise.all([
          set(oldOrderRef, null),
          set(newOrderRef, newOrderPayload),
          firebaseRestPut(`orders/${encodeURIComponent(oldName)}`, null),
          firebaseRestPut(`orders/${encodeURIComponent(newName)}`, newOrderPayload),
        ]);
      }
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error renaming user:', err);
  }
  await firebaseRestPut('users', updatedUsers);
  if (newOrderPayload) {
    await Promise.all([
      firebaseRestPut(`orders/${encodeURIComponent(oldName)}`, null),
      firebaseRestPut(`orders/${encodeURIComponent(newName)}`, newOrderPayload),
    ]);
  }
}

export async function setFirebaseMenu(menuItems: MenuItem[]) {
  try {
    if (database) {
      const menuRef = ref(database, `${DB_ROOT}/menuItems`);
      await Promise.all([set(menuRef, menuItems), firebaseRestPut('menuItems', menuItems)]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error updating menu:', err);
  }
  await firebaseRestPut('menuItems', menuItems);
}

export async function setFirebaseUserOrder(userName: string, items: OrderItem[]) {
  const encodedUser = encodeURIComponent(userName);
  const payload =
    items.length === 0
      ? null
      : {
          userName,
          items,
          updatedAt: Date.now(),
        };

  try {
    if (database) {
      const orderRef = ref(database, `${DB_ROOT}/orders/${userName}`);
      await Promise.all([
        set(orderRef, payload),
        firebaseRestPut(`orders/${encodedUser}`, payload),
      ]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error updating user order:', err);
  }
  await firebaseRestPut(`orders/${encodedUser}`, payload);
}

export async function clearFirebaseAllOrders() {
  try {
    if (database) {
      const ordersRef = ref(database, `${DB_ROOT}/orders`);
      await Promise.all([set(ordersRef, null), firebaseRestPut('orders', null)]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error clearing all orders:', err);
  }
  await firebaseRestPut('orders', null);
}

export async function addFirebaseOrderHistory(entry: any) {
  const encodedId = encodeURIComponent(entry.id);
  try {
    if (database) {
      const historyRef = ref(database, `${DB_ROOT}/history/${entry.id}`);
      await Promise.all([
        set(historyRef, entry),
        firebaseRestPut(`history/${encodedId}`, entry),
      ]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error saving order history to Firebase:', err);
  }
  await firebaseRestPut(`history/${encodedId}`, entry);
}

export async function deleteFirebaseOrderHistory(id: string) {
  const encodedId = encodeURIComponent(id);
  try {
    if (database) {
      const historyItemRef = ref(database, `${DB_ROOT}/history/${id}`);
      await Promise.all([
        set(historyItemRef, null),
        firebaseRestPut(`history/${encodedId}`, null),
      ]);
      return;
    }
  } catch (err) {
    console.error('[Firebase] Error deleting order history item:', err);
  }
  await firebaseRestPut(`history/${encodedId}`, null);
}
