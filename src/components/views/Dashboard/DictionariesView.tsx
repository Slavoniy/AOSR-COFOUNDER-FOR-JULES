import React, { useState } from 'react';
import { BookMarked, Users, Building, Plus } from 'lucide-react';

export const DictionariesView: React.FC<{user: any}> = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'signatories'>('companies');

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Справочники</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          {activeTab === 'companies' ? 'Добавить компанию' : 'Добавить подписанта'}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'companies'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Building className="w-5 h-5 mr-2" />
            Компании (Организации)
          </button>
          <button
            onClick={() => setActiveTab('signatories')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'signatories'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Подписанты (ФИО)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-50/30">
          <div className="text-center max-w-md">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <BookMarked className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'companies' ? 'Справочник компаний пуст' : 'Справочник подписантов пуст'}
            </h3>
            <p className="text-gray-500 mb-8">
              {activeTab === 'companies'
                ? 'Добавьте реквизиты Заказчика, Подрядчика или Проектировщика, чтобы использовать их при автоматической генерации актов.'
                : 'Сохраните ФИО, должности и документы-основания представителей, чтобы не вводить их каждый раз вручную.'}
            </p>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 'companies' ? 'Создать карточку компании' : 'Создать карточку подписанта'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
