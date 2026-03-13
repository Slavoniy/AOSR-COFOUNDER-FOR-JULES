import React, { useState } from 'react';
import { Building2, X, Plus } from 'lucide-react';
import { Button } from '../../../../ui/Button';

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (projectData: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSubmit, isLoading, error }) => {
  const [newProject, setNewProject] = useState({ name: '', object: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newProject);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Новый объект</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название объекта
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                placeholder="Например: ЖК Возрождение"
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес объекта
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                placeholder="г. Москва, ул. Ленина, д. 1"
                value={newProject.object}
                onChange={e => setNewProject({...newProject, object: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !newProject.name.trim() || !newProject.object.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {isLoading ? 'Создание...' : 'Создать объект'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
