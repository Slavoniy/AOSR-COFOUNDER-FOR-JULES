import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Building2,
  BookOpenCheck,
  BookMarked,
  Settings,
  LogOut,
  User as UserIcon,
  Bell,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { authService } from '../../modules/auth/application/authService';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    fetchProjects();
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/my-projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
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

        <div className="px-4 pt-4 relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Уведомления</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-80 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-slate-900 text-sm">Уведомления</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Прочитать все
                  </button>
                )}
              </div>
              <div className="overflow-y-auto p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-3 rounded-lg text-sm ${notif.is_read ? 'bg-white' : 'bg-blue-50'} border border-transparent hover:border-slate-100 transition-colors`}>
                      <div className="font-bold text-slate-900 mb-0.5 flex items-start justify-between">
                         <span>{notif.title}</span>
                         {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
                      </div>
                      <div className="text-slate-600 text-xs leading-relaxed">{notif.message}</div>
                      <div className="text-slate-400 text-[10px] mt-2">
                        {new Date(notif.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">Нет уведомлений</div>
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0 transition-colors" />
            Дашборд
          </NavLink>

          <div className="space-y-1">
            <button
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-3 flex-shrink-0" />
                Объекты
              </div>
              {isProjectsExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isProjectsExpanded && (
              <div className="pl-4 space-y-1 mt-1">
                <NavLink
                  to="/dashboard/objects"
                  end
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  Все объекты
                </NavLink>
                {projects.map(project => (
                  <NavLink
                    key={project.id}
                    to={`/dashboard/objects/${project.id}`}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 truncate ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    {project.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {navItems.filter(i => i.to !== '/dashboard').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col space-y-2 mb-4 px-2">
            <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm">
              <HelpCircle className="w-4 h-4" /> Справка
            </div>
            <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm">
              <MessageSquare className="w-4 h-4" /> Обратная связь
            </div>
          </div>

          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => `flex items-center px-2 py-2 rounded-xl transition-colors cursor-pointer group ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/80'}`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-blue-400 font-bold mr-3 border border-slate-700 shadow-sm transition-colors">
              {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-blue-100 transition-colors">
                {user?.name || 'Пользователь'}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {user?.role === 'ADMIN' ? 'Администратор системы' : 'Инженер ПТО'}
              </p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-colors group"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
            Выйти
          </button>

          <div className="mt-4 flex items-center gap-3 px-2 pt-4 border-t border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              СМ
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">ООО "СпецМонтаж"</div>
              <div className="text-[10px] text-slate-500">ИНН 7701234567</div>
            </div>
          </div>
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
