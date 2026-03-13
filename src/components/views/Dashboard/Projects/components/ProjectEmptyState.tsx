import React from 'react';
import { FolderOpen } from 'lucide-react';

export const ProjectEmptyState = ({ debouncedSearch, onOpenModal }: any) => (
  <div className="h-full flex flex-col items-center justify-center text-center py-12 flex-1">
    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
      <FolderOpen className="w-10 h-10 text-blue-500" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">Нет добавленных объектов</h3>
    <p className="text-gray-500 max-w-md mb-8">
      {debouncedSearch ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска." : "Создайте первый объект, чтобы начать работу с документацией и актами освидетельствования скрытых работ."}
    </p>
    {!debouncedSearch && (
      <button
        onClick={onOpenModal}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        Создать первый объект
      </button>
    )}
  </div>
);
