import express, { Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { AppState, MenuItem, OrderHistoryEntry, OrderItem, UserOrder } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.resolve(__dirname, 'server_state.json');

const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

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

let state: AppState = {
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
          id: 'ord-init-1',
          itemType: 'سمكه بلطي كبيره سنجاري',
          count: 2,
          weightText: '',
          price: 260,
          unitPrice: 130,
        },
        {
          id: 'ord-init-2',
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
          id: 'ord-init-3',
          itemType: 'سمك بوري كبيره سنجاري',
          count: 1,
          weightText: '',
          price: 210,
          unitPrice: 210,
        },
      ],
    },
  },
  history: {},
};

// Load saved state from disk if exists
try {
  if (fs.existsSync(STATE_FILE)) {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.config && Array.isArray(parsed.users)) {
      state = parsed;
      console.log('[Server] Loaded persisted state from disk successfully.');
    }
  }
} catch (err) {
  console.warn('[Server] Error reading persisted state file:', err);
}

function saveStateToDisk() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to write state to disk:', err);
  }
}

// Track Server-Sent Events (SSE) connections for mobile & browser instant real-time push
const sseClients = new Set<Response>();

function broadcast(payload: { type: string; data: any }) {
  saveStateToDisk();

  // 1. WebSocket
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });

  // 2. Server-Sent Events (SSE) to all connected phones and browsers
  const sseMessage = `data: ${message}\n\n`;
  sseClients.forEach((res) => {
    try {
      res.write(sseMessage);
    } catch {
      sseClients.delete(res);
    }
  });
}

// Server-Sent Events (SSE) stream endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'INIT_STATE', data: state })}\n\n`);

  sseClients.add(res);

  // Heartbeat every 20 seconds to keep connection alive through mobile network proxies
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(keepAliveInterval);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    sseClients.delete(res);
  });
});

// REST Endpoints for compatibility, immediate fetch and robust mobile updates
app.get('/api/state', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json(state);
});

app.post('/api/config', (req, res) => {
  const { siteTitle, walletNumber, instapayNumber } = req.body;
  if (siteTitle !== undefined) state.config.siteTitle = siteTitle;
  if (walletNumber !== undefined) state.config.walletNumber = walletNumber;
  if (instapayNumber !== undefined) state.config.instapayNumber = instapayNumber;
  
  broadcast({ type: 'CONFIG_UPDATED', data: state.config });
  res.json({ success: true, config: state.config });
});

app.post('/api/users', (req, res) => {
  const { name } = req.body;
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (trimmed && !state.users.includes(trimmed)) {
    state.users.push(trimmed);
    broadcast({ type: 'USERS_UPDATED', data: state.users });
  }
  res.json({ success: true, users: state.users });
});

app.post('/api/users/rename', (req, res) => {
  const { oldName, newName } = req.body;
  const trimmedNew = typeof newName === 'string' ? newName.trim() : '';
  if (trimmedNew && oldName && state.users.includes(oldName)) {
    state.users = state.users.map((u) => (u === oldName ? trimmedNew : u));
    if (state.orders[oldName]) {
      state.orders[trimmedNew] = {
        ...state.orders[oldName],
        userName: trimmedNew,
      };
      delete state.orders[oldName];
    }
    broadcast({ type: 'USERS_UPDATED', data: state.users });
    broadcast({ type: 'INIT_STATE', data: state });
  }
  res.json({ success: true, users: state.users, orders: state.orders });
});

app.post('/api/users/delete', (req, res) => {
  const { name } = req.body;
  if (typeof name === 'string' && name) {
    state.users = state.users.filter((u) => u !== name);
    delete state.orders[name];
    broadcast({ type: 'USERS_UPDATED', data: state.users });
    broadcast({ type: 'INIT_STATE', data: state });
  }
  res.json({ success: true, users: state.users, orders: state.orders });
});

app.post('/api/menu', (req, res) => {
  const { menuItems } = req.body;
  if (Array.isArray(menuItems)) {
    state.menuItems = menuItems;
    broadcast({ type: 'MENU_UPDATED', data: state.menuItems });
  }
  res.json({ success: true, menuItems: state.menuItems });
});

app.post('/api/orders/user', (req, res) => {
  const { userName, items } = req.body;
  if (typeof userName === 'string' && Array.isArray(items)) {
    if (items.length === 0) {
      delete state.orders[userName];
    } else {
      state.orders[userName] = {
        userName,
        items,
        updatedAt: Date.now(),
      };
    }
    broadcast({ type: 'ORDER_UPDATED', data: { userName, order: state.orders[userName] || null } });
  }
  res.json({ success: true, orders: state.orders });
});

