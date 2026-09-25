import React, { useState } from 'react';
import {
  Copy,
  Check,
  Settings,
  ShieldCheck,
  Wallet,
  ArrowLeftRight,
  Waves,
  Save,
  History,
} from 'lucide-react';
import type { AppConfig } from '../types/index.ts';

interface HeaderProps {
  config: AppConfig;
  isAdmin: boolean;
  isFirebase?: boolean;
  historyCount?: number;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
  onSaveOrders?: () => void;
  onOpenHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  isAdmin,
  isFirebase = false,
  historyCount = 0,
  onOpenAdmin,
  onLogoutAdmin,
  onSaveOrders,
  onOpenHistory,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Top-Left: e-Wallet and Admin Order Archive Controls */}
          <div className="w-full md:w-auto order-2 md:order-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Admin Archive Buttons: حفظ الطلبات + السجل (Visible ONLY to Admin) */}
            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onSaveOrders}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors shadow-sm shrink-0"
                  title="حفظ وترحيل جميع الطلبات الحالية إلى السجل الدائم"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ الطلبات</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0"
                  title="عرض سجل الطلبات الدائم والمؤرشف"
                >
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  <span>السجل</span>
                  {historyCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                      {historyCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2 sm:px-3 flex flex-wrap items-center gap-2.5 text-xs w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold border-l border-slate-700 pl-2.5 shrink-0">
                <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                <span>للتحويل:</span>
              </div>

              {/* Electronic Wallet */}
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1">
                <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 font-medium">المحفظة:</span>
                <span className="font-mono-num font-semibold text-slate-100 dir-ltr select-all">
                  {config.walletNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(config.walletNumber, 'wallet')}
                  title="نسخ رقم المحفظة الإلكترونية"
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors"
                >
                  {copiedField === 'wallet' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">نسخ</span>
                    </>
                  )}
                </button>
              </div>

              {/* InstaPay */}
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1">
                <span className="text-blue-400 font-bold text-xs">IP</span>
                <span className="text-slate-400 font-medium">انستا باي:</span>
                <span className="font-mono-num font-semibold text-slate-100 dir-ltr select-all max-w-[150px] sm:max-w-none truncate">
                  {config.instapayNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(config.instapayNumber, 'instapay')}
                  title="نسخ معرف انستا باي"
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors"
                >
                  {copiedField === 'instapay' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Brand Title */}
          <div className="order-1 md:order-2 flex items-center gap-2 text-center">
            <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                {config.siteTitle}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متصل</span>
              </div>
            </div>
          </div>

          {/* Top-Right: Settings Gear Icon & Admin Authentication */}
          <div className="order-3 flex items-center gap-2.5 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/80 text-blue-300 px-3 py-1.5 rounded-lg text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">لوحة الإدارة</span>
                <button
                  onClick={onOpenAdmin}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-2 py-0.5 rounded font-medium transition-colors"
                >
                  تعديل
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="text-slate-400 hover:text-rose-400 px-1 py-0.5 transition-colors"
                  title="تسجيل الخروج من الإدارة"
                >
                  خروج
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="إعدادات الإدارة"
              title="إعدادات الإدارة (المشرف)"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform" />
              <span>الإعدادات</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
