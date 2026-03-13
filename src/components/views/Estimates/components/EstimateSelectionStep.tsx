import React from 'react';
import { Search, Filter, CheckSquare, FileText } from 'lucide-react';

export const EstimateSelectionStep = ({ estimateData, selectedRows, toggleRow, toggleAll }: any) => (

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

            {isAnalyzing && uploadProgress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Обработка строк...</span>
                  <span>{Math.round((uploadProgress.processed / uploadProgress.total) * 100)}% ({uploadProgress.processed} / {uploadProgress.total} частей)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}></div>
                </div>
              </div>
            )}
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
);