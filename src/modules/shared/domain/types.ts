/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type Vector = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

export type Project = {
  id: string;
  name: string;
  object: string;
  developer: { name: string; requisites: string; sro: string };
  contractor: { name: string; requisites: string; sro: string };
  designer: { name: string; requisites: string; sro: string };
  participants: {
    repDeveloper: string;
    repContractor: string;
    repContractorSk: string;
    repDesigner: string;
    repSubcontractor: string;
  };
  createdAt: string;
  acts: ActDetail[];
};

export type ActDetail = {
  id: string;
  number: string;
  workName: string;
  unit: string;
  amount: string;
  scheme: string;
  nextWorks: string;
  materials: string;
  startDate: string;
  startMonth: string;
  startYear: string;
  endDate: string;
  endMonth: string;
  endYear: string;
  standards: string;
  status?: 'draft' | 'signed';
};

export type EstimateItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
  materials?: string[];
};

export type Certificate = {
  id: string;
  name: string;
  provider: string;
  date: string;
  file: string;
};

export type UserRole = 'ADMIN' | 'ENGINEER';

export type User = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
};

export type Company = {
  id: string;
  name: string;        // Полное наименование
  inn: string;         // ИНН
  ogrn: string;        // ОГРН
  sroDetails: string;  // Данные СРО
  address: string;     // Юридический адрес
};

export type Signatory = {
  id: string;
  fio: string;           // ФИО
  position: string;      // Должность
  documentBasis: string; // Основание полномочий (Приказ №1, Доверенность...)
};
