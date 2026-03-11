#!/bin/bash
cat << 'INNER_EOF' > src/components/views/Dashboard/ObjectDetailView.tsx.patch
--- src/components/views/Dashboard/ObjectDetailView.tsx	2023-10-25 12:00:00.000000000 +0000
+++ src/components/views/Dashboard/ObjectDetailView.tsx	2023-10-25 12:00:00.000000000 +0000
@@ -5,6 +5,7 @@
 import React, { useState, useEffect } from 'react';
 import { useParams, useNavigate } from 'react-router-dom';
 import { ArrowLeft, Building2, Upload, FileText, CheckCircle, AlertTriangle, FileUp, X, Save, Edit2 } from 'lucide-react';
+import { eventBus } from '../../../modules/shared/infrastructure/eventBus';
 import { documentService } from '../../../modules/documents/application/documentService';
 import { useProjects } from '../../../hooks/useProjects';

@@ -21,6 +22,7 @@
   const [project, setProject] = useState<any>(null);
   const [isUploading, setIsUploading] = useState(false);
   const [parsedData, setParsedData] = useState<EstimateDataRow[]>([]);
+  const [uploadProgress, setUploadProgress] = useState<{ processed: number, total: number } | null>(null);
   const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

   // Dictionaries state
@@ -43,6 +45,21 @@
     }
   }, [id, projects]);

+  useEffect(() => {
+    const handleProgress = (data: any) => {
+      setUploadProgress({ processed: data.chunkIndex, total: data.totalChunks });
+      setParsedData(data.accumulatedData.map((item: any, index: number) => ({
+        id: \`row-\${index}\`,
+        workName: item.workName,
+        materials: item.materials || 'Материалы согласно проекту',
+        quantity: item.quantity,
+        unit: item.unit
+      })));
+    };
+    eventBus.on('document:parsing:progress', handleProgress);
+    return () => eventBus.off('document:parsing:progress', handleProgress);
+  }, []);
+
   useEffect(() => {
     if (toastMessage) {
       const timer = setTimeout(() => setToastMessage(null), 5000);
@@ -118,6 +135,7 @@
                     const file = e.target.files?.[0];
                     if (!file) return;
                     setIsUploading(true);
+                    setUploadProgress(null);
                     try {
                       const response = await documentService.parseEstimate(file);
                       // Fallback support since documentService changed its return type
@@ -140,6 +158,7 @@
                       setToastMessage({ text: \`Ошибка парсинга сметы: \${err.message}\`, type: 'error' });
                     } finally {
                       setIsUploading(false);
+                      setUploadProgress(null);
                       // Reset file input so same file can be selected again if needed
                       e.target.value = '';
                     }
@@ -148,6 +167,16 @@
               </label>
             </div>
           </div>
+          {isUploading && uploadProgress && (
+            <div className="mt-4 mb-4">
+              <div className="flex justify-between text-sm text-gray-600 mb-1">
+                <span>Обработка строк...</span>
+                <span>{Math.round((uploadProgress.processed / uploadProgress.total) * 100)}% ({uploadProgress.processed} / {uploadProgress.total} частей)</span>
+              </div>
+              <div className="w-full bg-gray-200 rounded-full h-2">
+                <div className="bg-blue-600 h-2 rounded-full" style={{ width: \`\${(uploadProgress.processed / uploadProgress.total) * 100}%\` }}></div>
+              </div>
+            </div>
+          )}

           {parsedData.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
INNER_EOF
patch src/components/views/Dashboard/ObjectDetailView.tsx < src/components/views/Dashboard/ObjectDetailView.tsx.patch
