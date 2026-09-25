export interface OrderItem {
  id: string;
  itemType: string;
  count: number;
  weightText: string; // for shrimp (e.g. ربع كيلو, نصف كيلو, كيلو)
  price: number; // total price for this row
  unitPrice: number; // base price set by admin
}

export interface UserOrder {
  userName: string;
  items: OrderItem[];
  updatedAt: number;
}

export interface MenuItem {
  id: string;
  name: string;
  pricePerKilo: number; // price per kilo / unit
  isShrimp: boolean;
  category: string;
}

export interface AppConfig {
  siteTitle: string;
  walletNumber: string;
  instapayNumber: string;
}

export interface OrderHistoryEntry {
  id: string;
  timestamp: number;
  dateStr: string; // e.g. "الجمعة 25 سبتمبر 2026 - 03:30 م"
  dayName: string; // e.g. "الجمعة"
  totalPrice: number;
  totalUsersCount: number;
  orders: Record<string, UserOrder>;
}

export interface AppState {
  config: AppConfig;
  users: string[];
  menuItems: MenuItem[];
  orders: Record<string, UserOrder>; // keyed by userName
  history?: Record<string, OrderHistoryEntry>; // permanent archived orders
}
