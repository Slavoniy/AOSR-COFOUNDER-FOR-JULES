/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { aiService } from '../../ai-engine/infrastructure/aiService';

export interface EstimateRow {
  id: number;
  name: string;
  unit: string;
  amount: string;
  materialsAI?: string;
  isWork: boolean;
}

export class EstimateParser {
  /**
   * Parses an Excel file buffer and returns a lightweight 2D array of its contents.
   * Completely empty rows and columns are filtered out.
   */
  static parseExcelBuffer(buffer: Buffer): any[][] {
    // Read the workbook from the buffer
    const wb = XLSX.read(buffer, { type: 'buffer' });

    // Use the first sheet
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];

    // Convert sheet to a 2D array (array of arrays)
    const rawData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    if (!rawData || rawData.length === 0) {
      return [];
    }

    // Step 1: Remove completely empty rows
    const rowsWithData = rawData.filter((row: any[]) =>
      row && row.some(cell => cell !== undefined && cell !== null && cell !== '')
    );

    if (rowsWithData.length === 0) {
      return [];
    }

    // Determine the maximum number of columns across all rows
    const maxCols = Math.max(...rowsWithData.map((row: any[]) => row.length));

    // Step 2: Identify which columns are completely empty
    const colHasData = new Array(maxCols).fill(false);

