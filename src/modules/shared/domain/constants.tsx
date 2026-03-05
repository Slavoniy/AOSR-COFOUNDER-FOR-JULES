/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Briefcase, Users, Layers, BarChart3, Settings, ShieldCheck, Target, Zap
} from 'lucide-react';
import { Vector } from './types';

export const VECTORS: Vector[] = [
  {
    id: 1,
    title: "Проработка бизнес-модели",
    description: "Работа с Business Model Canvas: ценностное предложение, потоки доходов и структура издержек.",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Портрет ЦА и боли",
    description: "Анализ инженеров ПТО, застройщиков и генподрядчиков. Выявление критических проблем.",
    icon: <Users className="w-6 h-6" />,
    color: "bg-emerald-500"
  },
  {
    id: 3,
    title: "Функционал MVP",
    description: "Определение приоритетных функций для первой версии: ОЖР, АОСР, автоматизация ИД.",
    icon: <Layers className="w-6 h-6" />,
    color: "bg-violet-500"
  },
  {
    id: 4,
    title: "Анализ конкурентов и УЦП",
    description: "Сравнение с Signal, Exon, IYNO. Формирование уникального ценностного предложения.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Анализ объема рынка (TAM/SAM/SOM)",
    description: "Оценка потенциала рынка PropTech в РФ: от общего объема строительства до достижимого сегмента.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-rose-500"
  },
  {
    id: 6,
    title: "Миграция и РФ-стек (Yandex AI)",
    description: "Перенос на собственные сервера, интеграция YandexGPT и Yandex Vision для работы в РФ.",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-indigo-600"
  },
  {
    id: 7,
    title: "Технологический стек",
    description: "Описание архитектуры, языков программирования и библиотек, на которых построен StройDoc AI.",
    icon: <Settings className="w-6 h-6" />,
    color: "bg-slate-700"
  }
];

export const COMPETITORS = [
  {
    name: "Signal",
    focus: "Строительный контроль и BIM",
    pricing: "От 150 000 ₽/год",
    strengths: ["Мощная интеграция с Revit/Navisworks", "Удобное мобильное приложение для площадки", "Визуализация прогресса на 3D-модели"],
    weaknesses: ["Высокая стоимость", "Сложность внедрения для небольших компаний", "Фокус на крупных девелоперов"]
  },
  {
    name: "Exon (Gaskar Group)",
    focus: "Экосистема управления строительством",
    pricing: "По запросу (от 500к+)",
    strengths: ["Глубокая интеграция с госзаказами (Москва)", "Модульность (Docs, BIM, Quality)", "Поддержка ЭЦП и юридически значимого ЭДО"],
    weaknesses: ["Перегруженный интерфейс", "Длительное обучение персонала", "Закрытость экосистемы"]
  },
  {
    name: "ЦУС",
    focus: "Учет и сметное планирование",
    pricing: "От 50 000 ₽/год",
    strengths: ["Связь смет и реального выполнения", "Работа с ФСНБ-2022 и РИМ", "Автоматизация КС-2/КС-3"],
    weaknesses: ["Слабая работа с исполнительной документацией", "Устаревший UI/UX", "Медленная техподдержка"]
  }
];

export const BMC_DATA = [
  {
    title: "Ключевые партнеры",
    items: ["Разработчики Гранд-Сметы", "Удостоверяющие центры (ЭЦП)", "СРО и строительные ассоциации", "Органы ГСН (Госстройнадзор)"],
    icon: <Users className="w-4 h-4" />
  },
  {
    title: "Ключевые активности",
    items: ["Разработка AI-алгоритмов парсинга", "Автоматизация ОЖР через моб. приложение", "Техподдержка инженеров ПТО", "Обновление под нормативы Минстроя"],
    icon: <Zap className="w-4 h-4" />
  },
  {
    title: "Ценностное предложение",
    items: ["АОСР за 30 секунд", "Связь сметы и документов", "Снижение штрафов на 40%", "Освобождение ПТО от рутины", "Прозрачность для Стройнадзора", "Прораб: фотофиксация в 1 клик"],
    icon: <Target className="w-4 h-4" />
  }
];
