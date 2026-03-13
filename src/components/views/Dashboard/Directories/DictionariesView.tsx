import React, { useState } from 'react';
import { BookMarked, Users, Building, Plus } from 'lucide-react';

export const DictionariesView: React.FC<{user: any}> = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'signatories'>('companies');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Справочники</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 'companies' ? 'Создать карточку компании' : 'Создать карточку подписанта'}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {activeTab === 'companies' ? 'Новая компания' : 'Новый подписант'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <form className="space-y-4">
                {activeTab === 'companies' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Название компании <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder='ООО "Ромашка"' />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">ИНН / ОГРН</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="ИНН 7700000000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Данные СРО</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Номер в реестре..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Юридический адрес</label>
                      <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all h-20" placeholder="г. Москва, ул. Пушкина..." />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">ФИО <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Иванов Иван Иванович" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Должность</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Генеральный директор" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Основание полномочий</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Устав / Приказ №1" />
                    </div>
                  </>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
              >
                Отмена
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
