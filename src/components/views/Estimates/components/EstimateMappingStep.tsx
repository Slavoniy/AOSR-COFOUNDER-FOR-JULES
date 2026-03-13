import React from 'react';
import { Play, AlertCircle, FileText } from 'lucide-react';

export const EstimateMappingStep = ({ isAnalyzing, performanceMetrics, analyzeMaterials }: any) => (

          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Привязка к шаблону АОСР</h3>
              <p className="text-slate-500 text-sm">Мы автоматически сопоставили данные. Проверьте связи перед генерацией.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Source Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Поля из сметы:</h4>
                {['Наименование', 'Ед. изм.', 'Количество'].map(field => (
                  <div key={field} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700">{field}</span>
                    <div className="w-6 h-0.5 bg-blue-400 group-hover:w-12 transition-all" />
                  </div>
                ))}
              </div>

              {/* Target Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Поля шаблона АОСР:</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">1. Наименование работ</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">3. Объем выполненных работ</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">3. Материалы (AI-экстракция)</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setEstimateStep('selection')}
                className="text-sm font-bold text-slate-500 hover:text-slate-900"
              >
                Назад
              </button>
              <button
                onClick={() => setEstimateStep('preview')}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                Сгенерировать черновик
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
);