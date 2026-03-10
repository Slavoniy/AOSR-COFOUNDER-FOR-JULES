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

      const response = await fetch('/api/estimates/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || [];

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
