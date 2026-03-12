import React from 'react';
import { User as UserIcon, Mail, Shield, Building2 } from 'lucide-react';

interface ProfileViewProps {
  user: any;
}

export const DashboardProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-5xl shadow-inner border-4 border-white">
          {user?.name?.charAt(0) || <UserIcon className="w-16 h-16" />}
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{user?.name || 'Пользователь'}</h1>
            <p className="text-lg text-slate-500 mt-1">Профиль пользователя</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                <p className="font-medium text-slate-900">{user?.email || 'Не указан'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Роль</p>
                <p className="font-medium text-slate-900">{user?.role === 'ADMIN' ? 'Администратор системы' : 'Инженер ПТО'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
         <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            Организация
         </h2>
         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
            <p className="text-slate-500">Управление организацией будет доступно в следующих обновлениях.</p>
         </div>
      </div>
    </div>
  );
};
