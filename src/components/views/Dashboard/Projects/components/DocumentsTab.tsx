import React from 'react';
import { Project, Certificate, ActDetail } from '../../../../../modules/shared/domain/types';

export const DocumentsTab = ({ documents, setDocuments, setLocalError }: any) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        {/* icon placeholder */}
        <div className="text-blue-500 font-bold">PDF</div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Документация</h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">
        Здесь будут храниться загруженные сметы, чертежи и другие документы проекта.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Загрузить документ
      </button>
    </div>
  );
};
