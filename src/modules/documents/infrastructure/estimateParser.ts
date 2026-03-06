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

          // 2. Use AI to detect column mapping and classification rules
          const sampleForAI = fullData.slice(0, 60); 
          let mapping;
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
            mapping = JSON.parse(jsonStr);
          } catch (e) {
            console.warn("AI Mapping failed, using defaults", e);
            mapping = { 
              nameIdx: 1, unitIdx: 2, amountIdx: 3, 
              workKeywords: ["устройство", "монтаж", "прокладка", "разработка"], 
              materialKeywords: ["бетон", "раствор", "смесь", "песок", "щебень", "труба", "кабель", "арматура"] 
            };
          }

          // 3. Fast JS Parsing with Grouping Logic
          const results: EstimateRow[] = [];
          let currentWork: any = null;

          const lowerWorkKeywords = mapping.workKeywords.map((k: string) => k.toLowerCase());
          const lowerMaterialKeywords = mapping.materialKeywords.map((k: string) => k.toLowerCase());

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
