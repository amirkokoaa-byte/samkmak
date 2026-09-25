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
  CheckCircle,
  Edit3,
  ArrowDown,
} from 'lucide-react';
import type { MenuItem, OrderItem, UserOrder } from '../types/index.ts';
import { calculateRowPrice } from '../utils/pricing.ts';

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
  onEditInDashboard?: (userName: string) => void;
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
  onEditInDashboard,
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

  // Keep selectedUser valid if selected user was deleted
  useEffect(() => {
    if (selectedUser && !users.includes(selectedUser)) {
      handleSelectUser('');
    }
  }, [users, selectedUser]);

  // When selectedUser changes, initialize items
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

  const handleItemTypeChange = (index: number, newType: string) => {
    const menuItem = menuItems.find((m) => m.name === newType);
    const baseUnitPrice = menuItem ? menuItem.pricePerKilo : 100;
    const isShrimp = newType.includes('جمبري');

    setCurrentItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const newWeight = isShrimp ? (row.weightText || 'نصف كيلو') : '';
        const calculated = calculateRowPrice(newType, row.count, newWeight, menuItems);
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
        const newPrice = calculateRowPrice(row.itemType, countNum, row.weightText, menuItems);
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
        const newPrice = calculateRowPrice(row.itemType, row.count, weight, menuItems);
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

  const userTotal = currentItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Check if this user already has an active order registered
  const registeredOrder = selectedUser ? orders[selectedUser] : undefined;
  const hasRegisteredOrder = Boolean(
    registeredOrder &&
    Array.isArray(registeredOrder.items) &&
    registeredOrder.items.length > 0
  );

  return (
    <section id="order-form-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mb-8">
      {/* 1. Top Bar: Select / Add Name */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>اختيار العميل / الاسم (Name Dropdown)</span>
            </h2>
          </div>
        </div>

        {/* Dropdown & Add Name Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <select
              id="user-name-select"
              value={selectedUser}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-10"
            >
              <option value="">-- اضغط لاختيار اسم العميل --</option>
              {users.map((name) => {
                const userHasOrder = orders[name]?.items && orders[name].items.length > 0;
                return (
                  <option key={name} value={name}>
                    {name} {userHasOrder ? '✓ (مسجل له طلب)' : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setIsAddNameModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shrink-0 shadow"
            title="إضافة اسم عميل جديد"
          >
            <Plus className="w-4 h-4" />
            <span>أضف</span>
          </button>
        </div>
      </div>

      {/* 2. Order Form / Status Box */}
      {!selectedUser ? (
        /* Empty State: NO items shown until customer name is selected from dropdown */
        <div className="pt-6 pb-2 text-center animate-in fade-in duration-150">
          <div className="max-w-md mx-auto p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-6 h-6 text-blue-400/80" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-200">
                يرجى اختيار اسم العميل للبدء
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                اضغط على القائمة المنسدلة بالأعلى واختر اسم العميل لتسجيل أو عرض أصناف الطلب
              </p>
            </div>
          </div>
        </div>
      ) : hasRegisteredOrder ? (
          /* When order is registered: HIDE table here and show confirmed banner */
          <div className="pt-5 animate-in fade-in duration-150">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center justify-center gap-2">
                  <span>تم تسجيل طلب العميل ({selectedUser}) بنجاح</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  تم إخفاء الجدول من هذه الخانة ويظهر الطلب حالياً في لوحة الطلبات المسجلة للأسماء (Main Dashboard) بالأسفل، ويمكنك التعديل عليه مباشرة هناك.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onEditInDashboard) {
                      onEditInDashboard(selectedUser);
                    } else {
                      const el = document.getElementById(`order-card-${selectedUser}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل الطلب في لوحة الطلبات بالأسفل</span>
                  <ArrowDown className="w-3.5 h-3.5 text-blue-200" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddNameModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>تسجيل طلب لاسم جديد</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* When order is NOT yet registered: show table so user can register items */
          <div className="pt-4 sm:pt-5 space-y-4 animate-in fade-in duration-150">
            {/* Section Sub-Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  تسجيل طلب جديد للعميل:{' '}
                  <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-4">
                    {selectedUser}
                  </span>
                </span>
              </div>

              {/* Admin Add Item */}
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

            {/* Dynamic Table / List */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-hidden sm:overflow-x-auto">
                <table className="w-full text-right text-xs table-fixed sm:table-auto">
                  <thead>
                    <tr className="border-b border-slate-800 whitespace-nowrap text-[10px] sm:text-xs">
                      {/* Index */}
                      <th className="py-2 px-1 text-center w-8 font-bold whitespace-nowrap hidden sm:table-cell">
                        م
                      </th>
                      {/* Item Type */}
                      <th className="py-2 px-1 sm:px-3 font-bold w-[39%] sm:w-auto">
                        الصنف (النوع)
                      </th>
                      {/* Count */}
                      <th className="py-2 px-0.5 sm:px-3 text-center font-bold w-[14%] sm:w-20">
                        العدد
                      </th>
                      {/* Weight/Quantity */}
                      <th className="py-2 px-1 sm:px-3 text-center font-bold w-[24%] sm:w-auto">
                        الكمية / الوزن
                      </th>
                      {/* Price */}
                      <th className="py-2 px-1 sm:px-3 text-left font-bold w-[17%] sm:w-24">
                        السعر
                      </th>
                      {/* Actions */}
                      <th className="py-2 px-0.5 sm:px-2 text-center font-bold w-[6%] sm:w-10">
                        حذف
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {currentItems.map((item, index) => {
                      const isShrimp = item.itemType.includes('جمبري');

                      return (
                        <tr key={item.id || index} className="transition-colors">
                          {/* 1. Index */}
                          <td className="hidden sm:table-cell py-2 px-1 text-center font-mono-num font-bold text-xs">
                            {index + 1}
                          </td>

                          {/* 2. Item Type */}
                          <td className="py-1.5 px-1 sm:px-3">
                            <select
                              id={index === 0 ? 'item-type-select' : undefined}
                              value={item.itemType}
                              onChange={(e) => handleItemTypeChange(index, e.target.value)}
                              className="w-full rounded px-1 sm:px-2 py-1 text-[10px] sm:text-xs font-medium cursor-pointer truncate"
                            >
                              {menuItems.map((menu) => (
                                <option key={menu.id} value={menu.name}>
                                  {menu.name} ({menu.pricePerKilo} ج.م)
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* 3. Count Dropdown */}
                          <td className="py-1.5 px-0.5 sm:px-3 text-center">
                            <select
                              id={index === 0 ? 'item-count-select' : undefined}
                              value={item.count}
                              onChange={(e) => handleCountChange(index, Number(e.target.value))}
                              className="w-full rounded px-0.5 sm:px-1.5 py-1 text-center font-mono-num font-bold text-[10px] sm:text-xs cursor-pointer"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* 4. Weight/Quantity */}
                          <td className="py-1.5 px-1 sm:px-3 text-center">
                            {isShrimp ? (
                              <div className="relative w-full">
                                <select
                                  id={index === 0 ? 'item-quantity-select' : undefined}
                                  value={item.weightText || 'نصف كيلو'}
                                  onChange={(e) => handleWeightChange(index, e.target.value)}
                                  className="w-full rounded px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs text-center font-bold cursor-pointer"
                                >
                                  <option value="ربع كيلو">ربع كيلو</option>
                                  <option value="نصف كيلو">نصف كيلو</option>
                                  <option value="كيلو">كيلو</option>
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center text-[9px] sm:text-[11px] opacity-70 select-none">
                                <input
                                  id={index === 0 ? 'item-quantity-select' : undefined}
                                  type="text"
                                  disabled
                                  readOnly
                                  value="—"
                                  className="w-full text-center bg-transparent border-0 opacity-70 cursor-not-allowed text-[10px] sm:text-xs"
                                />
                              </div>
                            )}
                          </td>

                          {/* 5. Price */}
                          <td className="py-1.5 px-1 sm:px-3 text-left">
                            {isAdmin ? (
                              <div className="flex items-center gap-0.5 justify-end">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.price}
                                  onChange={(e) => handleAdminPriceOverride(index, Number(e.target.value))}
                                  className="w-12 sm:w-16 rounded px-1 py-0.5 text-center font-mono-num font-bold text-[10px] sm:text-xs"
                                  title="تعديل السعر كمسؤول"
                                />
                                <span className="text-[8px] sm:text-[10px]">ج</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between sm:justify-start gap-0.5 font-mono-num font-bold text-[10px] sm:text-xs">
                                <span>{Number(item.price).toLocaleString()}</span>
                                <span className="text-[8px] sm:text-[10px] font-sans">ج.م</span>
                              </div>
                            )}
                          </td>

                          {/* 6. Delete Row */}
                          <td className="py-1.5 px-0.5 sm:px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(index)}
                              className="p-1 rounded text-rose-300 hover:text-rose-200 transition-colors inline-flex items-center justify-center"
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
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          لم تتم إضافة أصناف بعد لهذا العميل. اضغط على "إضافة صنف آخر للطلب" بالأسفل.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Controls */}
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
                    id="save-order-btn"
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
                        <span>حفظ واعتماد الفاتورة لهذا الاسم</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddNameModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newUserName.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow"
                >
                  إضافة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
