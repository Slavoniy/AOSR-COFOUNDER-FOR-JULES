import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Zap, Layers, Target, BarChart3, Briefcase, CheckCircle2 } from 'lucide-react';
import { BMC_DATA } from '../../modules/shared/domain/constants';

interface BusinessViewProps {
  onBack: () => void;
}

const PRICING_TIERS = [
  { name: "Freemium", price: "0 ₽", features: ["До 3 АОСР в месяц", "Базовые шаблоны", "Мобильный ОЖР (чтение)"], highlight: false },
  { name: "Инженер (Solo)", price: "4 900 ₽/мес", features: ["Безлимит АОСР", "Сметный модуль (Core)", "Личный архив документов", "Экспорт в Word/PDF"], highlight: false },
  { name: "Команда (Pro)", price: "14 900 ₽/мес", features: ["До 5 пользователей", "Общий доступ к проектам", "Гостевой доступ для ГСН/Технадзора", "Полный ОЖР + Фотофиксация", "Приоритетная поддержка"], highlight: true },
  { name: "Разовый (Result)", price: "490 ₽/акт", features: ["Без абонентской платы", "Все функции Pro", "Идеально для фрилансеров", "Оплата за результат"], highlight: false }
];

export const BusinessView: React.FC<BusinessViewProps> = ({ onBack }) => {
  return (
    <motion.div
      key="business"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl w-full space-y-8 mt-8"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к выбору вектора
      </button>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Business Model Canvas</h2>
        <p className="text-slate-600">Стратегическое управление и проектирование бизнес-модели StroyDoc AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BMC_DATA.map((section, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              {section.icon}
              {section.title}
            </div>
            <ul className="text-sm text-slate-600 space-y-2">
              {section.items.map(item => (
                <li key={item} className="p-3 bg-slate-50 rounded-xl border border-slate-100">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200">
        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-xl">
          <BarChart3 className="w-6 h-6 text-blue-600" /> Детализация тарифной сетки (Гибридная модель)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div key={tier.name} className={`p-6 rounded-2xl border transition-all ${tier.highlight ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50'}`}>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{tier.name}</div>
              <div className="text-2xl font-black text-slate-900 mb-4">{tier.price}</div>
              <ul className="space-y-3">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
