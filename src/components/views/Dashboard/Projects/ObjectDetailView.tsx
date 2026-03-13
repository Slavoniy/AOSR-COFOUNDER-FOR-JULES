import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../../../hooks/useProjects';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2, Search, Filter } from 'lucide-react';
import { EditableActTable, EstimateDataRow } from '../../../views/Dashboard/EditableActTable';
import { eventBus } from '../../../../modules/shared/infrastructure/eventBus';
import { documentService } from '../../../../modules/documents/application/documentService';
import { Pagination } from '../../../ui/Pagination';
import { ActCreateForm } from '../../Acts/ActCreateForm';

interface ObjectDetailViewProps {
  user: any;
}

export const ObjectDetailView: React.FC<ObjectDetailViewProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, setProjects } = useProjects(!!user);

  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'estimates' | 'documents'>('general');
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<EstimateDataRow[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ processed: number, total: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Pagination & Filters for the acts/estimates table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreatingAct, setIsCreatingAct] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dictionaries state
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedDesigner, setSelectedDesigner] = useState('');

  // Mock dictionaries for now
  const developers = ['ООО "ГлавСтройИнвест"', 'АО "СтройТрест"'];
  const contractors = ['ООО "СпецМонтажСтрой"', 'ООО "Альянс"'];
  const designers = ['ООО "ПроектЦентр"', 'ЗАО "ИнжПроект"'];

  useEffect(() => {
    if ((projects || []).length > 0) {
      const found = (projects || []).find(p => p.id === id);
      setProject(found || null);
    }
  }, [id, projects]);

  // Client-side filtering and pagination
  const filteredData = useMemo(() => {
    return (parsedData || []).filter(item => {
      const matchesSearch = item.workName?.toLowerCase().includes(searchQuery.toLowerCase());
      // Note: Add status property mapping here when parsing is updated; returning true if 'all' for now
      const matchesStatus = statusFilter === 'all' || (item as any).status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [parsedData, searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return (filteredData || []).slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((filteredData || []).length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const handleProgress = (data: any) => {
      setUploadProgress({ processed: data.chunkIndex, total: data.totalChunks });
      setParsedData(data.accumulatedData.map((item: any, index: number) => ({
        id: `row-${index}`,
        workName: item.workName,
        materials: item.materials || 'Материалы согласно проекту',
        quantity: item.quantity,
        unit: item.unit
      })));
    };
    eventBus.on('document:parsing:progress', handleProgress);
    return () => eventBus.off('document:parsing:progress', handleProgress);
  }, []);

  if (!project && (projects || []).length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!project) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/dashboard/objects')} className="flex items-center text-blue-600 mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Вернуться к списку
        </button>
        <h2 className="text-xl font-bold">Объект не найден</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 ${
          toastMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          toastMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-green-50 border-green-200 text-green-800'
        }`}>
          {toastMessage.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/objects')}
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-sm text-slate-500">{project.object}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Общая информация
        </button>
        <button
          onClick={() => setActiveTab('estimates')}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'estimates' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Сметы и акты
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'documents' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Документы
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex-1 flex flex-col overflow-hidden">
        {activeTab === 'general' && (
          <div className="space-y-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900">Сведения об объекте</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Застройщик</div>
                <div className="font-bold text-slate-900">{project.developer?.name || 'Не указан'}</div>
                <div className="text-sm text-slate-500 mt-1">{project.developer?.requisites}</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Генподрядчик</div>
                <div className="font-bold text-slate-900">{project.contractor?.name || 'Не указан'}</div>
                <div className="text-sm text-slate-500 mt-1">{project.contractor?.requisites}</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Проектировщик</div>
                <div className="font-bold text-slate-900">{project.designer?.name || 'Не указан'}</div>
                <div className="text-sm text-slate-500 mt-1">{project.designer?.requisites}</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Статистика</div>
                <div className="font-bold text-slate-900">Актов: {project.acts?.length || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <FileText className="w-16 h-16 text-slate-300" />
            <p className="text-lg">Раздел архива документов в разработке</p>
          </div>
        )}

        {activeTab === 'estimates' && (
          <>
            {isCreatingAct ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full overflow-y-auto">
                <ActCreateForm
                  onSubmit={(data) => {
                    console.log('Act created:', data);
                    setIsCreatingAct(false);
                    setToastMessage({ text: 'Акт успешно создан', type: 'success' });
                  }}
                  onCancel={() => setIsCreatingAct(false)}
                />
              </div>
            ) : (parsedData || []).length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors group mb-6 flex-1">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900">Анализируем смету...</h4>
                    <p className="text-sm text-gray-500">Пожалуйста, подождите, ИИ извлекает работы и материалы.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <label className="flex flex-col items-center justify-center w-full cursor-pointer mb-6">
                      <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-105 transition-transform">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-1">Загрузите смету</h4>
                      <p className="text-sm text-gray-500 max-w-sm mb-4">
                        Перетащите файл Excel (.xlsx, .xls) или нажмите для выбора файла на устройстве
                      </p>
                      <div className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Выбрать файл
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          setUploadProgress(null);
                          try {
                            const response = await documentService.parseEstimate(file);
                            // Fallback support since documentService changed its return type
                            const respData = response as any;
                            const dataArray = Array.isArray(respData) ? respData : respData.data;

                            setParsedData(dataArray.map((item: any, index: number) => ({
                              id: `row-${index}`,
                              workName: item.workName,
                              materials: item.materials || 'Материалы согласно проекту',
                              quantity: item.quantity,
                              unit: item.unit
                            })));

                            if (!Array.isArray(respData) && respData.warning) {
                              setToastMessage({ text: respData.warning, type: 'warning' });
                            } else {
                              setToastMessage({ text: 'Смета успешно обработана', type: 'success' });
                            }
                          } catch (err: any) {
                            console.error('Upload error', err);
                            setToastMessage({ text: `Ошибка парсинга сметы: ${err.message}`, type: 'error' });
                          } finally {
                            setIsUploading(false);
                            setUploadProgress(null);
                            // Reset file input so same file can be selected again if needed
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>

                    <div className="flex items-center gap-4 w-full max-w-sm">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <span className="text-sm text-gray-500 font-medium">ИЛИ</span>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    <button
                      onClick={() => setIsCreatingAct(true)}
                      className="mt-6 bg-white border-2 border-blue-600 text-blue-600 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      + Создать акт вручную
                    </button>
                  </div>
                )}

                {isUploading && uploadProgress && (
                  <div className="mt-4 w-full max-w-sm mx-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Обработка строк...</span>
                      <span>{Math.round((uploadProgress.processed / uploadProgress.total) * 100)}% ({uploadProgress.processed} / {uploadProgress.total} частей)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-6">
                {/* Dictionaries Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Заказчик</label>
                    <select
                      value={selectedDeveloper}
                      onChange={e => setSelectedDeveloper(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Выберите заказчика...</option>
                      {developers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Подрядчик</label>
                    <select
                      value={selectedContractor}
                      onChange={e => setSelectedContractor(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Выберите подрядчика...</option>
                      {contractors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Проектировщик</label>
                    <select
                      value={selectedDesigner}
                      onChange={e => setSelectedDesigner(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Выберите проектировщика...</option>
                      {designers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Toolbar for Search and Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Поиск по наименованию работ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto bg-white"
                      >
                        <option value="all">Все статусы</option>
                        <option value="draft">Черновик (В работе)</option>
                        <option value="review">На проверке</option>
                        <option value="signed">Подписано</option>
                        <option value="rejected">Отклонено</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsCreatingAct(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      + Создать акт
                    </button>
                  </div>
                </div>

                {/* Editable Table */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <EditableActTable
                    data={paginatedData}
                    onChange={(updatedPaginatedData) => {
                      // Reconstruct full dataset
                      const newData = [...parsedData];
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      updatedPaginatedData.forEach((item, i) => {
                        newData[startIndex + i] = item;
                      });
                      setParsedData(newData);
                    }}
                  />
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setParsedData([]);
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedDeveloper || !selectedContractor) {
                        alert('Пожалуйста, выберите Заказчика и Подрядчика');
                        return;
                      }
                      if ((parsedData || []).length === 0) {
                        alert('Нет данных для генерации актов');
                        return;
                      }
                      // Generate logic placeholder
                      console.log("Generating with data:", { parsedData, selectedDeveloper, selectedContractor, selectedDesigner });
                      alert(`Готово к генерации! ${(parsedData || []).length} актов будет создано.`);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Подтвердить данные и сгенерировать
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
