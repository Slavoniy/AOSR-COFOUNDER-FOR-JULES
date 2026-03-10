import React from 'react';
import { Settings, User, ShieldCheck, Download } from 'lucide-react';
import { RoleGuard } from '../../layout/RoleGuard';

export const SettingsView: React.FC<{user: any}> = ({ user }) => {
  return (
    <div className="space-y-6 h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Настройки профиля</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-4xl shadow-inner">
            {user?.name?.charAt(0) || <User className="w-12 h-12" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Пользователь'}</h2>
            <p className="text-gray-500 mt-1">{user?.email || 'email@example.com'}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mt-3 border border-blue-100">
              {user?.role === 'ADMIN' ? 'Администратор системы' : 'Инженер ПТО'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* General Settings */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-400" />
              Общие настройки
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div>
                  <h4 className="font-medium text-gray-900">Уведомления на email</h4>
                  <p className="text-sm text-gray-500">Получать отчеты о сгенерированных актах</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Admin Section (RoleGuard Example) */}
          <RoleGuard allowedRoles={['ADMIN']} userRole={user?.role}>
            <section className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
              <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-orange-500" />
                Администрирование пространства
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Эта секция видна только администраторам. Здесь можно управлять доступом сотрудников к проектам и настраивать интеграции.
              </p>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm text-sm">
                Управление ролями
              </button>
            </section>
          </RoleGuard>
        </div>
      </div>
    </div>
  );
};
