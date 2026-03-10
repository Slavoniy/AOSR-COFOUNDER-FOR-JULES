import React, { useState, useEffect } from 'react';
import { useProjects } from '../../../hooks/useProjects';
import { BookOpenCheck, Search, FileText } from 'lucide-react';
import { ActDetail } from '../../../modules/shared/domain/types';

export const RegistryView: React.FC<{user: any}> = ({ user }) => {
  const { projects } = useProjects(!!user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const allActs = projects.flatMap(p =>
    p.acts.map(act => ({ ...act, projectName: p.name }))
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Журнал актов</h1>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по актам..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center p-4 border border-gray-100 rounded-xl animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allActs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Журнал пуст</h3>
              <p className="text-gray-500 max-w-md">Здесь будут отображаться все сгенерированные и подписанные акты освидетельствования скрытых работ.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allActs.map(act => (
                <div key={act.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Акт №{act.number}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{act.workName}</p>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                        {act.projectName}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      act.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {act.status === 'signed' ? 'Подписан' : 'Черновик'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {act.startDate} - {act.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
