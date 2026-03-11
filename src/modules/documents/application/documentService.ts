/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eventBus } from '../../shared/infrastructure/eventBus';

export class DocumentService {
  async parseEstimate(file: File): Promise<any[]> {
    eventBus.emit('document:parsing:start', { fileName: file.name });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const excelResponse = await fetch('/api/estimates/parse-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (!excelResponse.ok) {
        let errMsg = `Server returned ${excelResponse.status}`;
        try {
          const errBody = await excelResponse.json();
          if (errBody.error) errMsg = errBody.error;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const { rawData } = await excelResponse.json();

      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
         throw new Error("No data found in excel file.");
      }

      const CHUNK_SIZE = 20;
      const headerRows = rawData.slice(0, 1);
      const dataRows = rawData.slice(1);
      let allData: any[] = [];
      let warningMsg = '';

      const totalChunks = Math.ceil(dataRows.length / CHUNK_SIZE);

      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
         const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
         const chunk = dataRows.slice(i, i + CHUNK_SIZE);
         const chunkWithHeaders = [...headerRows, ...chunk];

         try {
            const chunkRes = await fetch('/api/estimates/process-chunk', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
               body: JSON.stringify({ chunk: chunkWithHeaders })
            });

            if (!chunkRes.ok) throw new Error("Chunk parsing failed");

            const chunkResult = await chunkRes.json();
            const parsedChunk = chunkResult.data || [];
            allData = allData.concat(parsedChunk);
            if (chunkResult.warning) warningMsg = chunkResult.warning;

            eventBus.emit('document:parsing:progress', { parsedChunk, chunkIndex, totalChunks, accumulatedData: allData });
         } catch (e: any) {
            console.error(`Failed to parse chunk ${chunkIndex}:`, e);
            const errorRow = { id: `err-${i}`, workName: `Error parsing rows ${i + 2}-${i + 1 + chunk.length}. Please fill manually.`, materials: 'Error', quantity: 0, unit: '-' };
            allData.push(errorRow);
            eventBus.emit('document:parsing:progress', { parsedChunk: [errorRow], chunkIndex, totalChunks, accumulatedData: allData });
         }
      }

      eventBus.emit('document:parsing:success', { count: allData.length, warning: warningMsg });
      return { data: allData, warning: warningMsg } as any;
    } catch (error) {
      eventBus.emit('document:parsing:error', { error });
      throw error;
    }
  }

  generateAct(project: any, actDetail: any) {
    // Logic for generating act PDF/Doc can go here
    eventBus.emit('document:act:generated', { actDetail });
  }
}

export const documentService = new DocumentService();
