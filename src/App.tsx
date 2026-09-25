import React, { useState, useEffect } from 'react';
import type { AppState, AppConfig, MenuItem, OrderItem } from './types/index.ts';
import { realtimeService, initialAppState } from './services/realtime.ts';
import { Header } from './components/Header.tsx';
import { AdminModal } from './components/AdminModal.tsx';
import { OrderHistoryModal } from './components/OrderHistoryModal.tsx';
import { UserOrderSection } from './components/UserOrderSection.tsx';
import { MainDashboard } from './components/MainDashboard.tsx';
import { LiveSummaryTable } from './components/LiveSummaryTable.tsx';
import { FinancialSummary } from './components/FinancialSummary.tsx';
import { Footer } from './components/Footer.tsx';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('أمير');
  const [dashboardEditingUser, setDashboardEditingUser] = useState<string | null>(null);

  // Keep selectedUser valid if users list changes
  useEffect(() => {
    if (!selectedUser && appState.users.length > 0) {
      setSelectedUser(appState.users[0]);
    }
  }, [appState.users, selectedUser]);

  // Subscribe to real-time sync service on mount
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((newState) => {
      setAppState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Admin authentication (hardcoded password '0000')
  const handleAdminLogin = (password: string): boolean => {
    if (password === '0000') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  // State mutations via Realtime Sync
  const handleSaveConfig = (newConfig: Partial<AppConfig>) => {
    realtimeService.updateConfig(newConfig);
  };

  const handleAddUser = (name: string) => {
    realtimeService.addUser(name);
  };

  const handleRenameUser = (oldName: string, newName: string) => {
    realtimeService.renameUser(oldName, newName);
    if (selectedUser === oldName) {
      setSelectedUser(newName);
    }
  };

  const handleDeleteUser = (name: string) => {
    realtimeService.deleteUser(name);
    if (selectedUser === name) {
      const remaining = appState.users.filter((u) => u !== name);
      if (remaining.length > 0) {
        setSelectedUser(remaining[0]);
      }
    }
  };

  const handleSaveMenu = (items: MenuItem[]) => {
    realtimeService.updateMenu(items);
  };

  const handleSaveUserOrder = (userName: string, items: OrderItem[]) => {
    realtimeService.updateUserOrder(userName, items);
  };

  const handleDeleteUserOrder = (userName: string) => {
    realtimeService.updateUserOrder(userName, []);
  };

  const handleClearAllOrders = () => {
    realtimeService.clearAllOrders();
  };

  const handleArchiveOrders = async () => {
    const success = await realtimeService.archiveCurrentOrders();
    if (success) {
      setArchiveSuccessMsg('تم حفظ وترحيل جميع الطلبات بنجاح إلى السجل الدائم!');
      setTimeout(() => setArchiveSuccessMsg(null), 4000);
    } else {
      alert('لا توجد طلبات حالية مسجلة لترحيلها إلى السجل.');
    }
  };

  const handleDeleteHistoryEntry = (id: string) => {
    realtimeService.deleteHistoryEntry(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Alert for Archive Success */}
      {archiveSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-bold border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{archiveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Header with e-Wallet, InstaPay and Settings/Admin Gear */}
      <Header
        config={appState.config}
        isAdmin={isAdmin}
        isFirebase={realtimeService.isUsingFirebase()}
        historyCount={Object.keys(appState.history || {}).length}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onSaveOrders={handleArchiveOrders}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 2. User Selection & Order Entry Form */}
        <UserOrderSection
          users={appState.users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onAddUser={handleAddUser}
          menuItems={appState.menuItems}
          isAdmin={isAdmin}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          orders={appState.orders}
          onSaveUserOrder={handleSaveUserOrder}
          onEditInDashboard={(userName) => {
            setDashboardEditingUser(userName);
            setTimeout(() => {
              const el = document.getElementById(`order-card-${userName}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 60);
          }}
        />

        {/* 3. Main Dashboard: Breakdown for each active user */}
        <MainDashboard
          orders={appState.orders}
          isAdmin={isAdmin}
          onDeleteOrder={handleDeleteUserOrder}
          onRenameUser={handleRenameUser}
          menuItems={appState.menuItems}
          onSaveOrder={handleSaveUserOrder}
          activeEditingUser={dashboardEditingUser}
          setActiveEditingUser={setDashboardEditingUser}
        />

        {/* 4. Live Aggregated Summary Table - Only visible to Admin */}
        {isAdmin && <LiveSummaryTable orders={appState.orders} />}

        {/* 5. Financial Summary: Grand Total for all Names */}
        <FinancialSummary orders={appState.orders} />

      </main>

      {/* 6. Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        config={appState.config}
        onSaveConfig={handleSaveConfig}
        menuItems={appState.menuItems}
        onSaveMenu={handleSaveMenu}
        state={appState}
        onClearAllOrders={handleClearAllOrders}
        onRenameUser={handleRenameUser}
        onDeleteUser={handleDeleteUser}
        onAddUser={handleAddUser}
      />

      {/* 7. Permanent Order History Modal (Admin Only) */}
      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={appState.history}
        onDeleteHistoryEntry={handleDeleteHistoryEntry}
      />

      {/* 8. Footer */}
      <Footer />

    </div>
  );
}
