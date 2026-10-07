import React from 'react';
import { Sparkles, Fish, Flame, Scale, CheckCircle2 } from 'lucide-react';
import type { OrderItem, UserOrder } from '../types/index.ts';
import { calculateSummary, ItemSummaryAggregation } from '../services/pdfExport.ts';

interface LiveSummaryTableProps {
  orders: Record<string, UserOrder>;
}

export const LiveSummaryTable: React.FC<LiveSummaryTableProps> = ({ orders }) => {
  const summaryList = calculateSummary(orders);

  // Group by broad category for high-level kitchen overview
  const totalTilapia = summaryList
    .filter((it) => it.itemType.includes('بلطي'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalMullet = summaryList
    .filter((it) => it.itemType.includes('بوري'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalShrimpCount = summaryList
    .filter((it) => it.itemType.includes('جمبري'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalMakrouna = summaryList
    .filter((it) => it.itemType.includes('مكرونه') || it.itemType.includes('مكرونة'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalMakaril = summaryList
    .filter((it) => it.itemType.includes('مكاريل'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalItemsAll = summaryList.reduce((s, it) => s + it.totalCount, 0);

  return (
    <section className="backdrop-blur-xl bg-slate-900/45 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.12)] hover:border-cyan-400/50 transition-all mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-100">
                الملخص الإجمالي اللحظي للأصناف (Live Summary Table)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                تحديث فوري
              </span>
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-slate-950/80 px-4 py-1.5 rounded-xl border border-cyan-500/30">
          إجمالي القطع والوجبات:{' '}
          <span className="font-mono-num font-bold text-cyan-300 text-sm">
            {totalItemsAll}
          </span>
        </div>
      </div>

      {/* Detailed Live Aggregation Table */}
      <div className="border border-cyan-500/30 rounded-2xl overflow-hidden mt-5 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-cyan-200 border-b border-cyan-500/30">
                <th className="py-2.5 px-3 text-center w-12 font-bold text-cyan-300">م</th>
                <th className="py-2.5 px-3 font-bold text-cyan-300">الصنف ونوع الطهي (Item Type)</th>
                <th className="py-2.5 px-3 text-center w-28 font-bold text-cyan-300">إجمالي العدد</th>
                <th className="py-2.5 px-3 font-bold text-cyan-300">تفاصيل الأوزان المسجلة (الجمبري والمكرونة)</th>
                <th className="py-2.5 px-3 w-32 text-left font-bold text-cyan-300">إجمالي القيمة</th>
              </tr>
            </thead>
            <tbody id="summary-table-body" className="divide-y divide-slate-800/70 font-medium">
              {summaryList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    لا توجد أصناف مطلوبة حالياً لتلخيصها.
                  </td>
                </tr>
              ) : (
                summaryList.map((item, idx) => (
                  <tr key={item.itemType} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono-num font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {item.itemType}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-num font-extrabold text-cyan-400 text-sm">
                      {item.totalCount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {item.weights.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.weights.map((w, wi) => (
                            <span
                              key={wi}
                              className="text-[11px] bg-slate-950/80 border border-cyan-500/30 px-2 py-0.5 rounded text-amber-300 font-mono"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono-num font-black text-cyan-300 text-xs">
                      {item.totalPrice.toLocaleString()} ج.م
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
