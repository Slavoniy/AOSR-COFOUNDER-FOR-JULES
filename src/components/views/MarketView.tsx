import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Target, Layers, Zap, CheckCircle2, BarChart3 } from 'lucide-react';

interface MarketViewProps {
  onBack: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({ onBack }) => {
  return (
    <motion.div
      key="market"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-5xl w-full space-y-8 mt-8"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к выбору вектора
      </button>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Анализ объема рынка (TAM/SAM/SOM)</h2>
        <p className="text-slate-600">Оцениваем финансовый потенциал проекта StroyDoc AI в контексте цифровизации строительства в РФ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="relative p-6 bg-slate-900 text-white rounded-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Target className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">TAM (Total Addressable Market)</div>
                  <div className="text-3xl font-black">~150 млрд ₽</div>
                  <p className="text-xs text-slate-400 mt-2">Весь рынок ПО для строительства и управления проектами в РФ.</p>
                </div>
              </div>

              <div className="relative p-6 bg-blue-600 text-white rounded-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Layers className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">SAM (Serviceable Addressable Market)</div>
                  <div className="text-3xl font-black">~12.5 млрд ₽</div>
                  <p className="text-xs text-blue-100 mt-2">Сегмент автоматизации исполнительной документации и ОЖР для МСБ.</p>
                </div>
              </div>

              <div className="relative p-6 bg-emerald-500 text-white rounded-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Zap className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">SOM (Serviceable Obtainable Market)</div>
                  <div className="text-3xl font-black">~1.8 млрд ₽</div>
                  <p className="text-xs text-emerald-500 bg-white/20 p-1 rounded mt-2 inline-block">Наша цель на 3 года (15% от SAM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Драйверы роста рынка
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Обязательный ТИМ (BIM)</div>
                  <p className="text-xs text-slate-500">С 1 января 2025 года ТИМ обязателен для всех проектов ИЖС.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Приказ №344/пр</div>
                  <p className="text-xs text-slate-500">Переход на электронный документооборот в строительстве становится стандартом.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
