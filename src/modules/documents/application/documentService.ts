/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { estimateParser, EstimateRow } from '../infrastructure/estimateParser';
import { eventBus } from '../../shared/infrastructure/eventBus';

export class DocumentService {
  async parseEstimate(file: File): Promise<EstimateRow[]> {
    eventBus.emit('document:parsing:start', { fileName: file.name });
    try {
      const data = await estimateParser.parse(file);
      eventBus.emit('document:parsing:success', { count: data.length });
      return data;
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
