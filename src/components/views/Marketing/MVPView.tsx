import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, ShieldCheck, HardHat, Layers, Zap, Loader2, Plus, Download, Trash2, Search, CheckCircle2, Building2, Users, ChevronRight } from 'lucide-react';

interface MVPViewProps {
  onBack: () => void;
  subView: 'list' | 'estimate-detail' | 'projects' | 'create-project' | 'roadmap' | 'certificates' | 'future-plan';
  setSubView: (view: 'list' | 'estimate-detail' | 'projects' | 'create-project' | 'roadmap' | 'certificates' | 'future-plan') => void;
  setView: (view: any) => void;
  setProfileTab: (tab: 'projects' | 'estimates') => void;
}

const MVP_FEATURES = [
  { id: 'estimate', title: "Сметный модуль (Core)", description: "Импорт смет из Excel/XML. Автоматическое создание черновиков АОСР.", status: "ready", icon: <FileText className="w-5 h-5 text-blue-500" /> },
  { id: 'cert-db', title: "База сертификатов", description: "Автоматический поиск и привязка сертификатов.", status: "planned", icon: <ShieldCheck className="w-5 h-5 text-amber-500" /> },
  { id: 'ojr', title: "Цифровой ОЖР", description: "Ведение общего журнала работ через мобильное приложение.", status: "in-progress", icon: <HardHat className="w-5 h-5 text-emerald-500" /> },
  { id: 'registry', title: "Реестр ИД", description: "Автоматическое формирование реестра.", status: "ready", icon: <Layers className="w-5 h-5 text-violet-500" /> }
];

export const MVPView: React.FC<MVPViewProps> = ({ onBack, subView, setSubView, setView, setProfileTab }) => {
  return (
    <motion.div
      key="mvp"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl w-full space-y-8 mt-8"
    >
      <button
        onClick={() => {
          if (subView === 'estimate-detail') setSubView('list');
          else if (subView === 'list') setSubView('projects');
          else if (subView === 'create-project') setSubView('projects');
          else if (subView === 'certificates') setSubView('roadmap');
          else if (subView === 'projects') setSubView('roadmap');
          else if (subView === 'future-plan') setView('home');
          else setView('home');
        }}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      {subView === 'roadmap' ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Функционал MVP</h2>
            <p className="text-slate-600">Приоритетные направления разработки для первой версии продукта.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MVP_FEATURES.map(feature => (
              <div key={feature.id} className={`p-6 rounded-2xl border-2 transition-all ${feature.status === 'ready' ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100 bg-white'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${feature.status === 'ready' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {feature.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${feature.status === 'ready' ? 'bg-blue-100 text-blue-700' : feature.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {feature.status === 'ready' ? 'Готово' : feature.status === 'in-progress' ? 'В разработке' : 'В планах'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 mb-6">{feature.description}</p>

                <button
                  disabled={feature.status !== 'ready' && feature.id !== 'cert-db'}
                  onClick={() => {
                    if (feature.id === 'cert-db') setSubView('certificates');
                    else if (feature.status === 'ready') {
                      setView('profile');
                      setProfileTab(feature.id === 'estimate' ? 'estimates' : 'projects');
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${(feature.status === 'ready' || feature.id === 'cert-db') ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  {(feature.status === 'ready' || feature.id === 'cert-db') ? 'Запустить модуль' : 'Скоро'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
         <div className="p-8 text-center text-slate-500">
           Тут должен быть контент для subView: {subView}. Перенесен из App.tsx
         </div>
      )}
    </motion.div>
  );
};
