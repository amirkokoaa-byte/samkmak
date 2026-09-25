import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Plus,
  Trash2,
  Save,
  Check,
  User,
  ShoppingBag,
  Sparkles,
  Info,
  Lock,
  ChevronDown,
} from 'lucide-react';
import type { MenuItem, OrderItem, UserOrder } from '../types/index.ts';

interface UserOrderSectionProps {
  users: string[];
  selectedUser?: string;
  onSelectUser?: (name: string) => void;
  onAddUser: (name: string) => void;
  menuItems: MenuItem[];
  isAdmin: boolean;
  onOpenAdmin: () => void;
  orders: Record<string, UserOrder>;
  onSaveUserOrder: (userName: string, items: OrderItem[]) => void;
}

export const UserOrderSection: React.FC<UserOrderSectionProps> = ({
  users,
  selectedUser: controlledSelectedUser,
  onSelectUser,
  onAddUser,
  menuItems,
  isAdmin,
  onOpenAdmin,
  orders,
  onSaveUserOrder,
}) => {
  const [internalSelectedUser, setInternalSelectedUser] = useState<string>(() => users[0] || 'أمير');
  const selectedUser = controlledSelectedUser !== undefined ? controlledSelectedUser : internalSelectedUser;

  const handleSelectUser = (name: string) => {
    if (onSelectUser) {
      onSelectUser(name);
    } else {
      setInternalSelectedUser(name);
    }
  };

  const [isAddNameModalOpen, setIsAddNameModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep selectedUser valid if users list changes
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      handleSelectUser(users[0]);
    } else if (selectedUser && !users.includes(selectedUser) && users.length > 0) {
      handleSelectUser(users[0]);
    }
  }, [users, selectedUser]);

  // When selectedUser changes, load their existing order or create one empty row
  useEffect(() => {
    if (selectedUser) {
      const existing = orders[selectedUser];
      if (existing && existing.items && existing.items.length > 0) {
        setCurrentItems(JSON.parse(JSON.stringify(existing.items)));
      } else {
        // start with 1 fresh default item row
        const defaultMenuItem = menuItems[0] || {
          name: 'سمكه بلطي كبيره سنجاري',
          pricePerKilo: 130,
        };
        setCurrentItems([
          {
            id: `item-${Date.now()}-0`,
            itemType: defaultMenuItem.name,
            count: 1,
            weightText: '',
            price: defaultMenuItem.pricePerKilo,
            unitPrice: defaultMenuItem.pricePerKilo,
          },
        ]);
      }
    } else {
      setCurrentItems([]);
    }
  }, [selectedUser, orders, menuItems]);

  const handleCreateNewName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUserName.trim();
    if (trimmed) {
      onAddUser(trimmed);
      handleSelectUser(trimmed);
      setNewUserName('');
      setIsAddNameModalOpen(false);
    }
  };

  const handleAddItemRow = () => {
    const defaultMenuItem = menuItems[0] || {
      name: 'سمكه بلطي كبيره سنجاري',
      pricePerKilo: 130,
    };
    setCurrentItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${prev.length}`,
        itemType: defaultMenuItem.name,
        count: 1,
        weightText: '',
        price: defaultMenuItem.pricePerKilo,
        unitPrice: defaultMenuItem.pricePerKilo,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setCurrentItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateRowPrice = (itemType: string, count: number, weightText: string, currentPrice?: number): number => {
    const menuItem = menuItems.find((m) => m.name === itemType);
    const basePrice = menuItem ? menuItem.pricePerKilo : 100;
    const isShrimp = itemType.includes('جمبري');

    if (!isShrimp) {
      return basePrice * count;
    }

    // For shrimp, check weightText if it contains hints
    const w = weightText.trim();
    if (w.includes('ربع') || w.includes('250')) {
      return Math.round((basePrice * 0.25) * count);
    }
    if (w.includes('نصف') || w.includes('500') || w.includes('نص')) {
      return Math.round((basePrice * 0.5) * count);
    }
    if (w.includes('كيلو') && !w.includes('نصف') && !w.includes('ربع')) {
      return basePrice * count;
    }

    // Default shrimp fallback
    return basePrice * count;
  };

  const handleItemTypeChange = (index: number, newType: string) => {
    const menuItem = menuItems.find((m) => m.name === newType);
    const baseUnitPrice = menuItem ? menuItem.pricePerKilo : 100;
    const isShrimp = newType.includes('جمبري');

    setCurrentItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const newWeight = isShrimp ? (row.weightText || 'نصف كيلو') : '';
        const calculated = calculateRowPrice(newType, row.count, newWeight);
        return {
          ...row,
          itemType: newType,
          weightText: newWeight,
          unitPrice: baseUnitPrice,
          price: calculated,
        };
      })
    );
  };

  const handleCountChange = (index: number, countNum: number) => {
    setCurrentItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const newPrice = calculateRowPrice(row.itemType, countNum, row.weightText, row.price);
        return {
          ...row,
          count: countNum,
          price: newPrice,
        };
      })
    );
  };

  const handleWeightChange = (index: number, weight: string) => {
    setCurrentItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const newPrice = calculateRowPrice(row.itemType, row.count, weight, row.price);
        return {
          ...row,
          weightText: weight,
          price: newPrice,
        };
      })
    );
  };

  const handleAdminPriceOverride = (index: number, price: number) => {
    setCurrentItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, price: Math.max(0, price) } : row))
    );
  };

  const handleSaveOrder = () => {
    if (!selectedUser) return;
    onSaveUserOrder(selectedUser, currentItems);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const userTotal = currentItems.reduce((acc, row) => acc + (Number(row.price) || 0), 0);

  return (
    <section id="order-form-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-6 shadow-xl mb-8">
      {/* 1. Name Selection Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/60 flex items-center justify-center text-blue-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>اختيار العميل / الاسم (Name Dropdown)</span>
            </h2>
            <p className="text-xs text-slate-400">
              اختر اسم العميل أو أضف اسماً جديداً لتسجيل الأصناف في الفاتورة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Name Dropdown */}
          <div className="relative min-w-[180px] sm:min-w-[220px] flex-1 sm:flex-initial">
            <select
              value={selectedUser}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer pl-9"
            >
              {users.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={() => setIsAddNameModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow shrink-0"
            title="إضافة اسم جديد إلى القائمة"
          >
            <Plus className="w-4 h-4" />
            <span>أضف</span>
          </button>
        </div>
      </div>

      {/* 2. Order Form (Visible after selecting a name) */}
      {selectedUser ? (
        <div className="pt-4 sm:pt-5 space-y-4 animate-in fade-in duration-150">
          
          {/* Section Sub-Header with Admin Add Item button at top left */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                تسجيل وتعديل أصناف الطلب للعميل:{' '}
                <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-4">
                  {selectedUser}
                </span>
              </span>
            </div>

            {/* Admin Add Item (إضافة صنف) at top left of this section */}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  title="إضافة صنف وتحديد سعره كمسؤول"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>إضافة صنف جديد (Admin)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  title="تسجيل الدخول للمشرف لإضافة صنف جديد"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>إضافة صنف (مشرف)</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Table / List - Compact for mobile with NO horizontal scroll */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="overflow-hidden sm:overflow-x-auto">
              <table className="w-full text-right text-xs table-fixed sm:table-auto">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 whitespace-nowrap text-[10px] sm:text-xs">
                    {/* Index (ترقيم) on far right - hidden on mobile */}
                    <th className="py-2 px-1 text-center w-8 font-bold text-slate-300 whitespace-nowrap hidden sm:table-cell">
                      م
                    </th>
                    {/* Item Type (النوع) */}
                    <th className="py-2 px-1 sm:px-3 font-bold text-slate-300 w-[39%] sm:w-auto">
                      الصنف (النوع)
                    </th>
                    {/* Count (العدد) */}
                    <th className="py-2 px-0.5 sm:px-3 text-center font-bold text-slate-300 w-[14%] sm:w-20">
                      العدد
                    </th>
                    {/* Weight/Quantity (الكمية) */}
                    <th className="py-2 px-1 sm:px-3 text-center font-bold text-slate-300 w-[24%] sm:w-auto">
                      الكمية / الوزن
                    </th>
                    {/* Value/Price (القيمة/السعر) */}
                    <th className="py-2 px-1 sm:px-3 text-left font-bold text-slate-300 w-[17%] sm:w-24">
                      السعر
                    </th>
                    {/* Actions */}
                    <th className="py-2 px-0.5 sm:px-2 text-center font-bold text-slate-300 w-[6%] sm:w-10">
                      حذف
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {currentItems.map((item, index) => {
                    const isShrimp = item.itemType.includes('جمبري');

                    return (
                      <tr key={item.id || index} className="hover:bg-slate-800/30 transition-colors">
                        
                        {/* 1. Index (hidden on mobile) */}
                        <td className="hidden sm:table-cell py-2 px-1 text-center font-mono-num font-bold text-slate-400 text-xs">
                          {index + 1}
                        </td>

                        {/* 2. Item Type (النوع) */}
                        <td className="py-1.5 px-1 sm:px-3">
                          <select
                            value={item.itemType}
                            onChange={(e) => handleItemTypeChange(index, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 sm:px-2 py-1 text-[10px] sm:text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate"
                          >
                            {menuItems.map((menu) => (
                              <option key={menu.id} value={menu.name}>
                                {menu.name} ({menu.pricePerKilo} ج.م)
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 3. Count (العدد) Dropdown from 1 to 10 */}
                        <td className="py-1.5 px-0.5 sm:px-3 text-center">
                          <select
                            value={item.count}
                            onChange={(e) => handleCountChange(index, Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-0.5 sm:px-1.5 py-1 text-center font-mono-num font-bold text-slate-100 text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 4. Weight/Quantity (الكمية): Shrimp dropdown */}
                        <td className="py-1.5 px-1 sm:px-3 text-center">
                          {isShrimp ? (
                            <div className="relative w-full">
                              <select
                                value={item.weightText || 'نصف كيلو'}
                                onChange={(e) => handleWeightChange(index, e.target.value)}
                                className="w-full bg-slate-900 border border-amber-600/70 text-amber-300 rounded px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                              >
                                <option value="ربع كيلو">ربع كيلو</option>
                                <option value="نصف كيلو">نصف كيلو</option>
                                <option value="كيلو">كيلو</option>
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-slate-500 text-[9px] sm:text-[11px] bg-slate-900/40 border border-slate-800/80 rounded px-1 py-1 select-none cursor-not-allowed">
                              <span className="truncate">خاص بالجمبري</span>
                            </div>
                          )}
                        </td>

                        {/* 5. Value/Price (القيمة/السعر) */}
                        <td className="py-1.5 px-1 sm:px-3 text-left">
                          {isAdmin ? (
                            <div className="flex items-center gap-0.5 justify-end">
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) => handleAdminPriceOverride(index, Number(e.target.value))}
                                className="w-12 sm:w-16 bg-slate-900 border border-blue-600 rounded px-1 py-0.5 text-center font-mono-num font-bold text-blue-300 text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                title="تعديل السعر كمسؤول"
                              />
                              <span className="text-slate-400 text-[8px] sm:text-[10px]">ج</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between sm:justify-start gap-0.5 font-mono-num font-bold text-slate-200 text-[10px] sm:text-xs">
                              <span>{Number(item.price).toLocaleString()}</span>
                              <span className="text-[8px] sm:text-[10px] text-slate-400 font-sans">ج.م</span>
                            </div>
                          )}
                        </td>

                        {/* 6. Delete Row */}
                        <td className="py-1.5 px-0.5 sm:px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                            title="حذف هذا الصنف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        لم تتم إضافة أصناف بعد لهذا العميل. اضغط على "إضافة صنف جديد للطلب" بالأسفل.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Controls of the Table */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-950/90 border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-lg text-xs transition-colors border border-slate-700 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>إضافة صنف آخر للطلب (+)</span>
              </button>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">إجمالي حساب {selectedUser}: </span>
                  <span className="font-mono-num font-bold text-slate-100 text-sm">
                    {userTotal.toLocaleString()} ج . م
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md shrink-0"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>تم الحفظ والمزامنة!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ وتحديث الطلب</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
          <Info className="w-5 h-5 text-slate-600" />
          <span>يرجى اختيار اسم العميل من القائمة أعلاه لبدء تسجيل أو تعديل الطلب</span>
        </div>
      )}

      {/* Modal: Add New Name Popup */}
      {isAddNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>إضافة اسم جديد للقائمة</span>
              </h3>
            </div>

            <form onSubmit={handleCreateNewName} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                  اسم العميل الجديد:
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="مثال: حسام، رامي، بيتر..."
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  أضف (حفظ)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddNameModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