    for (const row of rowsWithData) {
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        const cell = row[colIndex];
        if (cell !== undefined && cell !== null && cell !== '') {
          colHasData[colIndex] = true;
        }
      }
    }

    // Step 3: Filter out the empty columns from each row
    const cleanData = rowsWithData.map((row: any[]) => {
      const cleanRow: any[] = [];
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        if (colHasData[colIndex]) {
          cleanRow.push(row[colIndex] ?? null); // Use null for empty cells in non-empty columns to preserve alignment
        }
      }
      return cleanRow;
    });

    return cleanData;
  }

  async parse(file: File): Promise<EstimateRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          
          // 1. Find the real end of data (3 consecutive empty rows)
          let endRowIndex = rawData.length;
          let emptyCount = 0;
          for (let i = 0; i < rawData.length; i++) {
            const isRowEmpty = !rawData[i] || rawData[i].every(cell => cell === null || cell === undefined || cell === '');
            if (isRowEmpty) {
              emptyCount++;
            } else {
              emptyCount = 0;
            }
            if (emptyCount >= 3) {
              endRowIndex = i - 2;
              break;
            }
          }
          const fullData = rawData.slice(0, endRowIndex);

          // 2. Используем ИИ для определения индексов колонок и правил классификации
          // Пытаемся эвристически определить дефолтные индексы по заголовкам (первые 15 строк)
          const headerRows = fullData.slice(0, 15);
          let heuristicNameIdx = 1;
          let heuristicUnitIdx = 2;
          let heuristicAmountIdx = 3;

          for (let rowIdx = 0; rowIdx < headerRows.length; rowIdx++) {
            const row = headerRows[rowIdx];
            if (!row || !Array.isArray(row)) continue;

            for (let colIdx = 0; colIdx < row.length; colIdx++) {
              const cellValue = String(row[colIdx] || '').toLowerCase().trim();
              if (!cellValue) continue;

              if (cellValue.includes('наименование') || cellValue.includes('видов работ')) {
                heuristicNameIdx = colIdx;
              } else if (cellValue.includes('единица') || cellValue.includes('ед. изм') || cellValue.includes('измерения')) {
                heuristicUnitIdx = colIdx;
              } else if (cellValue.includes('количество') || cellValue.includes('объем') || cellValue.includes('кол-во')) {
                if (heuristicAmountIdx === 3 || cellValue.includes('до изменений')) {
                    heuristicAmountIdx = colIdx;
                }
              }
            }
          }

          const sampleForAI = fullData.slice(0, 60); 
          let mapping: any = {
            nameIdx: heuristicNameIdx, unitIdx: heuristicUnitIdx, amountIdx: heuristicAmountIdx,
            workKeywords: ["устройство", "монтаж", "прокладка", "разработка", "демонтаж", "разборка", "установка", "перетирка", "насечка", "отбивка"],
            materialKeywords: ["бетон", "раствор", "смесь", "песок", "щебень", "труба", "кабель", "арматура", "мусор", "плинтус", "плитка", "линолеум", "стяжка"]
          };

          try {
            const prompt = `Ты - эксперт по строительным сметам. Твоя задача:
            1. Определить индексы колонок (от 0): Наименование (nameIdx), Ед.изм. (unitIdx), Кол-во (amountIdx).
            2. Определить признаки, по которым можно отличить РАБОТУ от МАТЕРИАЛА в колонке "Наименование".
            (Работы обычно начинаются с глаголов или имеют шифры типа ФЕР/ГЭСН. Материалы - это существительные: бетон, песок, блоки).
            
            Верни ТОЛЬКО JSON объект: 
            {
              "nameIdx": N, 
              "unitIdx": N, 
              "amountIdx": N, 
              "workKeywords": ["устройство", "монтаж", "прокладка", "разработка"], 
              "materialKeywords": ["бетон", "раствор", "смесь", "песок", "щебень", "труба", "кабель", "арматура"]
            }
            Данные: ${JSON.stringify(sampleForAI)}`;
            
            const responseText = await aiService.generateContent(prompt);
            const jsonStr = responseText.replace(/```json|```/g, '').trim();
            const parsedMapping = JSON.parse(jsonStr);

            // Проверка полей
            mapping = {
                nameIdx: typeof parsedMapping.nameIdx === 'number' ? parsedMapping.nameIdx : mapping.nameIdx,
                unitIdx: typeof parsedMapping.unitIdx === 'number' ? parsedMapping.unitIdx : mapping.unitIdx,
                amountIdx: typeof parsedMapping.amountIdx === 'number' ? parsedMapping.amountIdx : mapping.amountIdx,
                workKeywords: Array.isArray(parsedMapping.workKeywords) ? parsedMapping.workKeywords : mapping.workKeywords,
                materialKeywords: Array.isArray(parsedMapping.materialKeywords) ? parsedMapping.materialKeywords : mapping.materialKeywords
            };
          } catch (e) {
            console.warn("Ошибка классификации ИИ, используем значения по умолчанию", e);
          }

          // 3. Fast JS Parsing with Grouping Logic
          const results: EstimateRow[] = [];
          let currentWork: any = null;

          const lowerWorkKeywords = (mapping.workKeywords || []).map((k: string) => k.toLowerCase());
          const lowerMaterialKeywords = (mapping.materialKeywords || []).map((k: string) => k.toLowerCase());

          fullData.forEach((row, idx) => {
            const name = String(row[mapping.nameIdx] || '').trim();
            const unit = String(row[mapping.unitIdx] || '').trim();
            const amount = String(row[mapping.amountIdx] || '0').trim();
            const amountNum = parseFloat(amount.replace(',', '.'));

            if (!name || name.length < 5) return;

            const nameLower = name.toLowerCase();

            const isWork = lowerWorkKeywords.some((k: string) => nameLower.includes(k)) ||
                           /^[0-9]{2}\.[0-9]{2}/.test(name) || // Шифры типа 01.01
                           name.includes('ФЕР') || name.includes('ГЭСН');
            
            const isMaterial = lowerMaterialKeywords.some((k: string) => nameLower.includes(k));

            if (isWork && !isNaN(amountNum) && amountNum > 0) {
              if (currentWork) results.push(currentWork);
              currentWork = { 
                id: idx + 1, 
                name, 
                unit, 
                amount, 
                materials: [],
                isWork: true
              };
            } else if (isMaterial && currentWork) {
              currentWork.materials.push(`${name} (${amount} ${unit})`);
            }
          });
          if (currentWork) results.push(currentWork);

          resolve(results);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }
}

export const estimateParser = new EstimateParser();
