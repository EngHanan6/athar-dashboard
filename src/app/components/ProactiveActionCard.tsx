import React, { useState } from 'react';

export const ProactiveActionCard = () => {
  const [isApplied, setIsApplied] = useState(false);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      isApplied 
        ? 'bg-emerald-950/60 border-emerald-500/50 shadow-lg shadow-emerald-900/20' 
        : 'bg-slate-900/90 border-rose-500/50 shadow-lg shadow-rose-900/20'
    }`}>
      {/* الترويسة والتأثير */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          isApplied 
            ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
            : 'border-rose-500 text-rose-300 bg-rose-500/20'
        }`}>
          {isApplied ? '✓ تم الحد من الأثر' : '⚠️ ضغط متوقع - قطاع المياه'}
        </span>
        <span className="text-xs text-slate-400 font-mono">19:00 - حي الملقا</span>
      </div>

      {/* التفاصيل */}
      <div className="mb-4 space-y-1">
        <p className="text-sm font-medium text-slate-100">
          {isApplied 
            ? 'تمت إعادة توزيع الضغط المائي بنجاح.' 
            : 'عجز مائي متوقع بنسبة 35% بسبب التجمع السياحي.'}
        </p>
        <p className="text-xs text-slate-400">
          {isApplied 
            ? 'معدل الاستقرار الحالي: 94% (ضمن الحدود الآمنة).' 
            : 'التوصية: إعادة توجيه 15,000 م³ من الخزان الإستراتيجي الشمالي.'}
        </p>
      </div>

      {/* الزر التفاعلي */}
      {!isApplied ? (
        <button 
          onClick={() => setIsApplied(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 cursor-pointer"
        >
          <span>⚡</span> تطبيق التدخل الاستباقي
        </button>
      ) : (
        <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
          <span>✓</span> تم تنفيذ الأمر التشغيلي وتعديل التدفقات تلقائياً
        </div>
      )}
    </div>
  );
};