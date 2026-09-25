import type { AppConfig, AppState, MenuItem, OrderItem, UserOrder } from '../types/index.ts';
import {
  isFirebaseConfigured,
  listenToFirebase,
  setFirebaseConfig,
  addFirebaseUser,
  setFirebaseMenu,
  setFirebaseUserOrder,
  clearFirebaseAllOrders,
} from '../firebase.ts';

const STORAGE_KEY = 'seafood_order_system_state';

const defaultMenuItems: MenuItem[] = [
  { id: 'item-1', name: 'سمكه بلطي كبيره سنجاري', pricePerKilo: 130, isShrimp: false, category: 'بلطي' },
  { id: 'item-2', name: 'سمكه بلطي وسط سنجاري', pricePerKilo: 115, isShrimp: false, category: 'بلطي' },
  { id: 'item-3', name: 'سمكه بلطي كبيره رده', pricePerKilo: 130, isShrimp: false, category: 'بلطي' },
  { id: 'item-4', name: 'سمك بوري كبيره سنجاري', pricePerKilo: 210, isShrimp: false, category: 'بوري' },
  { id: 'item-5', name: 'سمك بوري وسط سنجاري', pricePerKilo: 185, isShrimp: false, category: 'بوري' },
  { id: 'item-6', name: 'سمك بوري كبير رده مقفوله', pricePerKilo: 210, isShrimp: false, category: 'بوري' },
  { id: 'item-7', name: 'جمبري طاجن', pricePerKilo: 420, isShrimp: true, category: 'جمبري' },
  { id: 'item-8', name: 'جمبري مشويه', pricePerKilo: 420, isShrimp: true, category: 'جمبري' },
  { id: 'item-9', name: 'جمبري مقلي', pricePerKilo: 420, isShrimp: true, category: 'جمبري' },
  { id: 'item-10', name: 'سمك مكرونه كبير مقلي', pricePerKilo: 170, isShrimp: false, category: 'مكرونة' },
  { id: 'item-11', name: 'سمك مكرونه وسط مقلي', pricePerKilo: 150, isShrimp: false, category: 'مكرونة' },
  { id: 'item-12', name: 'سمك مكاريل كبير سنجاري', pricePerKilo: 160, isShrimp: false, category: 'مكاريل' },
  { id: 'item-13', name: 'سمك مكاريل وسط سنجاري', pricePerKilo: 145, isShrimp: false, category: 'مكاريل' },
];

export const initialAppState: AppState = {
  config: {
    siteTitle: 'مطعم وبحريات الأمير | نظام إدارة الطلبات والفواتير',
    walletNumber: '01023456789',
    instapayNumber: 'amir.seafood@instapay',
  },
  users: ['أمير', 'ماهر', 'كرم', 'ياسر', 'إسلام'],
  menuItems: defaultMenuItems,
  orders: {
    'أمير': {
      userName: 'أمير',
      updatedAt: Date.now(),
      items: [
        {
          id: 'ord-1',
          itemType: 'سمكه بلطي كبيره سنجاري',
          count: 2,
          weightText: '',
          price: 260,
          unitPrice: 130,
        },
        {
          id: 'ord-2',
          itemType: 'جمبري مشويه',
          count: 1,
          weightText: 'نصف كيلو',
          price: 210,
          unitPrice: 420,
        },
      ],
    },
    'ماهر': {
      userName: 'ماهر',
      updatedAt: Date.now(),
      items: [
        {
          id: 'ord-3',
          itemType: 'سمك بوري كبيره سنجاري',
          count: 1,
          weightText: '',
          price: 210,
          unitPrice: 210,
        },
      ],
    },
  },
};

type StateListener = (state: AppState) => void;

class RealtimeSyncService {
  private socket: WebSocket | null = null;
  private listeners: Set<StateListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private currentState: AppState = initialAppState;
  private isConnecting = false;
  private reconnectTimer: any = null;
  private unsubscribeFirebase: (() => void) | null = null;

  constructor() {
    this.loadLocalBackup();
    this.initBroadcastChannel();
    this.initFirebase();
    this.connectWebSocket();
  }

  private initFirebase() {
    if (isFirebaseConfigured) {
      this.unsubscribeFirebase = listenToFirebase(this.currentState, (firebaseState) => {
        this.currentState = firebaseState;
        this.notifyListeners();
        this.syncLocalAcrossTabs();
      });
    }
  }

