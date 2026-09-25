import React, { useState, useEffect } from 'react';
import type { AppState, AppConfig, MenuItem, OrderItem } from './types/index.ts';
import { realtimeService, initialAppState } from './services/realtime.ts';
import { Header } from './components/Header.tsx';
import { AdminModal } from './components/AdminModal.tsx';
import { UserOrderSection } from './components/UserOrderSection.tsx';
import { MainDashboard } from './components/MainDashboard.tsx';
import { LiveSummaryTable } from './components/LiveSummaryTable.tsx';
import { FinancialSummary } from './components/FinancialSummary.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('أمير');

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with e-Wallet, InstaPay and Settings/Admin Gear */}
      <Header
        config={appState.config}
        isAdmin={isAdmin}
        isFirebase={realtimeService.isUsingFirebase()}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
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
        />

        {/* 3. Main Dashboard: Breakdown for each active user */}
        <MainDashboard
          orders={appState.orders}
          onEditUser={(userName) => {
            setSelectedUser(userName);
            const orderFormElement = document.getElementById('order-form-section');
            if (orderFormElement) {
              orderFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onDeleteOrder={handleDeleteUserOrder}
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
      />

      {/* 7. Footer */}
      <Footer />

    </div>
  );
}
