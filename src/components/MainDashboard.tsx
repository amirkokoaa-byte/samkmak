import React from 'react';
import { User, Trash2, Edit3, ShoppingBag } from 'lucide-react';
import type { UserOrder } from '../types/index.ts';

interface MainDashboardProps {
  orders: Record<string, UserOrder>;
  onEditUser: (userName: string) => void;
  onDeleteOrder: (userName: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  orders,
  onEditUser,
  onDeleteOrder,
}) => {
  // Only show users who actually have items; empty names are hidden.
  const activeOrders = Object.values(orders).filter(
    (order) => order && Array.isArray(order.items) && order.items.length > 0
  );

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
            <p className="text-xs text-slate-400">
              عرض مباشر ومفصل لكافة فواتير العملاء المسجلة (يتم إخفاء الأسماء الفارغة تلقائياً)
            </p>
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
            const userTotal = order.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
            const totalCount = order.items.reduce((s, it) => s + (Number(it.count) || 0), 0);

            return (
              <div
                key={order.userName}
                className="bg-slate-900 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                {/* User Header */}
                <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 text-xs font-bold font-mono">
                      {order.userName.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{order.userName}</span>
                        <span className="text-[11px] font-normal text-slate-400 font-mono-num">
                          ({totalCount} قطع)
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditUser(order.userName)}
                      className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition-colors"
                      title="تعديل طلب هذا الاسم"
                    >
                      <Edit3 className="w-3 h-3 text-blue-400" />
                      <span>تعديل</span>
                    </button>

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
                <div className="p-0 overflow-x-auto flex-1">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/80 bg-slate-950/40 text-[11px]">
                        <th className="py-2 px-3 text-center w-8">#</th>
                        <th className="py-2 px-3">الصنف (النوع)</th>
                        <th className="py-2 px-3 text-center w-14">العدد</th>
                        <th className="py-2 px-3">الوزن / الكمية</th>
                        <th className="py-2 px-3 w-24 text-left">السعر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {order.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 text-center font-mono-num text-slate-500 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-200">
                            {item.itemType}
                          </td>
                          <td className="py-2 px-3 text-center font-mono-num font-bold text-slate-300">
                            {item.count}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {item.weightText ? (
                              <span className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded text-[11px] border border-amber-900/50">
                                {item.weightText}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-left font-mono-num font-bold text-slate-200">
                            {Number(item.price).toLocaleString()}{' '}
                            <span className="text-[10px] text-slate-400 font-sans">ج.م</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Specific Total Cost for User (القيمة) */}
                <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">
                    إجمالي حساب ({order.userName}):
                  </span>
                  <div className="font-mono-num font-extrabold text-blue-400 text-base">
                    {userTotal.toLocaleString()}{' '}
                    <span className="text-xs text-slate-300 font-sans font-bold">ج . م</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
