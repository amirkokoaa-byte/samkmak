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
  Code2,
  LayoutDashboard,
  Cpu,
} from 'lucide-react';
import type { AppConfig } from '../types/index.ts';

interface HeaderProps {
  config: AppConfig;
  isAdmin: boolean;
  isFirebase?: boolean;
  historyCount?: number;
  currentView?: 'dashboard' | 'portfolio';
  onSwitchView?: (view: 'dashboard' | 'portfolio') => void;
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
  currentView = 'dashboard',
  onSwitchView,
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
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/75 border-b border-cyan-500/25 shadow-[0_4px_30px_rgba(6,182,212,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Top-Left: e-Wallet, InstaPay, and Admin Archive Controls */}
          <div className="w-full md:w-auto order-2 md:order-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Admin Archive Buttons: حفظ الطلبات + السجل (Visible ONLY to Admin) */}
            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onSaveOrders}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all shrink-0 border border-emerald-400/40"
                  title="حفظ وترحيل جميع الطلبات الحالية إلى السجل الدائم"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ الطلبات</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="flex items-center gap-1.5 backdrop-blur-md bg-slate-900/60 hover:bg-slate-800 text-cyan-200 border border-cyan-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] shrink-0"
                  title="عرض سجل الطلبات الدائم والمؤرشف"
                >
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span>السجل</span>
                  {historyCount > 0 && (
                    <span className="bg-cyan-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full font-mono shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                      {historyCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Electronic Wallet and InstaPay pill */}
            <div className="backdrop-blur-md bg-slate-900/45 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.08)] rounded-xl p-1.5 sm:px-3 flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold border-l border-cyan-500/20 pl-2 shrink-0">
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>التحويل:</span>
              </div>

              {/* Electronic Wallet */}
              <div className="flex items-center gap-2 bg-slate-950/70 border border-cyan-500/20 rounded-lg px-2.5 py-1">
                <Wallet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400 font-medium">المحفظة:</span>
                <span className="font-mono-num font-bold text-cyan-200 dir-ltr select-all">
                  {config.walletNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(config.walletNumber, 'wallet')}
                  title="نسخ رقم المحفظة الإلكترونية"
                  className="flex items-center gap-1 bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/30 px-2 py-0.5 rounded transition-all text-[11px]"
                >
                  {copiedField === 'wallet' ? (
                    <>
                      <Check className="w-3 h-3 text-cyan-300" />
                      <span className="text-[10px] text-cyan-300">تم</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">نسخ</span>
                    </>
                  )}
                </button>
              </div>

              {/* InstaPay */}
              <div className="flex items-center gap-2 bg-slate-950/70 border border-cyan-500/20 rounded-lg px-2.5 py-1">
                <span className="text-cyan-400 font-bold font-mono text-[11px] shrink-0">⚡ InstaPay:</span>
                <span className="font-mono-num font-bold text-cyan-200 dir-ltr select-all">
                  {config.instapayNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(config.instapayNumber, 'instapay')}
                  title="نسخ عنوان إنستاباي InstaPay"
                  className="flex items-center gap-1 bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/30 px-2 py-0.5 rounded transition-all text-[11px]"
                >
                  {copiedField === 'instapay' ? (
                    <>
                      <Check className="w-3 h-3 text-cyan-300" />
                      <span className="text-[10px] text-cyan-300">تم</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Brand Title with Glowing Cyber Neon Text */}
          <div className="order-1 md:order-2 flex items-center gap-2.5 text-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
              <Waves className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                {config.siteTitle}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] text-cyan-300/80">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono font-medium">CYBER OS ONLINE</span>
                <span className="text-slate-500">|</span>
                <span className="text-sky-300 font-mono">SAMKMAK PROTOCOL</span>
              </div>
            </div>
          </div>

          {/* Top-Right: View Switcher (Dashboard / Samkmak Portfolio) & Admin Gear */}
          <div className="order-3 flex items-center gap-2 shrink-0">
            {/* View Switcher Pill */}
            {onSwitchView && (
              <div className="flex items-center p-1 rounded-xl backdrop-blur-md bg-slate-900/60 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <button
                  type="button"
                  onClick={() => onSwitchView('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                  title="التبديل إلى لوحة إدارة الطلبات والفواتير الفورية"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نظام الطلبات</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchView('portfolio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'portfolio'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                  title="عرض بورتفوليو المطور المبدع Samkmak"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Samkmak</span>
                </button>
              </div>
            )}

            {/* Admin status chip */}
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-xl text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">المشرف</span>
                <button
                  onClick={onLogoutAdmin}
                  className="text-slate-400 hover:text-rose-400 px-1 py-0.5 transition-colors text-[11px]"
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
              className="flex items-center gap-1.5 backdrop-blur-md bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-400 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.08)]"
            >
              <Settings className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
              <span>الإعدادات</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
