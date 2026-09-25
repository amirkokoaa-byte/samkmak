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

  const shrimpWeights = summaryList
    .filter((it) => it.itemType.includes('جمبري'))
    .flatMap((it) => it.weights);

  const totalMakrouna = summaryList
    .filter((it) => it.itemType.includes('مكرونه') || it.itemType.includes('مكرونة'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalMakaril = summaryList
    .filter((it) => it.itemType.includes('مكاريل'))
    .reduce((s, it) => s + it.totalCount, 0);

  const totalItemsAll = summaryList.reduce((s, it) => s + it.totalCount, 0);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>الملخص الإجمالي اللحظي للأصناف (Live Summary Table)</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                تحديث فوري
              </span>
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-medium bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
          إجمالي القطع والوجبات:{' '}
          <span className="font-mono-num font-bold text-emerald-400 text-sm">
            {totalItemsAll}
          </span>
        </div>
      </div>

      {/* Detailed Live Aggregation Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 text-center w-12 font-bold text-slate-300">م</th>
                <th className="py-2.5 px-3 font-bold text-slate-300">الصنف ونوع الطهي (Item Type)</th>
                <th className="py-2.5 px-3 text-center w-28 font-bold text-slate-300">إجمالي العدد</th>
                <th className="py-2.5 px-3 font-bold text-slate-300">تفاصيل الأوزان المسجلة (الجمبري)</th>
                <th className="py-2.5 px-3 w-32 text-left font-bold text-slate-300">إجمالي القيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-medium">
              {summaryList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    لا توجد أصناف مطلوبة حالياً لتلخيصها.
                  </td>
                </tr>
              ) : (
                summaryList.map((item, idx) => (
                  <tr key={item.itemType} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono-num font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {item.itemType}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-num font-extrabold text-blue-400 text-sm">
                      {item.totalCount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {item.weights.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.weights.map((w, wi) => (
                            <span
                              key={wi}
                              className="text-[11px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono-num font-bold text-slate-200">
                      {item.totalPrice.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">ج.م</span>
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
