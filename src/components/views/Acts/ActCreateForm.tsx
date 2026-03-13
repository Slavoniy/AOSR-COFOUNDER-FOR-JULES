import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const actSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  date: z.string().min(1, 'Дата обязательна'),
  type: z.enum(['AOSR', 'KS2', 'KS3'], { required_error: 'Выберите тип акта' }),
  contractorId: z.string().min(1, 'Подрядчик обязателен'),
  description: z.string().optional(),
});

type ActFormValues = z.infer<typeof actSchema>;

interface ActCreateFormProps {
  onSubmit: (data: ActFormValues) => void;
  onCancel: () => void;
}

export const ActCreateForm: React.FC<ActCreateFormProps> = ({ onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ActFormValues>({
    resolver: zodResolver(actSchema),
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Создание нового акта</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Название */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название акта</label>
          <input
            {...register('title')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Акт №1"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Дата */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
          <input
            type="date"
            {...register('date')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        {/* Тип акта */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип акта</label>
          <select
            {...register('type')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Выберите тип...</option>
            <option value="AOSR">АОСР</option>
            <option value="KS2">КС-2</option>
            <option value="KS3">КС-3</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        {/* Подрядчик (Мок) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Подрядчик</label>
          <select
            {...register('contractorId')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white ${errors.contractorId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Выберите подрядчика...</option>
            <option value="1">ООО "СпецМонтажСтрой"</option>
            <option value="2">ООО "Альянс"</option>
          </select>
          {errors.contractorId && <p className="text-red-500 text-xs mt-1">{errors.contractorId.message}</p>}
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание (необязательно)</label>
          <textarea
            {...register('description')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
            placeholder="Дополнительная информация..."
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Создать акт
          </button>
        </div>
      </form>
    </div>
  );
};
