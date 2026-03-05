/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../../shared/domain/types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'ЖК "Северное Сияние"',
    object: 'Многоквартирный жилой дом, корп. 1',
    developer: { name: 'ООО "ГлавЗастрой"', requisites: 'ИНН 7701234567, КПП 770101001', sro: 'СРО-С-001-01012009' },
    contractor: { name: 'АО "СтройТех"', requisites: 'ИНН 7702345678, КПП 770201001', sro: 'СРО-С-002-02022010' },
    designer: { name: 'ООО "Проект-М"', requisites: 'ИНН 7703456789, КПП 770301001', sro: 'СРО-П-003-03032011' },
    participants: {
      repDeveloper: 'Иванов И.И., приказ №12 от 10.01.2024',
      repContractor: 'Петров П.П., приказ №45 от 12.01.2024',
      repContractorSk: 'Сидоров С.С., приказ №46 от 12.01.2024',
      repDesigner: 'Кузнецов К.К., приказ №5 от 15.01.2024',
      repSubcontractor: 'Васильев В.В., приказ №8 от 20.01.2024'
    },
    createdAt: '2024-01-15',
    acts: [
      {
        id: '101',
        number: '1',
        workName: 'Разработка грунта в котловане',
        unit: 'м3',
        amount: '1250',
        scheme: 'Исполнительная схема №1',
        nextWorks: 'Устройство песчаной подготовки',
        materials: 'Грунт II группы',
        startDate: '15', startMonth: 'января', startYear: '2024',
        endDate: '20', endMonth: 'января', endYear: '2024',
        standards: 'СП 45.13330.2017'
      }
    ]
  }
];
