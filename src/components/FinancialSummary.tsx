import React from 'react';
import { Banknote, Users, Receipt, CheckCircle } from 'lucide-react';
import type { UserOrder } from '../types/index.ts';

interface FinancialSummaryProps {
  orders: Record<string, UserOrder>;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ orders }) => {
  const activeOrders = Object.values(orders).filter((o) => o.items && o.items.length > 0);

  const grandTotal = activeOrders.reduce((sum, order) => {
    return sum + order.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
  }, 0);

  const totalItemsCount = activeOrders.reduce((sum, order) => {
    return sum + order.items.reduce((s, it) => s + (Number(it.count) || 0), 0);
  }, 0);

  return (
    <section className="bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-700/80 rounded-2xl p-6 shadow-2xl mb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left side details */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <Banknote className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">
                عدد المسجلين لهم طلبات: {activeOrders.length}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 mt-1">
              الإجمالي للجميع
            </h3>
          </div>
        </div>

        {/* Right side: formatted as [Total] (ج . م) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 flex flex-col items-center md:items-end justify-center w-full md:w-auto shadow-lg">
          <span className="text-xs text-slate-400 font-semibold mb-1">
            إجمالي المبلغ المطلوب دفعه:
          </span>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span id="grand-total-display" className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {grandTotal.toLocaleString()} ج.م
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-200 font-sans">
              (ج . م)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            إجمالي عدد القطع / الأصناف: {totalItemsCount}
          </span>
        </div>

      </div>
    </section>
  );
};