  private loadLocalBackup() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.config && Array.isArray(parsed.users)) {
          this.currentState = parsed;
        }
      }
    } catch {
      // fallback to initial
    }
  }

  private saveLocalBackup(state: AppState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('seafood_orders_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_STATE' && event.data.state) {
            this.currentState = event.data.state;
            this.notifyListeners();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  }

  public getState(): AppState {
    return this.currentState;
  }

  public isUsingFirebase(): boolean {
    return isFirebaseConfigured;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.saveLocalBackup(this.currentState);
    this.listeners.forEach((fn) => fn(this.currentState));
  }

  private syncLocalAcrossTabs() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SYNC_STATE',
        state: this.currentState,
      });
    }
  }

  private connectWebSocket() {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.send({ type: 'GET_STATE' });
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      this.socket.onerror = () => {
        this.fetchStateFallback();
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectWebSocket();
          }, 3000);
        }
      };
    } catch {
      this.fetchStateFallback();
    }
  }

  private async fetchStateFallback() {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (!isFirebaseConfigured) {
          this.currentState = data;
          this.notifyListeners();
          this.syncLocalAcrossTabs();
        }
      }
    } catch {
      // Continue with current local state
    }
  }

  private handleServerMessage(msg: { type: string; data: any }) {
    if (isFirebaseConfigured) {
      // If Firebase Realtime Database is active, Firebase onValue is the primary authority
      return;
    }

    switch (msg.type) {
      case 'INIT_STATE':
        if (msg.data) {
          this.currentState = msg.data;
          this.notifyListeners();
          this.syncLocalAcrossTabs();
        }
        break;
      case 'CONFIG_UPDATED':
        if (msg.data) {
          this.currentState = { ...this.currentState, config: msg.data };
          this.notifyListeners();
          this.syncLocalAcrossTabs();
        }
        break;
      case 'USERS_UPDATED':
        if (Array.isArray(msg.data)) {
          this.currentState = { ...this.currentState, users: msg.data };
          this.notifyListeners();
          this.syncLocalAcrossTabs();
        }
        break;
      case 'MENU_UPDATED':
        if (Array.isArray(msg.data)) {
          this.currentState = { ...this.currentState, menuItems: msg.data };
          this.notifyListeners();
          this.syncLocalAcrossTabs();
        }
        break;
      case 'ORDER_UPDATED':
        if (msg.data?.userName) {
          const newOrders = { ...this.currentState.orders };
          if (msg.data.order) {
            newOrders[msg.data.userName] = msg.data.order;
          } else {
            delete newOrders[msg.data.userName];
          }
          this.currentState = { ...this.currentState, orders: newOrders };
          this.notifyListeners();
          this.syncLocalAcrossTabs();
        }
        break;
      case 'ALL_ORDERS_CLEARED':
        this.currentState = { ...this.currentState, orders: {} };
        this.notifyListeners();
        this.syncLocalAcrossTabs();
        break;
      default:
        break;
    }
  }

  private send(payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  // Client mutation methods (Syncs to Firebase + WebSocket + Local)
  public async updateConfig(newConfig: Partial<AppConfig>) {
    const updatedConfig = { ...this.currentState.config, ...newConfig };
    this.currentState = { ...this.currentState, config: updatedConfig };
    this.notifyListeners();
    this.syncLocalAcrossTabs();

    if (isFirebaseConfigured) {
      setFirebaseConfig(updatedConfig);
    }

    this.send({ type: 'UPDATE_CONFIG', data: updatedConfig });
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });
    } catch {}
  }

  public async addUser(name: string) {
    const trimmed = name.trim();
    if (!trimmed || this.currentState.users.includes(trimmed)) return;

    const newUsers = [...this.currentState.users, trimmed];
    this.currentState = { ...this.currentState, users: newUsers };
    this.notifyListeners();
    this.syncLocalAcrossTabs();

    if (isFirebaseConfigured) {
      addFirebaseUser(trimmed, this.currentState.users);
    }

    this.send({ type: 'ADD_USER', data: { name: trimmed } });
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
    } catch {}
  }

  public async updateMenu(menuItems: MenuItem[]) {
    this.currentState = { ...this.currentState, menuItems };
    this.notifyListeners();
    this.syncLocalAcrossTabs();

    if (isFirebaseConfigured) {
      setFirebaseMenu(menuItems);
    }

    this.send({ type: 'UPDATE_MENU', data: { menuItems } });
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItems }),
      });
    } catch {}
  }

  public async updateUserOrder(userName: string, items: OrderItem[]) {
    const newOrders = { ...this.currentState.orders };
    if (items.length === 0) {
      delete newOrders[userName];
    } else {
      newOrders[userName] = {
        userName,
        items,
        updatedAt: Date.now(),
      };
    }
    this.currentState = { ...this.currentState, orders: newOrders };
    this.notifyListeners();
    this.syncLocalAcrossTabs();

    if (isFirebaseConfigured) {
      setFirebaseUserOrder(userName, items);
    }

    this.send({ type: 'UPDATE_USER_ORDER', data: { userName, items } });
    try {
      await fetch('/api/orders/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, items }),
      });
    } catch {}
  }

  public async clearAllOrders() {
    this.currentState = { ...this.currentState, orders: {} };
    this.notifyListeners();
    this.syncLocalAcrossTabs();

    if (isFirebaseConfigured) {
      clearFirebaseAllOrders();
    }

    this.send({ type: 'CLEAR_ALL_ORDERS' });
    try {
      await fetch('/api/orders/clear-all', { method: 'POST' });
    } catch {}
  }
}

export const realtimeService = new RealtimeSyncService();
