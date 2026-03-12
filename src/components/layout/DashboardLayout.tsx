import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BookOpenCheck,
  BookMarked,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { authService } from '../../modules/auth/application/authService';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/dashboard/objects', icon: Building2, label: 'Объекты' },
    { to: '/dashboard/registry', icon: BookOpenCheck, label: 'Журнал актов' },
    { to: '/dashboard/dictionaries', icon: BookMarked, label: 'Справочники' },
    { to: '/dashboard/settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Building2 className="w-6 h-6 text-blue-500 mr-2 drop-shadow-sm" />
          <span className="text-xl font-bold text-white tracking-wide">StroyDoc AI</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'} // exact match for dashboard home
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold mr-3 border border-slate-700 shadow-sm">
              {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Пользователь'}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {user?.role === 'ADMIN' ? 'Администратор' : 'Инженер ПТО'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-colors group"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
