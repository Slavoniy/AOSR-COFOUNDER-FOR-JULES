import React, { useState, useEffect } from 'react';
import { useProjects } from '../../../hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, FolderOpen, Search } from 'lucide-react';

interface ObjectsViewProps {
  user: any;
}

export const ObjectsView: React.FC<ObjectsViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const { projects, handleCreateProject } = useProjects(!!user);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObjectName, setNewObjectName] = useState('');
  const [newObjectAddress, setNewObjectAddress] = useState('');

  useEffect(() => {
    // Simulate loading for the skeleton effect
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [projects]);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectName.trim() || !newObjectAddress.trim()) return;

    await handleCreateProject(
      { name: newObjectName.trim(), object: newObjectAddress.trim() },
      (project) => {
        setIsModalOpen(false);
        setNewObjectName('');
        setNewObjectAddress('');
        navigate(`/dashboard/objects/${project.id}`);
      }
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Объекты</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать объект
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center p-4 border border-gray-100 rounded-xl animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Нет добавленных объектов</h3>
              <p className="text-gray-500 max-w-md mb-8">
                {search ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска." : "Создайте первый объект, чтобы начать работу с документацией и актами освидетельствования скрытых работ."}
              </p>
              {!search && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Создать первый объект
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredProjects.map(project => (
                 <div key={project.id} onClick={() => navigate(`/dashboard/objects/${project.id}`)} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white group">
                   <div className="flex items-start justify-between mb-4">
                     <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                       <Building2 className="w-6 h-6 text-blue-600" />
                     </div>
                     <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                       {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                     </span>
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{project.name}</h3>
                   <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{project.object}</p>

                   <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                     <div className="text-sm font-medium text-gray-700">
                       Актов: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-1">{project.acts.length}</span>
                     </div>
                     <span className="text-blue-600 text-sm font-medium hover:underline">Открыть</span>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Создать новый объект</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название объекта <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newObjectName}
                  onChange={(e) => setNewObjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Например: Жилой комплекс 'Звездный'"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес объекта <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newObjectAddress}
                  onChange={(e) => setNewObjectAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Например: г. Москва, ул. Ленина, д. 1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewObjectName('');
                    setNewObjectAddress('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!newObjectName.trim() || !newObjectAddress.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
