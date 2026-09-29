import React, { useState } from 'react';
import { User, Trash2, Edit3, ShoppingBag, UserCog, Plus, Check, X } from 'lucide-react';
import type { MenuItem, OrderItem, UserOrder } from '../types/index.ts';
import { calculateRowPrice } from '../utils/pricing.ts';

interface MainDashboardProps {
  orders: Record<string, UserOrder>;
  isAdmin?: boolean;
  onEditUser?: (userName: string) => void;
  onDeleteOrder: (userName: string) => void;
  onRenameUser?: (oldName: string, newName: string) => void;
  menuItems: MenuItem[];
  onSaveOrder: (userName: string, items: OrderItem[]) => void;
  activeEditingUser?: string | null;
  setActiveEditingUser?: (userName: string | null) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  orders,
  isAdmin = false,
  onDeleteOrder,
  onRenameUser,
  menuItems,
  onSaveOrder,
  activeEditingUser: controlledEditingUser,
  setActiveEditingUser: controlledSetEditingUser,
}) => {
  // Local edit states
  const [internalEditingUser, setInternalEditingUser] = useState<string | null>(null);
  const editingUser = controlledEditingUser !== undefined ? controlledEditingUser : internalEditingUser;

  const setEditingUser = (name: string | null) => {
    if (controlledSetEditingUser) {
      controlledSetEditingUser(name);
    } else {
      setInternalEditingUser(name);
    }
  };

  const [editItems, setEditItems] = useState<OrderItem[]>([]);

  // Only show users who actually have items; empty names are hidden.
  const activeOrders = Object.values(orders).filter(
    (order) => order && Array.isArray(order.items) && order.items.length > 0
  );

  const startEditing = (userName: string, currentItems: OrderItem[]) => {
    setEditingUser(userName);
    setEditItems(JSON.parse(JSON.stringify(currentItems)));
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditItems([]);
  };

  const saveEditing = (userName: string) => {
    onSaveOrder(userName, editItems);
    setEditingUser(null);
    setEditItems([]);
  };

  const handleEditItemTypeChange = (index: number, newType: string) => {
    const menuItem = menuItems.find((m) => m.name === newType);
    const baseUnitPrice = menuItem ? menuItem.pricePerKilo : 100;
    const isShrimp = newType.includes('جمبري');

    setEditItems((prev) =>
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

  const handleEditCountChange = (index: number, newCount: number) => {
    setEditItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const calculated = calculateRowPrice(row.itemType, newCount, row.weightText, menuItems);
        return {
          ...row,
          count: newCount,
          price: calculated,
        };
      })
    );
  };

  const handleEditWeightChange = (index: number, newWeight: string) => {
    setEditItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const calculated = calculateRowPrice(row.itemType, row.count, newWeight, menuItems);
        return {
          ...row,
          weightText: newWeight,
          price: calculated,
        };
      })
    );
  };

  const handleEditAdminPriceOverride = (index: number, newPrice: number) => {
    setEditItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          price: newPrice,
        };
      })
    );
  };

  const handleAddEditRow = () => {
    const defaultMenuItem = menuItems[0] || {
      name: 'سمكه بلطي كبيره سنجاري',
      pricePerKilo: 130,
    };
    setEditItems((prev) => [
      ...prev,
      {
        id: `edit-row-${Date.now()}-${prev.length}`,
        itemType: defaultMenuItem.name,
        count: 1,
        weightText: '',
        price: defaultMenuItem.pricePerKilo,
        unitPrice: defaultMenuItem.pricePerKilo,
      },
    ]);
  };

  const handleRemoveEditRow = (index: number) => {
    const updated = editItems.filter((_, i) => i !== index);
    setEditItems(updated);
    if (editingUser) {
      onSaveOrder(editingUser, updated);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              لوحة الطلبات المسجلة للأسماء (Main Dashboard)
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          العملاء النشطون:{' '}
          <span className="font-mono-num font-bold text-blue-400 text-sm">
            {activeOrders.length}
          </span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
            <User className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">
            لا توجد طلبات مسجلة حالياً
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            اختر اسماً من الأعلى وأضف الأصناف المطلوبة لتظهر هنا فوراً لجميع المتابعين في الوقت الفعلي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activeOrders.map((order) => {
            const isEditingThisOrder = editingUser === order.userName;
            const currentDisplayItems = isEditingThisOrder ? editItems : order.items;
            const userTotal = currentDisplayItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
            const totalCount = currentDisplayItems.reduce((s, it) => s + (Number(it.count) || 0), 0);

            return (
              <div
                key={order.userName}
                id={`order-card-${order.userName}`}
                className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between ${
                  isEditingThisOrder
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10'
                    : 'border-slate-800/90 hover:border-slate-700/80'
                }`}
              >
                {/* User Header */}
                <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 text-xs font-bold font-mono">
                      {order.userName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{order.userName}</span>
                        {isAdmin && onRenameUser && (
                          <button
                            type="button"
                            onClick={() => {
                              const newName = prompt(`تعديل اسم العميل (${order.userName}) إلى:`, order.userName);
                              if (newName && newName.trim() && newName.trim() !== order.userName) {
                                onRenameUser(order.userName, newName.trim());
                              }
                            }}
                            className="text-slate-400 hover:text-amber-300 p-0.5 rounded transition-colors text-[10px] flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 border border-slate-700 font-normal"
                            title="تعديل اسم العميل (صلاحية خاصة بالمسؤول فقط)"
                          >
                            <UserCog className="w-3 h-3 text-amber-400" />
                            <span>تعديل الاسم</span>
                          </button>
                        )}
                        <span className="text-[11px] font-normal text-slate-400 font-mono-num">
                          ({totalCount} قطع)
                        </span>

                        {isEditingThisOrder && (
                          <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/50 px-2 py-0.5 rounded-full font-normal">
                            جاري التعديل...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isEditingThisOrder ? (
                      <button
                        type="button"
                        onClick={() => startEditing(order.userName, order.items)}
                        className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition-colors"
                        title="تعديل طلب هذا الاسم مباشرة في هذا المكان"
                      >
                        <Edit3 className="w-3 h-3 text-blue-400" />
                        <span>تعديل</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition-colors"
                        title="إلغاء التعديل"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                        <span>إلغاء</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من مسح طلب ${order.userName} بالكامل؟`)) {
                          onDeleteOrder(order.userName);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="مسح طلب هذا الاسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="p-0 overflow-hidden flex-1">
                  <table className="w-full text-right text-xs table-fixed sm:table-auto">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[11px] whitespace-nowrap">
                        <th className="py-2.5 px-2 text-center w-7 whitespace-nowrap hidden sm:table-cell">#</th>
                        <th className="py-2 px-2 sm:px-3 whitespace-nowrap font-bold w-[42%] sm:w-auto">
                          الصنف (النوع)
                        </th>
                        <th className="py-2 px-1 sm:px-3 text-center whitespace-nowrap font-bold w-11 sm:w-16">
                          العدد
                        </th>
                        <th className="py-2 px-1 sm:px-3 text-center sm:text-right whitespace-nowrap font-bold w-[24%] sm:w-auto">
                          الوزن / الكمية
                        </th>
                        <th className="py-2 px-2 sm:px-3 text-left whitespace-nowrap font-bold w-16 sm:w-24">
                          السعر
                        </th>
                        <th className="py-2 px-1 text-center font-bold w-9 sm:w-10">
                          حذف
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {!isEditingThisOrder ? (
                        /* Read-only Table Rows with Instant Delete */
                        order.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-2 px-2 text-center font-mono-num text-[11px] whitespace-nowrap hidden sm:table-cell">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2 sm:px-3 font-semibold text-[11px] sm:text-xs truncate" title={item.itemType}>
                              {item.itemType}
                            </td>
                            <td className="py-2 px-1 sm:px-3 text-center font-mono-num font-bold text-[11px] sm:text-xs whitespace-nowrap">
                              {item.count}
                            </td>
                            <td className="py-2 px-1 sm:px-3 text-center sm:text-right text-[10px] sm:text-xs truncate">
                              {item.weightText ? (
                                <span className="bg-amber-950/60 text-amber-300 px-1 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] border border-amber-800 whitespace-nowrap inline-block max-w-full truncate">
                                  {item.weightText}
                                </span>
                              ) : (
                                <span>—</span>
                              )}
                            </td>
                            <td className="py-2 px-2 sm:px-3 text-left font-mono-num font-bold text-[11px] sm:text-xs whitespace-nowrap">
                              {Number(item.price).toLocaleString()}{' '}
                              <span className="text-[9px] sm:text-[10px] font-sans">ج.م</span>
                            </td>
                            <td className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = order.items.filter((_, i) => i !== idx);
                                  onSaveOrder(order.userName, updated);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                                title="حذف هذا الصنف من الطلب فوراً"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        /* Editable Table Rows right in place */
                        editItems.map((item, idx) => {
                          const isShrimp = item.itemType.includes('جمبري');
                          return (
                            <tr key={item.id || idx}>
                              {/* Index */}
                              <td className="py-1.5 px-1 text-center font-mono-num text-[11px] whitespace-nowrap hidden sm:table-cell">
                                {idx + 1}
                              </td>

                              {/* Item type dropdown */}
                              <td className="py-1.5 px-1 sm:px-2">
                                <select
                                  value={item.itemType}
                                  onChange={(e) => handleEditItemTypeChange(idx, e.target.value)}
                                  className="w-full rounded px-1 sm:px-2 py-1 text-[10px] sm:text-xs font-medium cursor-pointer truncate"
                                >
                                  {menuItems.map((menu) => (
                                    <option key={menu.id} value={menu.name}>
                                      {menu.name} ({menu.pricePerKilo} ج.م)
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Count dropdown */}
                              <td className="py-1.5 px-0.5 sm:px-1 text-center">
                                <select
                                  value={item.count}
                                  onChange={(e) => handleEditCountChange(idx, Number(e.target.value))}
                                  className="w-full rounded px-0.5 py-1 text-center font-mono-num font-bold text-[10px] sm:text-xs cursor-pointer"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={num} value={num}>
                                      {num}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Weight/Quantity dropdown */}
                              <td className="py-1.5 px-1 sm:px-2 text-center">
                                {isShrimp ? (
                                  <select
                                    value={item.weightText || 'نصف كيلو'}
                                    onChange={(e) => handleEditWeightChange(idx, e.target.value)}
                                    className="w-full rounded px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs text-center font-bold cursor-pointer"
                                  >
                                    <option value="ربع كيلو">ربع كيلو</option>
                                    <option value="نصف كيلو">نصف كيلو</option>
                                    <option value="كيلو">كيلو</option>
                                  </select>
                                ) : (
                                  <span className="text-[10px] sm:text-xs opacity-70 select-none">
                                    —
                                  </span>
                                )}
                              </td>

                              {/* Price */}
                              <td className="py-1.5 px-1 sm:px-2 text-left">
                                {isAdmin ? (
                                  <div className="flex items-center gap-0.5 justify-end">
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.price}
                                      onChange={(e) => handleEditAdminPriceOverride(idx, Number(e.target.value))}
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

                              {/* Delete row */}
                              <td className="py-1.5 px-0.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditRow(idx)}
                                  className="p-1 rounded hover:bg-rose-900/40 text-rose-300 transition-colors inline-flex items-center justify-center"
                                  title="حذف هذا الصنف من الطلب فوراً"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Add item row button when editing */}
                  {isEditingThisOrder && (
                    <div className="p-2.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddEditRow}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold transition-colors border border-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-400" />
                        <span>إضافة صنف آخر للطلب (+)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Specific Total Cost for User (القيمة) & Action Controls */}
                <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold ml-2">
                      إجمالي الحساب:
                    </span>
                    <span className="font-mono-num font-extrabold text-blue-400 text-base">
                      {userTotal.toLocaleString()}{' '}
                      <span className="text-xs text-slate-300 font-sans font-bold">ج . م</span>
                    </span>
                  </div>

                  {isEditingThisOrder && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditing(order.userName)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
