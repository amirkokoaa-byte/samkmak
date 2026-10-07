import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cyan-500/20 backdrop-blur-2xl bg-slate-950/80 py-8 px-4 text-center mt-auto shadow-[0_-4px_25px_rgba(6,182,212,0.08)]">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYBERNETIC INTERFACE // DARK MODE & GLASSMORPHISM</span>
        </div>

        <p className="text-sm sm:text-base font-bold text-white tracking-wide">
          مع تحيات المطور <span className="text-cyan-300">Amir Lamay</span> و المطور المبدع <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 font-extrabold">Samkmak</span>
        </p>

        <p className="text-xs text-slate-400 font-mono">
          نظام متزامن في الوقت الفعلي بتقنية WebSockets & Firebase · واجهة مستخدم رقمية فائقة التطور
        </p>
      </div>
    </footer>
  );
};
