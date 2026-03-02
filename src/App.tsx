/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Users, Layers, BarChart3, ChevronRight, HardHat, FileText, 
  Settings, ArrowLeft, CheckCircle2, AlertCircle, Zap, Target, ShieldCheck,
  Download, Plus, Trash2, Search, Filter, Calendar, MapPin, Building2,
  FileCheck, FileSignature, ClipboardList, Info, Loader2, Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

type Vector = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

type Project = {
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
};

const vectors: Vector[] = [
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
    description: "Описание архитектуры, языков программирования и библиотек, на которых построен StroyDoc AI.",
    icon: <Settings className="w-6 h-6" />,
    color: "bg-slate-700"
  }
];

const competitors = [
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
  },
  {
    name: "agenerator.ru",
    focus: "Excel-автоматизация ИД",
    pricing: "990 ₽/мес или 39 900 ₽ (бессрочно)",
    strengths: ["Максимальная простота (Excel)", "Низкая цена", "Открытый код для доработок", "Бессрочная лицензия"],
    weaknesses: ["Нет облачной синхронизации", "Нет мобильного приложения", "Ручное управление файлами", "Ограничен функционалом Excel"]
  },
  {
    name: "АЛТИУС",
    focus: "ERP для строительства и ИД",
    pricing: "От 3 900 ₽/мес",
    strengths: ["Глубокая связь Смета-ОЖР-Акт", "Работает с 2016 года", "Автоматизация КС-2/КС-3", "Проверка лимитов материалов"],
    weaknesses: ["Устаревший интерфейс", "Сложность настройки", "Десктоп-ориентированность", "Высокий порог входа"]
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'analysis' | 'mvp' | 'business' | 'market' | 'persona' | 'migration' | 'stack'>('home');
  const [subView, setSubView] = useState<'list' | 'estimate-detail' | 'projects' | 'create-project'>('list');
  const [selectedVector, setSelectedVector] = useState<number | null>(null);
  const [currentActIndex, setCurrentActIndex] = useState(0);
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'ЖК "Горизонт" - Корпус 1',
      object: 'Жилой комплекс "Горизонт", Корпус 1, г. Москва, ул. Строителей, 25',
      developer: { 
        name: 'ООО "ГлавСтройИнвест"', 
        requisites: 'ОГРН 1234567890123, ИНН 7701234567, 123456, г. Москва, ул. Ленина, д. 1, тел. +7 (495) 123-45-67',
        sro: 'Член СРО "Альянс Строителей", ОГРН СРО 1027700000000'
      },
      contractor: {
        name: 'ООО "СпецМонтажСтрой"',
        requisites: 'ОГРН 9876543210987, ИНН 7705554433, г. Москва, ул. Профсоюзная, 10',
        sro: 'Член СРО "Строительный Стандарт", ОГРН СРО 1037700000000'
      },
      designer: {
        name: 'ООО "ПроектЦентр"',
        requisites: 'ОГРН 1112223334445, ИНН 7709998877, г. Москва, наб. Академика Туполева, 15',
        sro: 'Член СРО "Проектировщики России", ОГРН СРО 1047700000000'
      },
      participants: {
        repDeveloper: 'Инженер СК, Иванов Иван Иванович, НРС С-77-123456, Приказ №45 от 10.01.2026',
        repContractor: 'Производитель работ, Петров Петр Петрович, Приказ №12 от 15.01.2026',
        repContractorSk: 'Специалист СК, Сидоров Сидор Сидорович, НРС С-77-654321, Приказ №8 от 12.01.2026',
        repDesigner: 'ГИП, Кузнецов Алексей Сергеевич, Приказ №2 от 05.01.2026, ООО "ПроектЦентр"',
        repSubcontractor: 'Мастер, Васильев Игорь Николаевич, Приказ №3 от 01.02.2026'
      },
      createdAt: '2026-02-15'
    }
  ]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    object: '',
    developer: { name: '', requisites: '', sro: '' },
    contractor: { name: '', requisites: '', sro: '' },
    designer: { name: '', requisites: '', sro: '' },
    participants: {
      repDeveloper: '',
      repContractor: '',
      repContractorSk: '',
      repDesigner: '',
      repSubcontractor: ''
    }
  });

  const handleCreateProject = () => {
    const project: Project = {
      ...newProject as Project,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, project]);
    setActiveProjectId(project.id);
    setSubView('list');
    
    // Sync actDetails with project data
    setActDetails(prev => ({
      ...prev,
      object: project.object,
      developer: `${project.developer.name}, ${project.developer.requisites}`,
      developerSro: project.developer.sro,
      contractor: `${project.contractor.name}, ${project.contractor.requisites}`,
      contractorSro: project.contractor.sro,
      designer: `${project.designer.name}, ${project.designer.requisites}`,
      designerSro: project.designer.sro,
      repDeveloper: project.participants.repDeveloper,
      repContractor: project.participants.repContractor,
      repContractorSk: project.participants.repContractorSk,
      repDesigner: project.participants.repDesigner,
      repSubcontractor: project.participants.repSubcontractor
    }));
  };
  
  const getMaterialsForWork = (workName: string) => {
    const name = workName.toLowerCase();
    if (name.includes('грунт')) return 'Грунт (не требует обязательной сертификации)';
    if (name.includes('песчан')) return 'Песок строительный (ГОСТ 8736-2014), Паспорт качества №77 от 10.02.2026';
    if (name.includes('пнд') || name.includes('трубопровод')) return 'Труба ПНД 110мм (ГОСТ 18599-2001), Сертификат соответствия №RU.01.001.12345';
    if (name.includes('засыпка')) return 'Песок для строительных работ, Паспорт №88 от 12.02.2026';
    if (name.includes('бетон')) return 'Бетон B25 W6 F150 (ГОСТ 7473-2010), Паспорт качества №456 от 15.02.2026';
    if (name.includes('арматур')) return 'Арматура А500С (ГОСТ 34028-2016), Сертификат №789 от 05.02.2026';
    return 'Материалы не определены (требуется ручной ввод)';
  };

  const [actDetails, setActDetails] = useState({
    numberPrefix: "12/ПТО-",
    date: "28",
    month: "февраля",
    year: "2026",
    object: "Жилой комплекс \"Горизонт\", Корпус 1, г. Москва, ул. Строителей, 25",
    developer: "ООО \"ГлавСтройИнвест\", ОГРН 1234567890123, ИНН 7701234567, 123456, г. Москва, ул. Ленина, д. 1, тел. +7 (495) 123-45-67",
    developerSro: "Член СРО \"Альянс Строителей\", ОГРН СРО 1027700000000",
    contractor: "ООО \"СпецМонтажСтрой\", ОГРН 9876543210987, ИНН 7705554433, г. Москва, ул. Профсоюзная, 10",
    contractorSro: "Член СРО \"Строительный Стандарт\", ОГРН СРО 1037700000000",
    designer: "ООО \"ПроектЦентр\", ОГРН 1112223334445, ИНН 7709998877, г. Москва, наб. Академика Туполева, 15",
    designerSro: "Член СРО \"Проектировщики России\", ОГРН СРО 1047700000000",
    repDeveloper: "Инженер СК, Иванов Иван Иванович, НРС С-77-123456, Приказ №45 от 10.01.2026",
    repContractor: "Производитель работ, Петров Петр Петрович, Приказ №12 от 15.01.2026",
    repContractorSk: "Специалист СК, Сидоров Сидор Сидорович, НРС С-77-654321, Приказ №8 от 12.01.2026",
    repDesigner: "ГИП, Кузнецов Алексей Сергеевич, Приказ №2 от 05.01.2026, ООО \"ПроектЦентр\"",
    repSubcontractor: "Мастер, Васильев Игорь Николаевич, Приказ №3 от 01.02.2026",
    projectDoc: "Шифр 2024-05-КЖ, лист 12, Раздел 4 \"Конструктивные решения\"",
    materials: "Бетон B25 W6 F150 (Сертификат соответствия №098765), Арматура А500С (Паспорт качества №1122)",
    docs: "Исполнительная схема №5, результаты испытаний бетона (протокол №44)",
    startDate: "01",
    startMonth: "февраля",
    startYear: "2026",
    endDate: "15",
    endMonth: "февраля",
    endYear: "2026",
    standards: "СП 70.13330.2012 \"Несущие и ограждающие конструкции\", проектная документация",
    nextWorks: "Устройство опалубки перекрытия на отм. +3.000",
    copies: "3",
    apps: "Реестр исполнительной документации №1"
  });

  // Estimate Module State
  const [estimateStep, setEstimateStep] = useState<'upload' | 'selection' | 'mapping' | 'preview'>('upload');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [useColumns, setUseColumns] = useState({ name: true, unit: true, amount: true });
  const [estimateData, setEstimateData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanningOrder, setIsScanningOrder] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    estimateParsing?: number;
    orderScanning?: number;
    materialAnalysis?: number;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const startTime = Date.now();
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

        // 2. Use AI only to detect the column mapping and classification rules
        const sampleForAI = fullData.slice(0, 60); 
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Ты - эксперт по строительным сметам. Твоя задача:
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
          Данные: ${JSON.stringify(sampleForAI)}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
          }
        });

        let mapping = { 
          nameIdx: 1, unitIdx: 2, amountIdx: 3, 
          workKeywords: ["устройство", "монтаж"], 
          materialKeywords: ["бетон", "песок"] 
        };
        try {
          const jsonMatch = response.text?.match(/\{.*\}/s);
          if (jsonMatch) mapping = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("AI Mapping error");
        }

        // 3. Fast JS Parsing with Grouping Logic
        const parsed: any[] = [];
        let currentWork: any = null;

        fullData.forEach((row, idx) => {
          const name = String(row[mapping.nameIdx] || '').trim();
          const unit = String(row[mapping.unitIdx] || '').trim();
          const amount = String(row[mapping.amountIdx] || '0').trim();
          const amountNum = parseFloat(amount.replace(',', '.'));

          if (!name || name.length < 5) return;

          const isWork = mapping.workKeywords.some(k => name.toLowerCase().includes(k.toLowerCase())) || 
                         /^[0-9]{2}\.[0-9]{2}/.test(name) || // Шифры типа 01.01
                         name.includes('ФЕР') || name.includes('ГЭСН');
          
          const isMaterial = mapping.materialKeywords.some(k => name.toLowerCase().includes(k.toLowerCase()));

          if (isWork && !isNaN(amountNum) && amountNum > 0) {
            if (currentWork) parsed.push(currentWork);
            currentWork = { 
              id: idx + 1, 
              name, 
              unit, 
              amount, 
              materials: [] 
            };
          } else if (isMaterial && currentWork) {
            currentWork.materials.push(`${name} (${amount} ${unit})`);
          }
        });
        if (currentWork) parsed.push(currentWork);

        setPerformanceMetrics(prev => ({ ...prev, estimateParsing: Date.now() - startTime }));
        setEstimateData(parsed);
        setEstimateStep('selection');
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Ошибка при чтении файла.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleOrderScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningOrder(true);
    const startTime = Date.now();
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
          {
            text: `Это приказ о назначении ответственных лиц на стройке. 
            Найди и выдели: 
            1. Название организации.
            2. Номер и дату приказа.
            3. ФИО и должность ответственного за строительный контроль (технадзор).
            4. ФИО и должность ответственного за производство работ (прораб).
            Верни данные в формате JSON: {org, orderNum, orderDate, repSk, repWork}.`,
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const data = JSON.parse(response.text?.match(/\{.*\}/s)?.[0] || '{}');
      
      setActDetails(prev => ({
        ...prev,
        developer: data.org || prev.developer,
        repDeveloper: `${data.repSk || 'Инженер СК'}, Приказ №${data.orderNum || ''} от ${data.orderDate || ''}`,
        repContractor: `${data.repWork || 'Прораб'}, Приказ №${data.orderNum || ''} от ${data.orderDate || ''}`
      }));

      setPerformanceMetrics(prev => ({ ...prev, orderScanning: Date.now() - startTime }));
      alert("Данные из приказа успешно извлечены и добавлены в шаблон!");
    } catch (error) {
      console.error("Order scan error:", error);
      alert("Не удалось распознать приказ. Попробуйте более четкое фото.");
    } finally {
      setIsScanningOrder(false);
    }
  };

  const analyzeMaterials = async () => {
    if (selectedRows.length === 0) return;
    
    setIsAnalyzing(true);
    const startTime = Date.now();
    try {
      const selectedWorks = estimateData.filter(row => selectedRows.includes(row.id));
      const workToAnalyze = selectedWorks[0]; // Analyze the first selected work for demo
      
      // If we already have materials from parsing, use them as context for AI
      const existingMaterials = workToAnalyze.materials?.join(', ') || '';

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Ты - эксперт ПТО в строительстве. Выдели из наименования строительной работы основные используемые материалы и укажи для них типичные ГОСТы или сертификаты. 
        Работа: "${workToAnalyze.name}"
        ${existingMaterials ? `Уже найденные материалы в смете: ${existingMaterials}` : ''}
        Ответь в формате: "Материал 1 (ГОСТ/Сертификат), Материал 2 (ГОСТ/Сертификат)". Если материалов нет, напиши "Материалы не требуются".`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const materials = response.text || 'Материалы не определены';
      setActDetails(prev => ({
        ...prev,
        materials: materials
      }));
      setPerformanceMetrics(prev => ({ ...prev, materialAnalysis: Date.now() - startTime }));
      setEstimateStep('mapping');
    } catch (error) {
      console.error("AI Analysis error:", error);
      // Fallback to mock if AI fails
      setEstimateStep('mapping');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStart = () => {
    if (selectedVector === 4) {
      setView('analysis');
    } else if (selectedVector === 3) {
      setView('mvp');
      setSubView('projects');
      setEstimateStep('upload');
      setCurrentActIndex(0);
    } else if (selectedVector === 1) {
      setView('business');
    } else if (selectedVector === 5) {
      setView('market');
    } else if (selectedVector === 6) {
      setView('migration');
    } else if (selectedVector === 7) {
      setView('stack');
    } else if (selectedVector === 2) {
      setView('persona');
    }
  };

  const toggleRow = (id: number) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedRows.length === estimateData.length) setSelectedRows([]);
    else setSelectedRows(estimateData.map(r => r.id));
  };

  const bmcData = [
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
    },
    {
      title: "Отношения с клиентами",
      items: ["Self-service (SaaS)", "Персональный онбординг", "Сообщество инженеров ПТО", "White-glove сервис для корпоратов", "Вебинары и обучение"],
      icon: <Users className="w-4 h-4" />
    },
    {
      title: "Сегменты клиентов",
      items: ["Инженеры ПТО (фриланс/штат)", "Прорабы (полевой контроль)", "Инспекторы ГСН / Технадзор", "Малые и средние застройщики", "Аутсорсинговые компании ПТО"],
      icon: <Users className="w-4 h-4" />
    },
    {
      title: "Ключевые ресурсы",
      items: ["Собственная база шаблонов ИД", "Мобильное приложение для прорабов", "Команда (Dev + PropTech эксперты)", "Бренд AI-кофаундера", "Данные для обучения AI"],
      icon: <Layers className="w-4 h-4" />
    },
    {
      title: "Каналы сбыта",
      items: ["Прямые продажи", "Партнерки со сметным ПО", "Контент-маркетинг (Telegram для ПТО)", "Профильные выставки", "Сарафанное радио на стройке"],
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      title: "Структура издержек",
      items: ["Разработка и серверы", "Маркетинг и продажи", "Юристы (комплаенс)", "API распознавания текста"],
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      title: "Потоки доходов",
      items: ["Гибридная модель: Подписка + Pay-per-doc", "Freemium (3 АОСР в месяц бесплатно)", "Корпоративные лицензии (Unlimited)", "API-интеграция для крупных холдингов"],
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  const pricingTiers = [
    {
      name: "Freemium",
      price: "0 ₽",
      features: ["До 3 АОСР в месяц", "Базовые шаблоны", "Мобильный ОЖР (чтение)"],
      highlight: false
    },
    {
      name: "Инженер (Solo)",
      price: "4 900 ₽/мес",
      features: ["Безлимит АОСР", "Сметный модуль (Core)", "Личный архив документов", "Экспорт в Word/PDF"],
      highlight: false
    },
    {
      name: "Команда (Pro)",
      price: "14 900 ₽/мес",
      features: ["До 5 пользователей", "Общий доступ к проектам", "Гостевой доступ для ГСН/Технадзора", "Полный ОЖР + Фотофиксация", "Приоритетная поддержка"],
      highlight: true
    },
    {
      name: "Разовый (Result)",
      price: "490 ₽/акт",
      features: ["Без абонентской платы", "Все функции Pro", "Идеально для фрилансеров", "Оплата за результат"],
      highlight: false
    }
  ];

  const mvpFeatures = [
    {
      id: 'estimate',
      title: "Сметный модуль (Core)",
      description: "Импорт смет из Excel/XML. Автоматическое создание черновиков АОСР на основе сметных строк.",
      status: "Priority 1",
      icon: <FileText className="w-5 h-5 text-blue-500" />
    },
    {
      id: 'ojr',
      title: "Цифровой ОЖР",
      description: "Ведение общего журнала работ через мобильное приложение. Фотофиксация и геолокация.",
      status: "Priority 1",
      icon: <HardHat className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'registry',
      title: "Реестр ИД",
      description: "Автоматическое формирование реестра исполнительной документации и контроль комплектности.",
      status: "Priority 2",
      icon: <Layers className="w-5 h-5 text-violet-500" />
    },
    {
      id: 'ai',
      title: "AI-валидатор",
      description: "Проверка документов на соответствие ГОСТ и СНиП с помощью нейросети.",
      status: "Priority 3 (Future)",
      icon: <Zap className="w-5 h-5 text-yellow-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pb-24">
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full space-y-8 mt-12"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-4">
                <HardHat className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Привет! Я твой <span className="text-blue-600">AI-кофаундер</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Я помогу тебе спроектировать и запустить SaaS-сервис для автоматизации исполнительной документации в строительстве. С чего начнем?
              </p>
            </div>

            {/* Vectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vectors.map((vector) => (
                <motion.button
                  key={vector.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVector(vector.id)}
                  className={`flex items-start p-6 bg-white rounded-2xl border transition-all text-left group
                    ${selectedVector === vector.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                >
                  <div className={`p-3 rounded-xl ${vector.color} text-white mr-4 shrink-0`}>
                    {vector.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {vector.id}. {vector.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {vector.description}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 mt-1 transition-transform ${selectedVector === vector.id ? 'text-blue-500 translate-x-1' : 'text-slate-300'}`} />
                </motion.button>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Settings className="w-4 h-4" />
                <span>PropTech Strategy v1.0</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Нормативы: Приказ №344/пр</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === 'analysis' ? (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-5xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Анализ конкурентов и УЦП</h2>
              <p className="text-slate-600">Изучаем ландшафт рынка PropTech РФ и ищем наше "окно возможностей".</p>
            </div>

            {/* Competitor Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {competitors.map((comp) => (
                <div key={comp.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{comp.name}</h3>
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Фокус: {comp.focus}</div>
                    <div className="text-sm font-bold text-blue-600">Цена: {comp.pricing}</div>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Сильные стороны
                      </div>
                      <ul className="text-sm text-slate-600 space-y-1 pl-6 list-disc">
                        {comp.strengths.map(s => <li key={s}>{s}</li>)}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                        <AlertCircle className="w-4 h-4" /> Слабые стороны
                      </div>
                      <ul className="text-sm text-slate-600 space-y-1 pl-6 list-disc">
                        {comp.weaknesses.map(w => <li key={w}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* UVP Section */}
            <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-32 h-32" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-800 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Target className="w-3 h-3" /> Наше преимущество (УЦП)
                </div>
                <h3 className="text-2xl font-bold">Где мы можем победить?</h3>
                <p className="text-blue-100 max-w-2xl">
                  Рынок поделен между сложными "комбайнами" для гигантов и простыми Excel-таблицами. Наша гипотеза: **"Облачный AI-автопилот"** — удобство Excel, но с мощью нейросетей и мобильностью.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> Скорость
                    </h4>
                    <p className="text-sm text-blue-100">Генерация АОСР за 30 секунд на основе фото со стройплощадки и распознавания текста.</p>
                  </div>
                  <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" /> Сметный модуль
                    </h4>
                    <p className="text-sm text-blue-100">Автоматическая генерация АОСР напрямую из сметы (Excel/Гранд-Смета) — связываем деньги и документы.</p>
                  </div>
                  <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" /> Доступность
                    </h4>
                    <p className="text-sm text-blue-100">Модель "Pay-as-you-go" (490 ₽/акт) — дешевле и быстрее, чем нанимать фрилансера или покупать сложные лицензии.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Твой вердикт по УЦП:</h4>
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Напиши, какое преимущество кажется тебе самым важным..."
              ></textarea>
            </div>
          </motion.div>
        ) : view === 'business' ? (
          <motion.div 
            key="business"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Business Model Canvas</h2>
              <p className="text-slate-600">Стратегическое управление и проектирование бизнес-модели StroyDoc AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Row 1 */}
              <div className="md:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Users className="w-4 h-4 text-blue-500" /> {bmcData[0].title}
                </div>
                <ul className="text-xs text-slate-500 space-y-2">
                  {bmcData[0].items.map(i => <li key={i} className="p-2 bg-slate-50 rounded-lg">• {i}</li>)}
                </ul>
              </div>

              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Zap className="w-4 h-4 text-yellow-500" /> {bmcData[1].title}
                  </div>
                  <ul className="text-xs text-slate-500 space-y-2">
                    {bmcData[1].items.map(i => <li key={i} className="p-2 bg-slate-50 rounded-lg">• {i}</li>)}
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Layers className="w-4 h-4 text-violet-500" /> {bmcData[5].title}
                  </div>
                  <ul className="text-xs text-slate-500 space-y-2">
                    {bmcData[5].items.map(i => <li key={i} className="p-2 bg-slate-50 rounded-lg">• {i}</li>)}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-1 bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                  <Target className="w-4 h-4 text-blue-600" /> {bmcData[2].title}
                </div>
                <ul className="text-xs text-blue-700 space-y-2">
                  {bmcData[2].items.map(i => <li key={i} className="p-2 bg-white/50 rounded-lg">• {i}</li>)}
                </ul>
              </div>

              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Users className="w-4 h-4 text-emerald-500" /> {bmcData[3].title}
                  </div>
                  <ul className="text-xs text-slate-500 space-y-2">
                    {bmcData[3].items.map(i => <li key={i} className="p-2 bg-slate-50 rounded-lg">• {i}</li>)}
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <BarChart3 className="w-4 h-4 text-orange-500" /> {bmcData[6].title}
                  </div>
                  <ul className="text-xs text-slate-500 space-y-2">
                    {bmcData[6].items.map(i => <li key={i} className="p-2 bg-slate-50 rounded-lg">• {i}</li>)}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Users className="w-4 h-4 text-indigo-500" /> {bmcData[4].title}
                </div>
                <ul className="text-xs text-slate-500 space-y-2">
                  {bmcData[4].items.map(i => <li key={i} className="p-2 bg-slate-50 rounded-lg">• {i}</li>)}
                </ul>
              </div>

              {/* Row 2 */}
              <div className="md:col-span-2 bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-600" /> {bmcData[7].title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {bmcData[7].items.map(i => <div key={i} className="p-2 bg-white rounded-lg text-[10px] text-slate-500">• {i}</div>)}
                </div>
              </div>

              <div className="md:col-span-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <BarChart3 className="w-4 h-4 text-emerald-600" /> {bmcData[8].title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {bmcData[8].items.map(i => <div key={i} className="p-2 bg-white rounded-lg text-[10px] text-emerald-600 font-medium">• {i}</div>)}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Детализация тарифной сетки (Гибридная модель)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className={`p-6 rounded-2xl border transition-all ${tier.highlight ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{tier.name}</div>
                    <div className="text-2xl font-black text-slate-900 mb-4">{tier.price}</div>
                    <ul className="space-y-3">
                      {tier.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Твои мысли по монетизации:</h4>
              <p className="text-sm text-slate-500 mb-4">Как ты считаешь, какая модель принесет больше выручки на старте: подписка или оплата за каждый документ?</p>
              <textarea 
                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Например: Я думаю, Pay-per-document лучше для маленьких компаний..."
              ></textarea>
            </div>
          </motion.div>
        ) : view === 'persona' ? (
          <motion.div 
            key="persona"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-6xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Портрет ЦА и боли</h2>
              <p className="text-slate-600">Глубокое погружение в потребности тех, кто строит и оформляет документы.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Persona 1: Engineer PTO */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 bg-blue-600 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Инженер ПТО</h3>
                      <p className="text-blue-100 text-xs">«Офисный воин»</p>
                    </div>
                  </div>
                  <div className="text-sm italic opacity-90">«Я трачу 80% времени на Ctrl+C / Ctrl+V, вместо того чтобы реально проверять объемы.»</div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Боли:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Рутинное заполнение сотен актов вручную
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Ошибки в номерах сертификатов и ГОСТах
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Постоянные правки от технадзора
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Задачи (JTBD):</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Когда я получаю смету, я хочу быстро сформировать пакет ИД, чтобы успеть сдать его к концу месяца и не сидеть до ночи.</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-blue-600 mb-2">Наше решение:</div>
                    <div className="text-xs text-slate-500">Авто-генерация АОСР из сметы + база материалов.</div>
                  </div>
                </div>
              </div>

              {/* Persona 2: Foreman */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 bg-emerald-600 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <HardHat className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Прораб / Мастер</h3>
                      <p className="text-emerald-100 text-xs">«Полевой командир»</p>
                    </div>
                  </div>
                  <div className="text-sm italic opacity-90">«Мне некогда писать журналы, у меня бетон стынет и кран стоит.»</div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Боли:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Необходимость вести бумажный ОЖР на морозе
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Потеря фотофиксации скрытых работ
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Конфликты с ПТО из-за невовремя сданных данных
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Задачи (JTBD):</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Когда работа выполнена, я хочу зафиксировать её в телефоне за 1 минуту, чтобы данные сразу ушли в ПТО.</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-emerald-600 mb-2">Наше решение:</div>
                    <div className="text-xs text-slate-500">Мобильное приложение для ОЖР и фотофиксации.</div>
                  </div>
                </div>
              </div>

              {/* Persona 3: Director / Head of PTO */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 bg-slate-800 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Директор / Нач. ПТО</h3>
                      <p className="text-slate-400 text-xs">«Стратег»</p>
                    </div>
                  </div>
                  <div className="text-sm italic opacity-90">«Я не понимаю реальный прогресс на объектах, пока не увижу подписанные акты.»</div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Боли:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Кассовые разрывы из-за задержек в сдаче ИД
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Низкая маржинальность из-за раздутого штата ПТО
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        Риски штрафов от ГСН
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Задачи (JTBD):</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Я хочу видеть дашборд готовности документов по всем объектам, чтобы вовремя получать оплату от заказчика.</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-900 mb-2">Наше решение:</div>
                    <div className="text-xs text-slate-500">Аналитика прогресса и контроль сроков сдачи ИД.</div>
                  </div>
                </div>
              </div>

              {/* Persona 4: GSN Inspector */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 bg-rose-600 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Инспектор ГСН</h3>
                      <p className="text-rose-100 text-xs">«Контролер»</p>
                    </div>
                  </div>
                  <div className="text-sm italic opacity-90">«Я не хочу копаться в пыльных папках на объекте, мне нужны актуальные данные онлайн.»</div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Боли:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                        Сложность проверки скрытых работ постфактум
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                        Недостоверность данных в бумажных журналах
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                        Огромные затраты времени на выезды
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Задачи (JTBD):</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Когда я провожу проверку, я хочу иметь удаленный доступ к цифровому ОЖР и фотофиксации, чтобы подтвердить качество работ.</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-rose-600 mb-2">Наше решение:</div>
                    <div className="text-xs text-slate-500">Личный кабинет инспектора с доступом к ИД и фото.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Твои наблюдения:</h4>
              <p className="text-sm text-slate-500 mb-4">Чья «боль» кажется тебе самой острой и денежной для нашего стартапа на первом этапе?</p>
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Например: Я думаю, боль инженера ПТО самая массовая, но платит за решение Директор..."
              ></textarea>
            </div>
          </motion.div>
        ) : view === 'market' ? (
          <motion.div 
            key="market"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-5xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Анализ объема рынка (TAM/SAM/SOM)</h2>
              <p className="text-slate-600">Оцениваем финансовый потенциал проекта StroyDoc AI в контексте цифровизации строительства в РФ.</p>
            </div>

            {/* Market Funnel Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-4">
                    {/* TAM */}
                    <div className="relative p-6 bg-slate-900 text-white rounded-2xl overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Target className="w-12 h-12" />
                      </div>
                      <div className="relative z-10">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">TAM (Total Addressable Market)</div>
                        <div className="text-3xl font-black">~150 млрд ₽</div>
                        <p className="text-xs text-slate-400 mt-2">Весь рынок ПО для строительства и управления проектами в РФ (включая BIM, ERP, Сметы).</p>
                      </div>
                    </div>

                    {/* SAM */}
                    <div className="relative p-6 bg-blue-600 text-white rounded-2xl overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Layers className="w-12 h-12" />
                      </div>
                      <div className="relative z-10">
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">SAM (Serviceable Addressable Market)</div>
                        <div className="text-3xl font-black">~12.5 млрд ₽</div>
                        <p className="text-xs text-blue-100 mt-2">Сегмент автоматизации исполнительной документации и ОЖР для МСБ и крупных подрядчиков.</p>
                      </div>
                    </div>

                    {/* SOM */}
                    <div className="relative p-6 bg-emerald-500 text-white rounded-2xl overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap className="w-12 h-12" />
                      </div>
                      <div className="relative z-10">
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">SOM (Serviceable Obtainable Market)</div>
                        <div className="text-3xl font-black">~1.8 млрд ₽</div>
                        <p className="text-xs text-emerald-500 bg-white/20 p-1 rounded mt-2 inline-block">Наша цель на 3 года (15% от SAM)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" /> Драйверы роста рынка
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">Обязательный ТИМ (BIM)</div>
                        <p className="text-xs text-slate-500">С 1 января 2025 года ТИМ обязателен для всех проектов ИЖС, что создает огромный спрос на цифровые инструменты.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">Приказ №344/пр</div>
                        <p className="text-xs text-slate-500">Переход на электронный документооборот в строительстве становится стандартом де-факто для госзаказов.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">Дефицит кадров</div>
                        <p className="text-xs text-slate-500">Нехватка инженеров ПТО заставляет компании автоматизировать рутину, чтобы один специалист мог вести больше объектов.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" /> Целевой рынок (SOM)
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li className="flex items-center gap-2">• 45 000+ активных строительных компаний в РФ</li>
                    <li className="flex items-center gap-2">• 12 000 компаний в сегменте МСБ (наш фокус)</li>
                    <li className="flex items-center gap-2">• Средний чек: 120 000 ₽ / год</li>
                    <li className="flex items-center gap-2">• Потенциал: 1.44 млрд ₽ только на подписках</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Твой прогноз по захвату рынка:</h4>
              <p className="text-sm text-slate-500 mb-4">Какой сегмент рынка (SOM) кажется тебе наиболее достижимым в первый год работы? Почему?</p>
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Например: Я считаю, что нужно целиться в субподрядчиков по спецработам, так как у них больше всего бумажной волокиты..."
              ></textarea>
            </div>
          </motion.div>
        ) : view === 'migration' ? (
          <motion.div 
            key="migration"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-5xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Миграция на собственные сервера и РФ-стек</h2>
              <p className="text-slate-600">Стратегия обеспечения технологического суверенитета и соответствия требованиям ФЗ-152.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Infrastructure */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">1. Инфраструктура</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Контейнеризация через Docker & K8s
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    База данных PostgreSQL (Managed в РФ)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    S3-совместимое хранилище для сканов
                  </li>
                </ul>
              </div>

              {/* Step 2: Yandex AI Integration */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 w-fit">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">2. Yandex Cloud AI</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    YandexGPT для анализа смет и приказов
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Yandex Vision OCR для распознавания документов
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Локальный инстанс в дата-центрах РФ
                  </li>
                </ul>
              </div>

              {/* Step 3: Security & Compliance */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 w-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">3. Безопасность</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Соответствие ФЗ-152 (Персональные данные)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Интеграция с ЭЦП через КриптоПро
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    On-premise версия для госкорпораций
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold">Технический план миграции</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">1</div>
                    <div className="font-bold">Backend Refactoring</div>
                  </div>
                  <p className="text-sm text-slate-400 ml-12">Замена Google GenAI SDK на API Yandex Cloud (YandexGPT v3). Настройка проксирования запросов.</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">2</div>
                    <div className="font-bold">Data Sovereignty</div>
                  </div>
                  <p className="text-sm text-slate-400 ml-12">Миграция всех хранилищ данных на территорию РФ. Настройка шифрования по ГОСТ.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">3</div>
                    <div className="font-bold">CI/CD Pipeline</div>
                  </div>
                  <p className="text-sm text-slate-400 ml-12">Настройка автоматического деплоя в Yandex Cloud или на собственные сервера через GitLab Runner.</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">4</div>
                    <div className="font-bold">Legal Compliance</div>
                  </div>
                  <p className="text-sm text-slate-400 ml-12">Прохождение аттестации по требованиям безопасности информации ФСТЭК (при необходимости).</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Zap className="w-5 h-5" />
                <span>Мнение Кофаундера</span>
              </div>
              <p className="text-sm text-indigo-600 leading-relaxed">
                Переход на **Yandex AI** и локальные сервера — это не просто техническая задача, а **стратегическое преимущество** для продаж в госсектор и крупным застройщикам. В РФ сейчас огромный спрос на импортозамещение в PropTech. Использование YandexGPT позволит нам работать с закрытыми контурами данных, что критично для безопасности объектов.
              </p>
            </div>
          </motion.div>
        ) : view === 'stack' ? (
          <motion.div 
            key="stack"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-5xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Технологический стек StroyDoc AI</h2>
              <p className="text-slate-600">Современная архитектура, обеспечивающая скорость, масштабируемость и надежность.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Frontend</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    React 18+ (Functional Components)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    TypeScript (Строгая типизация)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Tailwind CSS (Utility-first styling)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Framer Motion (Анимации)
                  </li>
                </ul>
              </div>

              {/* AI & Logic */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 w-fit">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">AI & Обработка</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    Google Gemini API (LLM & Vision)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    XLSX / SheetJS (Парсинг смет)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    Custom AI Prompts (Промпт-инжиниринг)
                  </li>
                </ul>
              </div>

              {/* Infrastructure */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 w-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Инфраструктура</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Vite (Сборка проекта)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Docker (Контейнеризация)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    CI/CD (Автоматический деплой)
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Почему мы выбрали этот стек?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold">Скорость разработки</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    React и Tailwind позволяют нам мгновенно внедрять новые функции и менять UI под запросы пользователей. TypeScript минимизирует ошибки на этапе написания кода.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold">Готовность к AI</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Архитектура изначально спроектирована под работу с LLM. Мы легко можем переключаться между Gemini, YandexGPT или локальными моделями без переписывания всего приложения.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                <Info className="w-5 h-5" />
                <span>Техническая справка</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Приложение является Single Page Application (SPA). Весь тяжелый анализ документов происходит на стороне AI-моделей, что позволяет интерфейсу оставаться быстрым даже на слабых устройствах прорабов на стройплощадке.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="mvp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl w-full space-y-8 mt-8"
          >
            <button 
              onClick={() => {
                if (subView === 'estimate-detail') setSubView('list');
                else if (subView === 'list') setSubView('projects');
                else if (subView === 'create-project') setSubView('projects');
                else setView('home');
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {subView === 'estimate-detail' ? 'Назад к списку функций' : 
               subView === 'create-project' ? 'Назад к списку проектов' :
               subView === 'list' ? 'Назад к выбору проекта' : 'Назад к выбору вектора'}
            </button>

            {subView === 'projects' ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Мои проекты</h2>
                    <p className="text-slate-600">Выберите существующий проект или создайте новый для начала работы.</p>
                  </div>
                  <button 
                    onClick={() => setSubView('create-project')}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Новый проект
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div 
                      key={project.id} 
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setSubView('list');
                        // Sync actDetails
                        setActDetails(prev => ({
                          ...prev,
                          object: project.object,
                          developer: `${project.developer.name}, ${project.developer.requisites}`,
                          developerSro: project.developer.sro,
                          contractor: `${project.contractor.name}, ${project.contractor.requisites}`,
                          contractorSro: project.contractor.sro,
                          designer: `${project.designer.name}, ${project.designer.requisites}`,
                          designerSro: project.designer.sro,
                          repDeveloper: project.participants.repDeveloper,
                          repContractor: project.participants.repContractor,
                          repContractorSk: project.participants.repContractorSk,
                          repDesigner: project.participants.repDesigner,
                          repSubcontractor: project.participants.repSubcontractor
                        }));
                      }}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Создан: {project.createdAt}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.object}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>12 актов</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>5 участников</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : subView === 'create-project' ? (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">Создание нового проекта</h2>
                  <p className="text-slate-600">Заполните основные данные объекта и реквизиты участников.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Основная информация
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Название проекта (для списка)</label>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder='Напр: ЖК "Горизонт" - Корпус 1'
                          value={newProject.name}
                          onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Полное наименование объекта (для актов)</label>
                        <textarea 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none"
                          placeholder="Жилой комплекс, адрес, корпус..."
                          value={newProject.object}
                          onChange={(e) => setNewProject({...newProject, object: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Companies */}
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Реквизиты компаний
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Developer */}
                      <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                        <h4 className="font-bold text-slate-700">Застройщик / Техзаказчик</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                            placeholder="Название компании"
                            value={newProject.developer?.name}
                            onChange={(e) => setNewProject({...newProject, developer: {...newProject.developer!, name: e.target.value}})}
                          />
                          <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                            placeholder="СРО (номер, ОГРН)"
                            value={newProject.developer?.sro}
                            onChange={(e) => setNewProject({...newProject, developer: {...newProject.developer!, sro: e.target.value}})}
                          />
                          <textarea 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none md:col-span-2 h-20"
                            placeholder="Реквизиты (ОГРН, ИНН, Адрес, Тел)"
                            value={newProject.developer?.requisites}
                            onChange={(e) => setNewProject({...newProject, developer: {...newProject.developer!, requisites: e.target.value}})}
                          />
                        </div>
                      </div>

                      {/* Contractor */}
                      <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                        <h4 className="font-bold text-slate-700">Генподрядчик</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                            placeholder="Название компании"
                            value={newProject.contractor?.name}
                            onChange={(e) => setNewProject({...newProject, contractor: {...newProject.contractor!, name: e.target.value}})}
                          />
                          <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                            placeholder="СРО (номер, ОГРН)"
                            value={newProject.contractor?.sro}
                            onChange={(e) => setNewProject({...newProject, contractor: {...newProject.contractor!, sro: e.target.value}})}
                          />
                          <textarea 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none md:col-span-2 h-20"
                            placeholder="Реквизиты (ОГРН, ИНН, Адрес, Тел)"
                            value={newProject.contractor?.requisites}
                            onChange={(e) => setNewProject({...newProject, contractor: {...newProject.contractor!, requisites: e.target.value}})}
                          />
                        </div>
                      </div>

                      {/* Designer */}
                      <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                        <h4 className="font-bold text-slate-700">Проектировщик</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                            placeholder="Название компании"
                            value={newProject.designer?.name}
                            onChange={(e) => setNewProject({...newProject, designer: {...newProject.designer!, name: e.target.value}})}
                          />
                          <input 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                            placeholder="СРО (номер, ОГРН)"
                            value={newProject.designer?.sro}
                            onChange={(e) => setNewProject({...newProject, designer: {...newProject.designer!, sro: e.target.value}})}
                          />
                          <textarea 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none md:col-span-2 h-20"
                            placeholder="Реквизиты (ОГРН, ИНН, Адрес, Тел)"
                            value={newProject.designer?.requisites}
                            onChange={(e) => setNewProject({...newProject, designer: {...newProject.designer!, requisites: e.target.value}})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Участники и подписи
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Представитель Заказчика (Технадзор)</label>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          placeholder="Должность, ФИО, НРС, Приказ..."
                          value={newProject.participants?.repDeveloper}
                          onChange={(e) => setNewProject({...newProject, participants: {...newProject.participants!, repDeveloper: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Представитель Подрядчика (Прораб)</label>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          placeholder="Должность, ФИО, Приказ..."
                          value={newProject.participants?.repContractor}
                          onChange={(e) => setNewProject({...newProject, participants: {...newProject.participants!, repContractor: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Представитель Подрядчика (Технадзор)</label>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          placeholder="Должность, ФИО, НРС, Приказ..."
                          value={newProject.participants?.repContractorSk}
                          onChange={(e) => setNewProject({...newProject, participants: {...newProject.participants!, repContractorSk: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Представитель Проектировщика (Авторский надзор)</label>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          placeholder="Должность, ФИО, Приказ..."
                          value={newProject.participants?.repDesigner}
                          onChange={(e) => setNewProject({...newProject, participants: {...newProject.participants!, repDesigner: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Представитель Субподрядчика (если есть)</label>
                        <input 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          placeholder="Должность, ФИО, Приказ..."
                          value={newProject.participants?.repSubcontractor}
                          onChange={(e) => setNewProject({...newProject, participants: {...newProject.participants!, repSubcontractor: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleCreateProject}
                      disabled={!newProject.name || !newProject.object}
                      className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      Создать проект и начать работу
                    </button>
                  </div>
                </div>
              </div>
            ) : subView === 'list' ? (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>{activeProject?.name}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Функционал MVP</h2>
                    <p className="text-slate-600">Определяем "джентльменский набор" функций для быстрого запуска.</p>
                  </div>
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    Стадия: Проектирование
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mvpFeatures.map((feature) => (
                    <div key={feature.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          {feature.icon}
                        </div>
                        <h3 className="font-bold text-slate-900">{feature.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          feature.status.includes('Priority 1') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {feature.status}
                        </span>
                        {feature.id === 'estimate' && (
                          <button 
                            onClick={() => setSubView('estimate-detail')}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Настроить логику
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Рекомендация Кофаундера</span>
                  </div>
                  <p className="text-sm text-emerald-600 leading-relaxed">
                    Для первой версии (MVP) я рекомендую сфокусироваться **только на Priority 1**. 
                    Связка "Смета → АОСР" и мобильный ОЖР — это то, за что пользователи начнут платить сразу. 
                    AI-валидатор и сложные реестры оставим для версии 1.1.
                  </p>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stepper */}
                <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
                  {['upload', 'selection', 'mapping', 'preview'].map((step, idx) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        estimateStep === step ? 'bg-blue-600 text-white' : 
                        ['upload', 'selection', 'mapping', 'preview'].indexOf(estimateStep) > idx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < 3 && <div className={`w-12 h-0.5 mx-2 ${['upload', 'selection', 'mapping', 'preview'].indexOf(estimateStep) > idx ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  {estimateStep === 'upload' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          accept=".xlsx, .xls, .xml, .csv"
                        />
                        <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                          {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-900">1. Загрузите смету</p>
                          <p className="text-sm text-slate-500">AI определит структуру работ</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => orderInputRef.current?.click()}
                        className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer group"
                      >
                        <input 
                          type="file" 
                          ref={orderInputRef} 
                          onChange={handleOrderScan} 
                          className="hidden" 
                          accept="image/*, .pdf"
                        />
                        <div className="p-4 bg-rose-50 rounded-full text-rose-600 group-hover:scale-110 transition-transform">
                          {isScanningOrder ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8" />}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-900">2. Сканируйте приказы</p>
                          <p className="text-sm text-slate-500">Авто-заполнение ответственных</p>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex flex-col items-center gap-4">
                        <button 
                          onClick={() => {
                            setEstimateData([
                              { id: 1, name: "Разработка грунта в траншеях", unit: "100 м3", amount: "1.25" },
                              { id: 2, name: "Устройство песчаного основания", unit: "м3", amount: "45.0" },
                              { id: 3, name: "Укладка трубопровода ПНД 110мм", unit: "м", amount: "120.0" },
                              { id: 4, name: "Обратная засыпка пазух", unit: "м3", amount: "38.5" },
                            ]);
                            setEstimateStep('selection');
                          }}
                          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg"
                        >
                          Использовать демо-данные
                        </button>
                      </div>
                    </div>
                  )}

                  {estimateStep === 'selection' && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Выбор данных из сметы</h3>
                        <p className="text-slate-500 text-sm">Система распознала колонки. Выберите нужные строки для акта.</p>
                      </div>

                      {/* Column Selection */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">1. Выберите колонки для использования в акте:</h4>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={useColumns.name} 
                              onChange={() => setUseColumns(prev => ({ ...prev, name: !prev.name }))}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Наименование</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={useColumns.unit} 
                              onChange={() => setUseColumns(prev => ({ ...prev, unit: !prev.unit }))}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Ед. изм.</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={useColumns.amount} 
                              onChange={() => setUseColumns(prev => ({ ...prev, amount: !prev.amount }))}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Количество</span>
                          </label>
                        </div>
                      </div>

                      {/* Row Selection Table */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">2. Выберите строки для создания акта:</h4>
                          <button 
                            onClick={toggleAll}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                          >
                            {selectedRows.length === estimateData.length ? 'Снять все' : 'Выбрать все'}
                          </button>
                        </div>
                        
                        <div className="overflow-hidden border border-slate-100 rounded-xl">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-bottom border-slate-100">
                              <tr>
                                <th className="p-4 w-10"></th>
                                <th className="p-4 font-semibold text-slate-600">Наименование</th>
                                <th className="p-4 font-semibold text-slate-600">Ед. изм.</th>
                                <th className="p-4 font-semibold text-slate-600">Кол-во</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {estimateData.map((row) => (
                                <tr 
                                  key={row.id} 
                                  className={`transition-colors cursor-pointer ${selectedRows.includes(row.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                                  onClick={() => toggleRow(row.id)}
                                >
                                  <td className="p-4">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedRows.includes(row.id)}
                                      onChange={() => {}} // Handled by row click
                                      className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                    />
                                  </td>
                                  <td className={`p-4 font-medium ${useColumns.name ? 'text-slate-900' : 'text-slate-300 line-through'}`}>
                                    <div>{row.name}</div>
                                    {row.materials && row.materials.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {row.materials.map((m: string, i: number) => (
                                          <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                            {m}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className={`p-4 ${useColumns.unit ? 'text-slate-600' : 'text-slate-300 line-through'}`}>
                                    {row.unit}
                                  </td>
                                  <td className={`p-4 font-mono ${useColumns.amount ? 'text-slate-600' : 'text-slate-300 line-through'}`}>
                                    {row.amount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                          Выбрано строк: <span className="font-bold text-blue-600">{selectedRows.length}</span>
                        </div>
                        <button 
                          disabled={selectedRows.length === 0 || isAnalyzing}
                          onClick={analyzeMaterials}
                          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              AI анализирует материалы...
                            </>
                          ) : (
                            <>
                              Далее: Привязка к шаблону
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {estimateStep === 'mapping' && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Привязка к шаблону АОСР</h3>
                        <p className="text-slate-500 text-sm">Мы автоматически сопоставили данные. Проверьте связи перед генерацией.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Source Fields */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Поля из сметы:</h4>
                          {['Наименование', 'Ед. изм.', 'Количество'].map(field => (
                            <div key={field} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group">
                              <span className="text-sm font-medium text-slate-700">{field}</span>
                              <div className="w-6 h-0.5 bg-blue-400 group-hover:w-12 transition-all" />
                            </div>
                          ))}
                        </div>

                        {/* Target Fields */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Поля шаблона АОСР:</h4>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-700">1. Наименование работ</span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-700">3. Объем выполненных работ</span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-700">3. Материалы (AI-экстракция)</span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={() => setEstimateStep('selection')}
                          className="text-sm font-bold text-slate-500 hover:text-slate-900"
                        >
                          Назад
                        </button>
                        <button 
                          onClick={() => setEstimateStep('preview')}
                          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          Сгенерировать черновик
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {estimateStep === 'preview' && (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold text-slate-900">Предпросмотр АОСР</h3>
                          <p className="text-slate-500 text-sm">
                            Сформировано актов: <span className="font-bold text-blue-600">{selectedRows.length}</span>. 
                            По одному на каждую работу.
                          </p>
                        </div>
                        
                        {selectedRows.length > 1 && (
                          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <button 
                              disabled={currentActIndex === 0}
                              onClick={() => setCurrentActIndex(prev => prev - 1)}
                              className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-colors"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="text-sm font-bold text-slate-700 min-w-[80px] text-center">
                              Акт {currentActIndex + 1} из {selectedRows.length}
                            </div>
                            <button 
                              disabled={currentActIndex === selectedRows.length - 1}
                              onClick={() => setCurrentActIndex(prev => prev + 1)}
                              className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Official Document Template (Order 344/pr) - High Fidelity */}
                      <div id="aosr-document" className="bg-white p-12 border border-slate-300 rounded-sm shadow-2xl font-serif text-[10px] leading-[1.1] space-y-3 max-w-4xl mx-auto text-black overflow-y-auto max-h-[850px] print:p-0 print:shadow-none print:border-none print:max-h-none">
                        {/* Top Right Header */}
                        <div className="text-right text-[9px] mb-6 leading-tight">
                          Приказ Минстроя №344/пр от 16.05.2023<br />
                          приложение №3
                        </div>

                        {/* Section: Object */}
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="whitespace-nowrap">Объект капитального строительства</span>
                            <input 
                              className="flex-1 border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50" 
                              value={actDetails.object}
                              onChange={(e) => setActDetails({...actDetails, object: e.target.value})}
                            />
                          </div>
                          <div className="text-[6px] text-center italic leading-none">
                            (наименование объекта капитального строительства в соответствии с проектной документацией, почтовый или строительный адрес объекта капитального строительства)
                          </div>
                        </div>

                        {/* Section: Developer */}
                        <div className="space-y-1">
                          <div className="font-bold leading-tight">
                            Застройщик, технический заказчик, лицо, ответственное за эксплуатацию здания, сооружения, или региональный оператор
                          </div>
                          <textarea 
                            rows={2}
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                            value={actDetails.developer}
                            onChange={(e) => setActDetails({...actDetails, developer: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            (фамилия, имя, отчество (последнее - при наличии), адрес места жительства, ОГРНИП, ИНН индивидуального предпринимателя, полное и (или) сокращенное наименование, ОГРН, ИНН, адрес юридического лица в пределах его нахождения, телефон или факс,
                          </div>
                          <input 
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50" 
                            value={actDetails.developerSro}
                            onChange={(e) => setActDetails({...actDetails, developerSro: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            полное и (или) сокращенное наименование, ОГРН, ИНН саморегулируемой организации, членом которой является указанное юридическое лицо или индивидуальный предприниматель (за исключением случаев, когда членство в саморегулируемых организациях в области, строительства, реконструкции, капитального ремонта объектов капитального строительства не требуется); фамилия, имя, отчество
                          </div>
                          <div className="border-b border-black min-h-[1.2em]"></div>
                          <div className="text-[6px] text-center italic leading-none">
                            (последнее - при наличии), паспортные данные, адрес места жительства, телефон или факс - для физических лиц, не являющихся индивидуальными предпринимателями)
                          </div>
                        </div>

                        {/* Section: Contractor */}
                        <div className="space-y-1">
                          <div className="font-bold leading-tight">
                            Лицо, осуществляющее строительство, реконструкцию, капитальный ремонт
                          </div>
                          <textarea 
                            rows={1}
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                            value={actDetails.contractor}
                            onChange={(e) => setActDetails({...actDetails, contractor: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            (фамилия, имя, отчество (последнее - при наличии), адрес места жительства, ОГРНИП, ИНН индивидуального предпринимателя,
                          </div>
                          <div className="border-b border-black min-h-[1.2em]"></div>
                          <div className="text-[6px] text-center italic leading-none">
                            полное и (или) сокращенное наименование, ОГРН, ИНН, адрес юридического лица в пределах его местонахождения, телефон или факс,
                          </div>
                          <input 
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50" 
                            value={actDetails.contractorSro}
                            onChange={(e) => setActDetails({...actDetails, contractorSro: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            полное и (или) сокращенное наименование, ОГРН, ИНН саморегулируемой организации, членом которой является указанное юридическое лицо или индивидуальный предприниматель (за исключением случаев, когда членство в саморегулируемых организациях в области строительства, реконструкции, капитального ремонта объектов капитального строительства не требуется)
                          </div>
                        </div>

                        {/* Section: Designer */}
                        <div className="space-y-1">
                          <div className="font-bold leading-tight">
                            Лицо, осуществляющее подготовку проектной документации
                          </div>
                          <textarea 
                            rows={1}
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                            value={actDetails.designer}
                            onChange={(e) => setActDetails({...actDetails, designer: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            (фамилия, имя, отчество (последнее - при наличии), адрес места жительства, ОГРНИП, ИНН индивидуального предпринимателя,
                          </div>
                          <div className="border-b border-black min-h-[1.2em]"></div>
                          <div className="text-[6px] text-center italic leading-none">
                            полное и (или) сокращенное наименование, ОГРН, ИНН, адрес юридического лица в пределах его места нахождения, телефон или факс,
                          </div>
                          <input 
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50" 
                            value={actDetails.designerSro}
                            onChange={(e) => setActDetails({...actDetails, designerSro: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            полное и (или) сокращенное наименование, ОГРН, ИНН саморегулируемой организации, членом которой является указанное юридическое лицо или индивидуальный предприниматель (за исключением случаев, когда членство в саморегулируемых организациях в области архитектурно-строительного проектирования не требуется)
                          </div>
                        </div>

                        {/* Title */}
                        <div className="text-center pt-6 space-y-1">
                          <div className="font-bold text-sm">АКТ</div>
                          <div className="font-bold text-sm">освидетельствования скрытых работ</div>
                        </div>

                        {/* Number and Date */}
                        <div className="flex justify-between items-end pt-2">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold">№</span>
                            <input 
                              className="border-b border-black w-32 px-2 bg-blue-50/30 text-center outline-none" 
                              value={`${actDetails.numberPrefix}${currentActIndex + 1}`}
                              onChange={(e) => setActDetails({...actDetails, numberPrefix: e.target.value})}
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                              <span>"</span>
                              <input className="border-b border-black w-8 text-center bg-blue-50/30 outline-none" value={actDetails.date} onChange={(e) => setActDetails({...actDetails, date: e.target.value})} />
                              <span>"</span>
                              <input className="border-b border-black w-24 text-center bg-blue-50/30 outline-none" value={actDetails.month} onChange={(e) => setActDetails({...actDetails, month: e.target.value})} />
                              <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.year} onChange={(e) => setActDetails({...actDetails, year: e.target.value})} />
                              <span>г.</span>
                            </div>
                            <div className="text-[6px] italic">(дата составления акта)</div>
                          </div>
                        </div>

                        {/* Representatives Section */}
                        <div className="space-y-4 pt-4">
                          {/* Rep 1 */}
                          <div className="space-y-1">
                            <div className="font-bold leading-tight">
                              Представитель застройщика, технического заказчика, лица, ответственного за эксплуатацию здания, сооружения, или регионального оператора по вопросам строительного контроля
                            </div>
                            <textarea 
                              rows={2}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.repDeveloper}
                              onChange={(e) => setActDetails({...actDetails, repDeveloper: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (должность (при наличии), фамилия, инициалы, идентификационный номер в национальном реестре специалистов в области строительства (за исключением случаев, когда членство в саморегулируемых организациях в области строительства, реконструкции, капитального ремонта объектов капитального строительства не требуется), реквизиты распорядительного документа, подтверждающего полномочия,
                            </div>
                            <div className="border-b border-black min-h-[1.2em]"></div>
                            <div className="text-[6px] text-center italic leading-none">
                              с указанием полного и (или) сокращенного наименования, ОГРН, ИНН, адреса юридического лица в пределах его места нахождения (в случае осуществления строительного контроля на основании договора with застройщиком или техническим заказчиком), фамилии, имени, отчества (последнее - при наличии), адреса места жительства, ОГРНИП, ИНН индивидуального предпринимателя (в случае осуществления строительного контроля на основании договора с застройщиком или техническим заказчиком)
                            </div>
                          </div>

                          {/* Rep 2 */}
                          <div className="space-y-1">
                            <div className="font-bold leading-tight">
                              Представитель лица, осуществляющего строительство, реконструкцию, капитальный ремонт
                            </div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.repContractor}
                              onChange={(e) => setActDetails({...actDetails, repContractor: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (должность (при наличии), фамилия, инициалы, реквизиты распорядительного документа, подтверждающего полномочия)
                            </div>
                          </div>

                          {/* Rep 3 */}
                          <div className="space-y-1">
                            <div className="font-bold leading-tight">
                              Представитель лица, осуществляющего строительство, реконструкцию, капитальный ремонт, по вопросам строительного контроля
                            </div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.repContractorSk}
                              onChange={(e) => setActDetails({...actDetails, repContractorSk: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (должность (при наличии), фамилия, инициалы, идентификационный номер в национальном реестре специалистов в области строительства (за исключением случаев, когда членство в саморегулируемых организациях в области строительства, реконструкции, капитального ремонта объектов капитального строительства не требуется), реквизиты распорядительного документа, подтверждающего полномочия)
                            </div>
                          </div>

                          {/* Rep 4 */}
                          <div className="space-y-1">
                            <div className="font-bold leading-tight">
                              Представитель лица, осуществляющего подготовку проектной документации (в случае привлечения застройщиком лица, осуществляющего подготовку проектной документации, для проверки соответствия выполняемых работ проектной документации согласно части 2 статьи 53 Градостроительного кодекса Российской Федерации)
                            </div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.repDesigner}
                              onChange={(e) => setActDetails({...actDetails, repDesigner: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (должность (при наличии), фамилия, инициалы, реквизиты распорядительного документа, подтверждающего полномочия, с указанием полного и (или) сокращенного наименования, ОГРН, ИНН, адреса юридического лица в пределах его места нахождения, фамилии, имени, отчества (последнее - при наличии), адреса места жительства, ОГРНИП, ИНН индивидуального предпринимателя)
                            </div>
                          </div>

                          {/* Rep 5 */}
                          <div className="space-y-1">
                            <div className="font-bold leading-tight">
                              Представитель лица, выполнившего работы, подлежащие освидетельствованию (в случае выполнения работ по договорам о строительстве, реконструкции, капитальном ремонте объектов капитального строительства, заключенным с иными лицами)
                            </div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.repSubcontractor}
                              onChange={(e) => setActDetails({...actDetails, repSubcontractor: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (должность (при наличии), фамилия, инициалы, реквизиты распорядительного документа, подтверждающего полномочия,
                            </div>
                            <div className="border-b border-black min-h-[1.2em]"></div>
                            <div className="text-[6px] text-center italic leading-none">
                              с указанием полного и (или) сокращенного наименования, ОГРН, ИНН, адреса юридического лица в пределах его места нахождения, фамилии, имени, отчества (последнее - при наличии), адреса места жительства, ОГРНИП, ИНН индивидуального предпринимателя)
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 font-bold">произвели осмотр работ, выполненных</div>
                        <div className="space-y-1">
                          <div className="border-b border-black min-h-[1.2em] px-2 bg-blue-50/30">
                            {actDetails.contractor.split(',')[0]}
                          </div>
                          <div className="text-[6px] text-center italic leading-none">
                            (полное и (или) сокращенное наименование или фамилия, имя, отчество (последнее - при наличии) лица, выполнившего работы, подлежащие освидетельствованию)
                          </div>
                        </div>

                        <div className="font-bold pt-2">и составили настоящий акт о нижеследующем:</div>

                        {/* Numbered Items */}
                        <div className="space-y-4 pt-2">
                          <div className="space-y-1">
                            <div className="font-bold">1. К освидетельствованию предъявлены следующие работы:</div>
                            <div className="border-b border-black min-h-[2.4em] px-2 bg-yellow-50/50 font-bold">
                              {selectedRows.length > 0 ? (
                                estimateData.find(r => r.id === selectedRows[currentActIndex])?.name
                              ) : 'Работы не выбраны'}
                            </div>
                            <div className="text-[6px] text-center italic leading-none">(наименование скрытых работ)</div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-bold">2. Работы выполнены по проектной документации</div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.projectDoc}
                              onChange={(e) => setActDetails({...actDetails, projectDoc: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (номер, другие реквизиты чертежа, наименование проектной и/или рабочей документации, сведения о лицах, осуществляющих подготовку раздела проектной и/или рабочей документации)
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-bold">3. При выполнении работ применены</div>
                            <textarea 
                              rows={2}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.materials}
                              onChange={(e) => setActDetails({...actDetails, materials: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (наименования строительных материалов (изделий),
                            </div>
                            <div className="border-b border-black min-h-[1.2em]"></div>
                            <div className="text-[6px] text-center italic leading-none">
                              реквизиты сертификатов и (или) других документов, подтверждающих их качество и безопасность, в случае если необходимо указывать более 5 документов, указывается ссылка на их реестр, который является неотъемлемой частью акта)
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-bold">4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:</div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.docs}
                              onChange={(e) => setActDetails({...actDetails, docs: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных
                            </div>
                            <div className="border-b border-black min-h-[1.2em]"></div>
                            <div className="text-[6px] text-center italic leading-none">
                              и иных испытаний выполненных работ, проведенных в процессе строительного контроля)
                            </div>
                          </div>

                          <div className="flex gap-12">
                            <div className="flex items-baseline gap-1">
                              <span className="font-bold">5. Даты: начала работ</span>
                              <span>"</span>
                              <input className="border-b border-black w-8 text-center bg-blue-50/30 outline-none" value={actDetails.startDate} onChange={(e) => setActDetails({...actDetails, startDate: e.target.value})} />
                              <span>"</span>
                              <input className="border-b border-black w-24 text-center bg-blue-50/30 outline-none" value={actDetails.startMonth} onChange={(e) => setActDetails({...actDetails, startMonth: e.target.value})} />
                              <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.startYear} onChange={(e) => setActDetails({...actDetails, startYear: e.target.value})} />
                              <span>г.</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-bold">окончания работ</span>
                              <span>"</span>
                              <input className="border-b border-black w-8 text-center bg-blue-50/30 outline-none" value={actDetails.endDate} onChange={(e) => setActDetails({...actDetails, endDate: e.target.value})} />
                              <span>"</span>
                              <input className="border-b border-black w-24 text-center bg-blue-50/30 outline-none" value={actDetails.endMonth} onChange={(e) => setActDetails({...actDetails, endMonth: e.target.value})} />
                              <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.endYear} onChange={(e) => setActDetails({...actDetails, endYear: e.target.value})} />
                              <span>г.</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-bold">6. Работы выполнены в соответствии с</div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.standards}
                              onChange={(e) => setActDetails({...actDetails, standards: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (наименования и структурные единицы технических регламентов,
                            </div>
                            <div className="border-b border-black min-h-[1.2em]"></div>
                            <div className="text-[6px] text-center italic leading-none">
                              иных нормативных правовых актов, разделы проектной и (или) рабочей документации)
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-bold">7. Разрешается производство последующих работ</div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.nextWorks}
                              onChange={(e) => setActDetails({...actDetails, nextWorks: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (наименование работ, строительных конструкций, участков сетей инженерно-технического обеспечения)
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4">
                          <div className="flex gap-2">
                            <span className="font-bold">Дополнительные сведения</span>
                            <div className="flex-1 border-b border-black"></div>
                          </div>
                          <div className="flex gap-2">
                            <span>Акт составлен в</span>
                            <input className="border-b border-black w-12 text-center bg-blue-50/30 outline-none" value={actDetails.copies} onChange={(e) => setActDetails({...actDetails, copies: e.target.value})} />
                            <span>экземплярах (в случае заполнения акта на бумажном носителе).</span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold">Приложения:</div>
                            <textarea 
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" 
                              value={actDetails.apps}
                              onChange={(e) => setActDetails({...actDetails, apps: e.target.value})}
                            />
                            <div className="text-[6px] text-center italic leading-none">
                              (исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных и иных испытаний)
                            </div>
                          </div>
                        </div>

                        {/* Bottom Signatures - All 5 from template */}
                        <div className="pt-8 space-y-6">
                          {[
                            { label: "Представитель застройщика, технического заказчика...", name: actDetails.repDeveloper.split(',')[1]?.trim() || "Иванов И.И." },
                            { label: "Представитель лица, осуществляющего строительство...", name: actDetails.repContractor.split(',')[1]?.trim() || "Петров П.П." },
                            { label: "Представитель лица, осуществляющего строительство, по вопросам СК...", name: actDetails.repContractorSk.split(',')[1]?.trim() || "Сидоров С.С." },
                            { label: "Представитель лица, осуществляющего подготовку проектной документации...", name: actDetails.repDesigner.split(',')[1]?.trim() || "Кузнецов А.С." },
                            { label: "Представитель лица, выполнившего работы, подлежащие освидетельствованию...", name: actDetails.repSubcontractor.split(',')[1]?.trim() || "Васильев И.Н." }
                          ].map((sig, i) => (
                            <div key={i} className="space-y-1">
                              <div className="font-bold leading-tight">{sig.label}</div>
                              <div className="flex justify-between gap-4">
                                <div className="flex-1 border-b border-black text-center text-[8px] bg-blue-50/30">{sig.name}</div>
                                <div className="w-32 border-b border-black"></div>
                              </div>
                              <div className="flex justify-between text-[6px] italic px-4">
                                <span>(фамилия, инициалы)</span>
                                <span>(подпись)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={() => setEstimateStep('mapping')}
                          className="text-sm font-bold text-slate-500 hover:text-slate-900"
                        >
                          Изменить мэппинг
                        </button>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => window.print()}
                            className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Печать
                          </button>
                          <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Подписать ЭЦП
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {Object.keys(performanceMetrics).length > 0 && (
                    <div className="pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Производительность AI:
                      </div>
                      {performanceMetrics.estimateParsing && (
                        <span className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Смета: {performanceMetrics.estimateParsing}ms</span>
                      )}
                      {performanceMetrics.orderScanning && (
                        <span className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Приказы: {performanceMetrics.orderScanning}ms</span>
                      )}
                      {performanceMetrics.materialAnalysis && (
                        <span className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Материалы: {performanceMetrics.materialAnalysis}ms</span>
                      )}
                    </div>
                  )}
                </div>

                {estimateStep === 'selection' && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                    <Zap className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      **AI-подсказка:** Я проанализировал смету. Строки 1 и 2 обычно объединяются в один акт на земляные работы. Хотите сгруппировать?
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button (Visible when vector selected on home) */}
      {selectedVector && view === 'home' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8"
        >
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Начать работу по вектору {selectedVector}
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
