import { z } from 'zod';

// Определение схемы Zod для валидации на сервере
export const createActSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  date: z.string().min(1, 'Дата обязательна'),
  type: z.enum(['AOSR', 'KS2', 'KS3'], { required_error: 'Выберите тип акта' }),
  contractorId: z.string().min(1, 'Подрядчик обязателен'),
  description: z.string().optional(),
});

export type CreateActDTO = z.infer<typeof createActSchema>;

// Простейший мок сервис для создания актов
class ActService {
  private acts: any[] = [];

  async createAct(data: CreateActDTO) {
    // Валидация на уровне сервиса
    const validatedData = createActSchema.parse(data);

    const newAct = {
      id: crypto.randomUUID(),
      ...validatedData,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };

    this.acts.push(newAct);
    return newAct;
  }

  async getActs() {
    return this.acts;
  }
}

export const actService = new ActService();
