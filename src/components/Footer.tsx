import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-2">
        <p className="text-sm sm:text-base font-semibold text-slate-300 tracking-wide font-sans">
          مع تحيات المطور Amir Lamay
        </p>
        <p className="text-xs text-slate-500 font-normal">
          نظام إدارة فواتير وطلبات المأكولات البحرية · متزامن في الوقت الفعلي
        </p>
      </div>
    </footer>
  );
};
