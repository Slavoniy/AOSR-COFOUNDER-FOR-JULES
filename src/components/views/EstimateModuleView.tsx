import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, ShieldCheck, Zap, Loader2, Upload, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Project, ActDetail } from '../../modules/shared/domain/types';
import { aiService } from '../../modules/ai-engine/infrastructure/aiService';
import { documentService } from '../../modules/documents/application/documentService';

interface EstimateModuleViewProps {
  activeProject: Project | null;
  activeProjectId: string | null;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  actDetails: any;
  setActDetails: React.Dispatch<React.SetStateAction<any>>;
  onComplete: () => void;
  onBack: () => void;
  initialStep?: 'upload' | 'selection' | 'mapping' | 'preview';
}

export const EstimateModuleView: React.FC<EstimateModuleViewProps> = ({
  activeProject,
  activeProjectId,
  projects,
  setProjects,
  actDetails,
  setActDetails,
  onComplete,
  onBack,
  initialStep = 'upload'
}) => {
  const [estimateStep, setEstimateStep] = useState<'upload' | 'selection' | 'mapping' | 'preview'>(initialStep);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [useColumns, setUseColumns] = useState({ name: true, unit: true, amount: true });
  const [estimateData, setEstimateData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanningOrder, setIsScanningOrder] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    estimateParsing?: number;
    orderScanning?: number;
    materialAnalysis?: number;
  }>({});
  const [currentActIndex, setCurrentActIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estimateStep === 'preview' && selectedRows.length > 0) {
      const currentWork = estimateData.find(r => r.id === selectedRows[currentActIndex]);
      if (currentWork && currentWork.materialsAI) {
        setActDetails((prev: any) => ({
          ...prev,
          materials: currentWork.materialsAI
        }));
      }
    }
  }, [currentActIndex, estimateStep, selectedRows, estimateData, setActDetails]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const startTime = Date.now();
    try {
      setActDetails((prev: any) => ({ ...prev, workName: '' }));
      const parsed = await documentService.parseEstimate(file);

      setPerformanceMetrics(prev => ({ ...prev, estimateParsing: Date.now() - startTime }));
      setEstimateData(parsed);
      setEstimateStep('selection');
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Ошибка при чтении файла.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOrderScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningOrder(true);
    const startTime = Date.now();
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const data = await aiService.generateJSON<any>([
        {
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        },
        {
          text: `Это приказ о назначении ответственных лиц на стройке.
          Найди и выдели:
          1. Название организации.
          2. Номер и дату приказа.
          3. ФИО и должность ответственного за строительный контроль (технадзор).
          4. ФИО и должность ответственного за производство работ (прораб).
          Верни данные в формате JSON: {org, orderNum, orderDate, repSk, repWork}.`,
        },
      ]);

      setActDetails((prev: any) => ({
        ...prev,
        developer: data.org || prev.developer,
        repDeveloper: `${data.repSk || 'Инженер СК'}, Приказ №${data.orderNum || ''} от ${data.orderDate || ''}`,
        repContractor: `${data.repWork || 'Прораб'}, Приказ №${data.orderNum || ''} от ${data.orderDate || ''}`
      }));

      setPerformanceMetrics(prev => ({ ...prev, orderScanning: Date.now() - startTime }));
      alert("Данные из приказа успешно извлечены и добавлены в шаблон!");
    } catch (error) {
      console.error("Order scan error:", error);
      alert("Не удалось распознать приказ. Попробуйте более четкое фото.");
    } finally {
      setIsScanningOrder(false);
    }
  };

  const toggleRow = (id: number) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedRows.length === estimateData.length) setSelectedRows([]);
    else setSelectedRows(estimateData.map(r => r.id));
  };

  const analyzeMaterials = async () => {
    if (selectedRows.length === 0) return;

    setIsAnalyzing(true);
    const startTime = Date.now();
    try {
      const updatedEstimateData = [...estimateData];
      const selectedWorks = updatedEstimateData.filter(row => selectedRows.includes(row.id));

      const newActs: ActDetail[] = [];

      for (const work of selectedWorks) {
        const existingMaterials = work.materials?.join(', ') || '';

        let aiData = { materials: '', nextWorks: '', standards: '' };
        try {
          aiData = await aiService.generateJSON<any>(`Ты - эксперт ПТО. Проанализируй работу и предложи данные для АОСР.
            Работа: "${work.name}"
            ${existingMaterials ? `Материалы из сметы: ${existingMaterials}` : ''}
            Верни ТОЛЬКО JSON: {
              "materials": "Материал (ГОСТ/Сертификат)",
              "nextWorks": "какая работа обычно идет следующей",
              "standards": "основной СП или ГОСТ для этой работы"
            }`);
        } catch (e) {
          console.warn(`AI Analysis failed for work: ${work.name}, using fallback`, e);
          const materials = work.materials?.length ? work.materials.join(', ') : 'Материалы согласно проекту';
          aiData = {
            materials: materials,
            nextWorks: 'Следующий технологический этап',
            standards: 'СП 70.13330.2012'
          };
        }

        newActs.push({
          id: Math.random().toString(36).substr(2, 9),
          number: (projects.find(p => p.id === activeProjectId)?.acts.length || 0) + newActs.length + 1 + '',
          workName: work.name,
          unit: work.unit,
          amount: work.amount,
          scheme: `Исполнительная схема №${(projects.find(p => p.id === activeProjectId)?.acts.length || 0) + newActs.length + 1}`,
          nextWorks: aiData.nextWorks || 'Следующий этап',
          materials: aiData.materials || 'Материалы не определены',
          startDate: '01', startMonth: 'марта', startYear: '2026',
          endDate: '10', endMonth: 'марта', endYear: '2026',
          standards: aiData.standards || 'СП ...',
          status: 'draft'
        });
      }

      if (activeProjectId) {
        setProjects(prev => prev.map(p =>
          p.id === activeProjectId
            ? { ...p, acts: [...p.acts, ...newActs] }
            : p
        ));
      }

      setPerformanceMetrics(prev => ({ ...prev, materialAnalysis: Date.now() - startTime }));
      setEstimateStep('mapping');
    } catch (error) {
      console.error("AI Analysis error:", error);
      setEstimateStep('mapping');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        {['upload', 'selection', 'mapping', 'preview'].map((step, idx) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              estimateStep === step ? 'bg-blue-600 text-white' :
              ['upload', 'selection', 'mapping', 'preview'].indexOf(estimateStep) > idx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {idx + 1}
            </div>
            {idx < 3 && <div className={`w-12 h-0.5 mx-2 ${['upload', 'selection', 'mapping', 'preview'].indexOf(estimateStep) > idx ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {estimateStep === 'upload' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx, .xls, .xml, .csv"
              />
              <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">1. Загрузите смету</p>
                <p className="text-sm text-slate-500">AI определит структуру работ</p>
              </div>
            </div>

            <div
              onClick={() => orderInputRef.current?.click()}
              className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer group"
            >
              <input
                type="file"
                ref={orderInputRef}
                onChange={handleOrderScan}
                className="hidden"
                accept="image/*, .pdf"
              />
              <div className="p-4 bg-rose-50 rounded-full text-rose-600 group-hover:scale-110 transition-transform">
                {isScanningOrder ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8" />}
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">2. Сканируйте приказы</p>
                <p className="text-sm text-slate-500">Авто-заполнение ответственных</p>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  setEstimateData([
                    { id: 1, name: "Разработка грунта в траншеях", unit: "100 м3", amount: "1.25" },
                    { id: 2, name: "Устройство песчаного основания", unit: "м3", amount: "45.0" },
                    { id: 3, name: "Укладка трубопровода ПНД 110мм", unit: "м", amount: "120.0" },
                    { id: 4, name: "Обратная засыпка пазух", unit: "м3", amount: "38.5" },
                  ]);
                  setEstimateStep('selection');
                }}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg"
              >
                Использовать демо-данные
              </button>
            </div>
          </div>
        )}

        {estimateStep === 'selection' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Выбор данных из сметы</h3>
              <p className="text-slate-500 text-sm">Система распознала колонки. Выберите нужные строки для акта.</p>
            </div>

            {/* Column Selection */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">1. Выберите колонки для использования в акте:</h4>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useColumns.name}
                    onChange={() => setUseColumns(prev => ({ ...prev, name: !prev.name }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Наименование</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useColumns.unit}
                    onChange={() => setUseColumns(prev => ({ ...prev, unit: !prev.unit }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Ед. изм.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useColumns.amount}
                    onChange={() => setUseColumns(prev => ({ ...prev, amount: !prev.amount }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Количество</span>
                </label>
              </div>
            </div>

            {/* Row Selection Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">2. Выберите строки для создания акта:</h4>
                <button
                  onClick={toggleAll}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  {selectedRows.length === estimateData.length ? 'Снять все' : 'Выбрать все'}
                </button>
              </div>

              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-bottom border-slate-100">
                    <tr>
                      <th className="p-4 w-10"></th>
                      <th className="p-4 font-semibold text-slate-600">Наименование</th>
                      <th className="p-4 font-semibold text-slate-600">Ед. изм.</th>
                      <th className="p-4 font-semibold text-slate-600">Кол-во</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {estimateData.map((row) => (
                      <tr
                        key={row.id}
                        className={`transition-colors cursor-pointer ${selectedRows.includes(row.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                        onClick={() => toggleRow(row.id)}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(row.id)}
                            onChange={() => {}} // Handled by row click
                            className="w-4 h-4 rounded border-slate-300 text-blue-600"
                          />
                        </td>
                        <td className={`p-4 font-medium ${useColumns.name ? 'text-slate-900' : 'text-slate-300 line-through'}`}>
                          <div>{row.name}</div>
                          {row.materials && row.materials.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {row.materials.map((m: string, i: number) => (
                                <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className={`p-4 ${useColumns.unit ? 'text-slate-600' : 'text-slate-300 line-through'}`}>
                          {row.unit}
                        </td>
                        <td className={`p-4 font-mono ${useColumns.amount ? 'text-slate-600' : 'text-slate-300 line-through'}`}>
                          {row.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Выбрано строк: <span className="font-bold text-blue-600">{selectedRows.length}</span>
              </div>
              <button
                disabled={selectedRows.length === 0 || isAnalyzing}
                onClick={analyzeMaterials}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI анализирует материалы...
                  </>
                ) : (
                  <>
                    Далее: Привязка к шаблону
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {estimateStep === 'mapping' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Привязка к шаблону АОСР</h3>
              <p className="text-slate-500 text-sm">Мы автоматически сопоставили данные. Проверьте связи перед генерацией.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Source Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Поля из сметы:</h4>
                {['Наименование', 'Ед. изм.', 'Количество'].map(field => (
                  <div key={field} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700">{field}</span>
                    <div className="w-6 h-0.5 bg-blue-400 group-hover:w-12 transition-all" />
                  </div>
                ))}
              </div>

              {/* Target Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Поля шаблона АОСР:</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">1. Наименование работ</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">3. Объем выполненных работ</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">3. Материалы (AI-экстракция)</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setEstimateStep('selection')}
                className="text-sm font-bold text-slate-500 hover:text-slate-900"
              >
                Назад
              </button>
              <button
                onClick={() => setEstimateStep('preview')}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                Сгенерировать черновик
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {estimateStep === 'preview' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">Предпросмотр АОСР</h3>
                <p className="text-slate-500 text-sm">
                  Сформировано актов: <span className="font-bold text-blue-600">{selectedRows.length || 1}</span>.
                </p>
              </div>

              {selectedRows.length > 1 && (
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <button
                    disabled={currentActIndex === 0}
                    onClick={() => setCurrentActIndex(prev => prev - 1)}
                    className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="text-sm font-bold text-slate-700 min-w-[80px] text-center">
                    Акт {currentActIndex + 1} из {selectedRows.length}
                  </div>
                  <button
                    disabled={currentActIndex === selectedRows.length - 1}
                    onClick={() => setCurrentActIndex(prev => prev + 1)}
                    className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Official Document Template (Order 344/pr) - High Fidelity */}
            <div id="aosr-document" className="bg-white p-12 border border-slate-300 rounded-sm shadow-2xl font-serif text-[10px] leading-[1.1] space-y-3 max-w-4xl mx-auto text-black overflow-y-auto max-h-[850px] print:p-0 print:shadow-none print:border-none print:max-h-none">
              {/* Top Right Header */}
              <div className="text-right text-[9px] mb-6 leading-tight">
                Приказ Минстроя №344/пр от 16.05.2023<br />
                приложение №3
              </div>

              {/* Section: Object */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="whitespace-nowrap">Объект капитального строительства</span>
                  <input
                    className="flex-1 border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50"
                    value={actDetails.object}
                    onChange={(e) => setActDetails({...actDetails, object: e.target.value})}
                  />
                </div>
              </div>

              {/* Section: Developer */}
              <div className="space-y-1">
                <div className="font-bold leading-tight">
                  Застройщик, технический заказчик
                </div>
                <textarea
                  rows={2}
                  className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                  value={actDetails.developer}
                  onChange={(e) => setActDetails({...actDetails, developer: e.target.value})}
                />
                <input
                  className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50"
                  value={actDetails.developerSro}
                  onChange={(e) => setActDetails({...actDetails, developerSro: e.target.value})}
                />
              </div>

              {/* Section: Contractor */}
              <div className="space-y-1">
                <div className="font-bold leading-tight">
                  Лицо, осуществляющее строительство
                </div>
                <textarea
                  rows={1}
                  className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                  value={actDetails.contractor}
                  onChange={(e) => setActDetails({...actDetails, contractor: e.target.value})}
                />
                <input
                  className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50"
                  value={actDetails.contractorSro}
                  onChange={(e) => setActDetails({...actDetails, contractorSro: e.target.value})}
                />
              </div>

              {/* Title */}
              <div className="text-center pt-6 space-y-1">
                <div className="font-bold text-sm">АКТ</div>
                <div className="font-bold text-sm">освидетельствования скрытых работ</div>
              </div>

              {/* Number and Date */}
              <div className="flex justify-between items-end pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-bold">№</span>
                  <input
                    className="border-b border-black w-32 px-2 bg-blue-50/30 text-center outline-none"
                    value={`${actDetails.numberPrefix}${currentActIndex + 1}`}
                    onChange={(e) => setActDetails({...actDetails, numberPrefix: e.target.value})}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span>"</span>
                    <input className="border-b border-black w-8 text-center bg-blue-50/30 outline-none" value={actDetails.date} onChange={(e) => setActDetails({...actDetails, date: e.target.value})} />
                    <span>"</span>
                    <input className="border-b border-black w-24 text-center bg-blue-50/30 outline-none" value={actDetails.month} onChange={(e) => setActDetails({...actDetails, month: e.target.value})} />
                    <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.year} onChange={(e) => setActDetails({...actDetails, year: e.target.value})} />
                    <span>г.</span>
                  </div>
                </div>
              </div>

              <div className="font-bold pt-2">составили настоящий акт о нижеследующем:</div>

              {/* Numbered Items */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="font-bold">1. К освидетельствованию предъявлены следующие работы:</div>
                  <div className="border-b border-black min-h-[2.4em] px-2 bg-yellow-50/50 font-bold">
                    {actDetails.workName || (selectedRows.length > 0 ? (
                      estimateData.find(r => r.id === selectedRows[currentActIndex])?.name
                    ) : 'Работы не выбраны')}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold">2. Работы выполнены по проектной документации</div>
                  <textarea
                    rows={1}
                    className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                    value={actDetails.projectDoc}
                    onChange={(e) => setActDetails({...actDetails, projectDoc: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <div className="font-bold">3. При выполнении работ применены</div>
                  <textarea
                    rows={2}
                    className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                    value={actDetails.materials}
                    onChange={(e) => setActDetails({...actDetails, materials: e.target.value})}
                  />
                </div>

                <div className="flex gap-12">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold">5. Даты: начала работ</span>
                    <input className="border-b border-black w-8 text-center bg-blue-50/30 outline-none" value={actDetails.startDate} onChange={(e) => setActDetails({...actDetails, startDate: e.target.value})} />
                    <input className="border-b border-black w-24 text-center bg-blue-50/30 outline-none" value={actDetails.startMonth} onChange={(e) => setActDetails({...actDetails, startMonth: e.target.value})} />
                    <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.startYear} onChange={(e) => setActDetails({...actDetails, startYear: e.target.value})} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold">окончания работ</span>
                    <input className="border-b border-black w-8 text-center bg-blue-50/30 outline-none" value={actDetails.endDate} onChange={(e) => setActDetails({...actDetails, endDate: e.target.value})} />
                    <input className="border-b border-black w-24 text-center bg-blue-50/30 outline-none" value={actDetails.endMonth} onChange={(e) => setActDetails({...actDetails, endMonth: e.target.value})} />
                    <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.endYear} onChange={(e) => setActDetails({...actDetails, endYear: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold">7. Разрешается производство последующих работ</div>
                  <textarea
                    rows={1}
                    className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                    value={actDetails.nextWorks}
                    onChange={(e) => setActDetails({...actDetails, nextWorks: e.target.value})}
                  />
                </div>
              </div>

              {/* Bottom Signatures */}
              <div className="pt-8 space-y-6">
                {[
                  { label: "Представитель застройщика...", name: actDetails.repDeveloper.split(',')[1]?.trim() || "Иванов И.И." },
                  { label: "Представитель подрядчика...", name: actDetails.repContractor.split(',')[1]?.trim() || "Петров П.П." },
                ].map((sig, i) => (
                  <div key={i} className="space-y-1">
                    <div className="font-bold leading-tight">{sig.label}</div>
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 border-b border-black text-center text-[8px] bg-blue-50/30">{sig.name}</div>
                      <div className="w-32 border-b border-black"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setEstimateStep('mapping')}
                className="text-sm font-bold text-slate-500 hover:text-slate-900"
              >
                Изменить мэппинг
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Печать
                </button>
                <button
                  onClick={onComplete}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {estimateStep === 'selection' && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
          <Zap className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            **AI-подсказка:** Я проанализировал смету. Строки 1 и 2 обычно объединяются в один акт на земляные работы. Хотите сгруппировать?
          </p>
        </div>
      )}
    </motion.div>
  );
};
