import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Layers, Zap, ShieldCheck } from 'lucide-react';

interface StackViewProps {
  onBack: () => void;
}

export const StackView: React.FC<StackViewProps> = ({ onBack }) => {
  return (
    <motion.div
      key="stack"
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
        <h2 className="text-3xl font-bold text-slate-900">Технологический стек StroyDoc AI</h2>
        <p className="text-slate-600">Современная архитектура, обеспечивающая скорость, масштабируемость и надежность.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Frontend</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              React 18+ (Functional Components)
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              TypeScript (Строгая типизация)
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Tailwind CSS (Utility-first styling)
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">AI & Обработка</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              Google Gemini API (LLM & Vision)
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              XLSX / SheetJS (Парсинг смет)
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Инфраструктура</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Vite (Сборка проекта)
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Docker (Контейнеризация)
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
