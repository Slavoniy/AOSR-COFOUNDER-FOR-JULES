import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Target, Zap, FileText, Users } from 'lucide-react';
import { COMPETITORS } from '../../../modules/shared/domain/constants';

interface AnalysisViewProps {
  onBack: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ onBack }) => {
  return (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
        <h2 className="text-3xl font-bold text-slate-900">Анализ конкурентов и УЦП</h2>
        <p className="text-slate-600">Изучаем ландшафт рынка PropTech РФ и ищем наше "окно возможностей".</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COMPETITORS.map((comp) => (
          <div key={comp.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{comp.name}</h3>
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Фокус: {comp.focus}</div>
              <div className="text-sm font-bold text-blue-600">Цена: {comp.pricing}</div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Сильные стороны
                </div>
                <ul className="text-sm text-slate-600 space-y-1 pl-6 list-disc">
                  {comp.strengths.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                  <AlertCircle className="w-4 h-4" /> Слабые стороны
                </div>
                <ul className="text-sm text-slate-600 space-y-1 pl-6 list-disc">
                  {comp.weaknesses.map(w => <li key={w}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap className="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-800 rounded-full text-xs font-bold uppercase tracking-widest">
            <Target className="w-3 h-3" /> Наше преимущество (УЦП)
          </div>
          <h3 className="text-2xl font-bold">Где мы можем победить?</h3>
          <p className="text-blue-100 max-w-2xl">
            Рынок поделен между сложными "комбайнами" для гигантов и простыми Excel-таблицами. Наша гипотеза: **"Облачный AI-автопилот"** — удобство Excel, но с мощью нейросетей и мобильностью.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Скорость
              </h4>
              <p className="text-sm text-blue-100">Генерация АОСР за 30 секунд на основе фото со стройплощадки и распознавания текста.</p>
            </div>
            <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" /> Сметный модуль
              </h4>
              <p className="text-sm text-blue-100">Автоматическая генерация АОСР напрямую из сметы (Excel/Гранд-Смета) — связываем деньги и документы.</p>
            </div>
            <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Доступность
              </h4>
              <p className="text-sm text-blue-100">Модель "Pay-as-you-go" (490 ₽/акт) — дешевле и быстрее, чем нанимать фрилансера или покупать сложные лицензии.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
