import React, { useState } from 'react';
import {
  X,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  ShoppingBag,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { OrderHistoryEntry } from '../types/index.ts';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history?: Record<string, OrderHistoryEntry>;
  onDeleteHistoryEntry: (id: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  history = {},
  onDeleteHistoryEntry,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const historyList = Object.values(history).sort((a, b) => b.timestamp - a.timestamp);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-700/80 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>سجل الطلبات الدائم (الأرشيف)</span>
                <span className="text-xs font-normal text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                  خاص بالمسؤول (Admin)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                أرشيف تاريخي دائم لجميع الفواتير والطلبات المرحّلة مع اليوم والتاريخ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {historyList.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">
                لا توجد طلبات محفوظة في السجل حتى الآن
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                عند الضغط على زر "حفظ الطلبات" بالأعلى سيتم ترحيل الطلبات الحالية وحفظها في هذا السجل الدائم مع اليوم والتاريخ.
              </p>
            </div>
          ) : (
            historyList.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const userOrders = Object.values(entry.orders || {});

              return (
                <div
                  key={entry.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow transition-all hover:border-slate-700"
                >
                  {/* Clickable Header Row: Click expands / collapses */}
                  <div
                    onClick={() => toggleExpand(entry.id)}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 sm:p-4 cursor-pointer hover:bg-slate-900/60 select-none transition-colors gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-700/50 flex items-center justify-center text-blue-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        {/* Day and Date */}
                        <div className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                          <span>{entry.dateStr}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{entry.totalUsersCount} عملاء</span>
                          <span>•</span>
                          <span>إجمالي: {entry.totalPrice.toLocaleString()} ج.م</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <div className="font-mono-num font-bold text-emerald-400 text-sm">
                        {entry.totalPrice.toLocaleString()} ج.م
                      </div>

                      {/* Expand / Collapse Indicator Arrow */}
                      <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('هل أنت متأكد من حذف هذا السجل المؤرشف؟')) {
                            onDeleteHistoryEntry(entry.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                        title="حذف هذا السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details: Customer names, items, quantities, prices */}
                  {isExpanded && (
                    <div
                      onClick={() => toggleExpand(entry.id)}
                      className="p-3 sm:p-4 bg-slate-900/80 border-t border-slate-800/90 space-y-4 animate-in fade-in duration-150 cursor-pointer"
                      title="اضغط على البيانات لغلق السهم مرة أخرى"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                        <span className="font-semibold text-slate-300">
                          تفاصيل الطلبات المسجلة في هذا السجل:
                        </span>
                        <span className="text-[10px] text-blue-400 underline">
                          (اضغط هنا لغلق السهم مرة أخرى)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {userOrders.map((uOrder) => {
                          const userTotal = uOrder.items.reduce(
                            (acc, it) => acc + (Number(it.price) || 0),
                            0
                          );

                          return (
                            <div
                              key={uOrder.userName}
                              className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-blue-400" />
                                  <span className="text-xs font-bold text-slate-100">
                                    العميل: {uOrder.userName}
                                  </span>
                                </div>
                                <span className="font-mono-num font-bold text-blue-400 text-xs">
                                  {userTotal.toLocaleString()} ج.م
                                </span>
                              </div>

                              {/* Items list */}
                              <div className="space-y-1 text-xs">
                                {uOrder.items.map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-slate-300 py-0.5 text-[11px] border-b border-slate-900/60 last:border-b-0"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-500 font-mono-num">
                                        {idx + 1}.
                                      </span>
                                      <span className="font-medium text-slate-200">
                                        {it.itemType}
                                      </span>
                                      <span className="text-slate-400 font-mono-num">
                                        (العدد: {it.count})
                                      </span>
                                      {it.weightText && (
                                        <span className="text-amber-300 bg-amber-950/50 px-1 rounded text-[10px] border border-amber-900/60">
                                          {it.weightText}
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-mono-num font-semibold text-slate-200">
                                      {Number(it.price).toLocaleString()} ج.م
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            إجمالي السجلات المؤرشفة: <strong className="text-white">{historyList.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
