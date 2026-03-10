import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../../hooks/useProjects';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { EditableActTable, EstimateDataRow } from './EditableActTable';
import { documentService } from '../../../modules/documents/application/documentService';

interface ObjectDetailViewProps {
  user: any;
}

export const ObjectDetailView: React.FC<ObjectDetailViewProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, setProjects } = useProjects(!!user);

  const [project, setProject] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<EstimateDataRow[]>([]);

  // Dictionaries state
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedDesigner, setSelectedDesigner] = useState('');

  // Mock dictionaries for now
  const developers = ['ООО "ГлавСтройИнвест"', 'АО "СтройТрест"'];
  const contractors = ['ООО "СпецМонтажСтрой"', 'ООО "Альянс"'];
  const designers = ['ООО "ПроектЦентр"', 'ЗАО "ИнжПроект"'];

  useEffect(() => {
    if (projects.length > 0) {
      const found = projects.find(p => p.id === id);
      setProject(found || null);
    }
  }, [id, projects]);

  if (!project && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/objects')}
          className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.object}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-4">Сметы и акты</h3>

        {parsedData.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group mb-6">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <h4 className="text-lg font-medium text-gray-900">Анализируем смету...</h4>
                <p className="text-sm text-gray-500">Пожалуйста, подождите, ИИ извлекает работы и материалы.</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
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
                    try {
                      const data = await documentService.parseEstimate(file);
                      setParsedData(data.map((item, index) => ({
                        id: `row-${index}`,
                        workName: item.workName,
                        materials: item.materials || 'Материалы согласно проекту',
                        quantity: item.quantity,
                        unit: item.unit
                      })));
                    } catch (err) {
                      console.error('Upload error', err);
                      alert('Ошибка парсинга сметы');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                />
              </label>
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

            {/* Editable Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <EditableActTable data={parsedData} onChange={setParsedData} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setParsedData([])}
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
                  if (parsedData.length === 0) {
                    alert('Нет данных для генерации актов');
                    return;
                  }
                  // Generate logic placeholder
                  console.log("Generating with data:", { parsedData, selectedDeveloper, selectedContractor, selectedDesigner });
                  alert(`Готово к генерации! ${parsedData.length} актов будет создано.`);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Подтвердить данные и сгенерировать
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
