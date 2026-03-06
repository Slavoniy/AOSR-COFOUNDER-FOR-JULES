import React from 'react';
import { motion } from 'motion/react';
import { HardHat, ChevronRight, Settings, FileText } from 'lucide-react';
import { Vector } from '../../modules/shared/domain/types';
import { VECTORS } from '../../modules/shared/domain/constants';

interface HomeViewProps {
  onSelectVector: (id: number) => void;
  selectedVector: number | null;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectVector, selectedVector }) => {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl w-full space-y-8 mt-12"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-4">
          <HardHat className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Привет! Я твой <span className="text-blue-600">AI-кофаундер</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Я помогу тебе спроектировать и запустить SaaS-сервис для автоматизации исполнительной документации в строительстве. С чего начнем?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VECTORS.map((vector: Vector) => (
          <motion.button
            key={vector.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectVector(vector.id)}
            className={`flex items-start p-6 bg-white rounded-2xl border transition-all text-left group
              ${selectedVector === vector.id
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
          >
            <div className={`p-3 rounded-xl ${vector.color} text-white mr-4 shrink-0`}>
              {vector.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {vector.id}. {vector.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {vector.description}
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 mt-1 transition-transform ${selectedVector === vector.id ? 'text-blue-500 translate-x-1' : 'text-slate-300'}`} />
          </motion.button>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Settings className="w-4 h-4" />
          <span>PropTech Strategy v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FileText className="w-4 h-4" />
            <span>Нормативы: Приказ №344/пр</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
