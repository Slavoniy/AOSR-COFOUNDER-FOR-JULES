import React, { useState, useEffect } from 'react';
import { BarChart, Users, FileText, CheckCircle2 } from 'lucide-react';

export const DashboardHomeView: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Всего проектов', value: '12', icon: BarChart, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Сгенерировано актов', value: '145', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Подписано', value: '89', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Сотрудники', value: '4', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder for recent activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Недавняя активность</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center p-4 border border-gray-50 rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                <FileText className="w-8 h-8" />
             </div>
             <p className="text-gray-500 font-medium">Нет недавней активности</p>
          </div>
        )}
      </div>
    </div>
  );
};
