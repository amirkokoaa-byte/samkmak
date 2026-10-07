import React from 'react';
import { Banknote, Users, Receipt, Sparkles } from 'lucide-react';
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
    <section className="backdrop-blur-2xl bg-slate-950/70 border border-cyan-500/35 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:border-cyan-400/60 transition-all mb-12 relative overflow-hidden">
      {/* Background Neon Reflection Glow */}
      <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left side details */}
        <div className="flex items-center gap-4 text-center md:text-right">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
            <Banknote className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>عدد العملاء المسجلين: {activeOrders.length}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
              إجمالي الحساب للجميع (Grand Total)
            </h3>
          </div>
        </div>

        {/* Right side: formatted as [Total] (ج . م) */}
        <div className="backdrop-blur-md bg-slate-900/60 border border-cyan-500/30 rounded-2xl px-8 py-5 flex flex-col items-center md:items-end justify-center w-full md:w-auto shadow-[0_0_25px_rgba(6,182,212,0.12)]">
          <span className="text-xs text-slate-400 font-semibold mb-1 font-mono">
            // إجمالي المبلغ المطلوب تحصيله:
          </span>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span id="grand-total-display" className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              {grandTotal.toLocaleString()} ج.م
            </span>
            <span className="text-base sm:text-lg font-bold text-cyan-200 font-sans">
              (ج . م)
            </span>
          </div>
          <span className="text-[11px] text-cyan-400/80 font-mono mt-1">
            إجمالي عدد القطع / الأصناف: {totalItemsCount}
          </span>
        </div>

      </div>
    </section>
  );
};