app.post('/api/orders/clear-all', (_req, res) => {
  state.orders = {};
  broadcast({ type: 'ALL_ORDERS_CLEARED', data: {} });
  res.json({ success: true, orders: state.orders });
});

app.post('/api/history', (req, res) => {
  const entry: OrderHistoryEntry = req.body;
  if (entry && entry.id) {
    if (!state.history) state.history = {};
    state.history[entry.id] = entry;
    broadcast({ type: 'HISTORY_UPDATED', data: state.history });
  }
  res.json({ success: true, history: state.history });
});

app.post('/api/history/delete', (req, res) => {
  const { id } = req.body;
  if (id && state.history && state.history[id]) {
    delete state.history[id];
    broadcast({ type: 'HISTORY_UPDATED', data: state.history });
  }
  res.json({ success: true, history: state.history });
});

// WebSocket message handling
wss.on('connection', (ws) => {
  // Send initial full state immediately
  ws.send(JSON.stringify({ type: 'INIT_STATE', data: state }));

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());
      switch (msg.type) {
        case 'GET_STATE': {
          ws.send(JSON.stringify({ type: 'INIT_STATE', data: state }));
          break;
        }
        case 'UPDATE_CONFIG': {
          const { siteTitle, walletNumber, instapayNumber } = msg.data || {};
          if (siteTitle !== undefined) state.config.siteTitle = siteTitle;
          if (walletNumber !== undefined) state.config.walletNumber = walletNumber;
          if (instapayNumber !== undefined) state.config.instapayNumber = instapayNumber;
          broadcast({ type: 'CONFIG_UPDATED', data: state.config });
          break;
        }
        case 'ADD_USER': {
          const name = typeof msg.data?.name === 'string' ? msg.data.name.trim() : '';
          if (name && !state.users.includes(name)) {
            state.users.push(name);
            broadcast({ type: 'USERS_UPDATED', data: state.users });
          }
          break;
        }
        case 'RENAME_USER': {
          const { oldName, newName } = msg.data || {};
          if (oldName && newName && state.users.includes(oldName)) {
            state.users = state.users.map((u) => (u === oldName ? newName : u));
            if (state.orders[oldName]) {
              state.orders[newName] = { ...state.orders[oldName], userName: newName };
              delete state.orders[oldName];
            }
            broadcast({ type: 'USERS_UPDATED', data: state.users });
            broadcast({ type: 'INIT_STATE', data: state });
          }
          break;
        }
        case 'DELETE_USER': {
          const { name } = msg.data || {};
          if (name) {
            state.users = state.users.filter((u) => u !== name);
            delete state.orders[name];
            broadcast({ type: 'USERS_UPDATED', data: state.users });
            broadcast({ type: 'INIT_STATE', data: state });
          }
          break;
        }
        case 'UPDATE_MENU': {
          if (Array.isArray(msg.data?.menuItems)) {
            state.menuItems = msg.data.menuItems;
            broadcast({ type: 'MENU_UPDATED', data: state.menuItems });
          }
          break;
        }
        case 'UPDATE_USER_ORDER': {
          const { userName, items } = msg.data || {};
          if (typeof userName === 'string' && Array.isArray(items)) {
            if (items.length === 0) {
              delete state.orders[userName];
            } else {
              state.orders[userName] = {
                userName,
                items,
                updatedAt: Date.now(),
              };
            }
            broadcast({ type: 'ORDER_UPDATED', data: { userName, order: state.orders[userName] || null } });
          }
          break;
        }
        case 'CLEAR_ALL_ORDERS': {
          state.orders = {};
          broadcast({ type: 'ALL_ORDERS_CLEARED', data: {} });
          break;
        }
        case 'SAVE_HISTORY': {
          const entry = msg.data;
          if (entry && entry.id) {
            if (!state.history) state.history = {};
            state.history[entry.id] = entry;
            broadcast({ type: 'HISTORY_UPDATED', data: state.history });
          }
          break;
        }
        case 'DELETE_HISTORY': {
          const { id } = msg.data || {};
          if (id && state.history && state.history[id]) {
            delete state.history[id];
            broadcast({ type: 'HISTORY_UPDATED', data: state.history });
          }
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });
});

// Mount Vite or static server
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

setupServer().catch((err) => {
  console.error('[Server] Startup error:', err);
  process.exit(1);
});
