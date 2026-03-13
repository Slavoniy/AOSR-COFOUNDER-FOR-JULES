import React from 'react';
import { Upload, FileSpreadsheet, Loader } from 'lucide-react';

export const EstimateUploadStep = ({ fileInputRef, handleFileUpload, isAnalyzing }: any) => (

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
);