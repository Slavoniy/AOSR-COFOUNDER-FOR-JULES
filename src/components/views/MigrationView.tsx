import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Layers, Zap, ShieldCheck, CheckCircle2, Settings } from 'lucide-react';

interface MigrationViewProps {
  onBack: () => void;
}

export const MigrationView: React.FC<MigrationViewProps> = ({ onBack }) => {
  return (
    <motion.div
      key="migration"
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
        <h2 className="text-3xl font-bold text-slate-900">Миграция на собственные сервера и РФ-стек</h2>
        <p className="text-slate-600">Стратегия обеспечения технологического суверенитета и соответствия требованиям ФЗ-152.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">1. Инфраструктура</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              Контейнеризация через Docker & K8s
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              База данных PostgreSQL (Managed в РФ)
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">2. Yandex Cloud AI</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              YandexGPT для анализа смет и приказов
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              Локальный инстанс в дата-центрах РФ
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">3. Безопасность</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              Соответствие ФЗ-152 (Персональные данные)
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              Интеграция с ЭЦП через КриптоПро
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-bold">Технический план миграции</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">1</div>
              <div className="font-bold">Backend Refactoring</div>
            </div>
            <p className="text-sm text-slate-400 ml-12">Замена Google GenAI SDK на API Yandex Cloud (YandexGPT v3). Настройка проксирования запросов.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">2</div>
              <div className="font-bold">Data Sovereignty</div>
            </div>
            <p className="text-sm text-slate-400 ml-12">Миграция всех хранилищ данных на территорию РФ. Настройка шифрования по ГОСТ.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
