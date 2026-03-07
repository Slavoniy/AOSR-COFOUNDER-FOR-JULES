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
  FileCheck, FileSignature, ClipboardList, Info, Loader2, Upload,
  ListChecks, Globe, Database, UserCheck, BookOpen, Terminal, Cloud, MessageSquare,
  Cpu, Layout, Lock, Share2, GitBranch, Server, Activity, Workflow,
  FileCode, Code2, Copy
} from 'lucide-react';
import { ThinkingLevel } from "@google/genai";

// Modular Imports
import { Vector, Project, ActDetail, EstimateItem, Certificate } from './modules/shared/domain/types';
import { documentService } from './modules/documents/application/documentService';
import { aiService } from './modules/ai-engine/infrastructure/aiService';
import { eventBus } from './modules/shared/infrastructure/eventBus';
import { authService } from './modules/auth/application/authService';
import { projectService } from './modules/projects/application/projectService';
import { mockProjects } from './modules/projects/infrastructure/mockProjects';

import { VECTORS, BMC_DATA } from './modules/shared/domain/constants';
import { ProfileView } from './components/views/ProfileView';
import { MVPView } from './components/views/MVPView';
import { AuthView } from './components/views/AuthView';


const vectors = VECTORS;
const bmcData = BMC_DATA;

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
  const [view, setView] = useState<'home' | 'analysis' | 'mvp' | 'business' | 'market' | 'persona' | 'migration' | 'stack' | 'auth' | 'profile'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileTab, setProfileTab] = useState<'projects' | 'estimates'>('projects');

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await authService.checkAuth();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
        const myProjects = await projectService.fetchMyProjects();
        setProjects(myProjects);
      }
    };
    initAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;
    try {
      const loggedUser = await authService.login(email, password);
      setIsAuthenticated(true);
      setUser(loggedUser);
      const myProjects = await projectService.fetchMyProjects();
      setProjects(myProjects);
      setView('profile');
    } catch (err) {
      alert('Ошибка входа');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value;
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;
    try {
      const registeredUser = await authService.register(name, email, password);
      setIsAuthenticated(true);
      setUser(registeredUser);
      setView('profile');
    } catch (err: any) {
      alert(err.message || 'Ошибка регистрации');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setView('home');
  };

  const handleStatusChange = async (actId: string, status: 'draft' | 'signed') => {
    try {
      await projectService.updateActStatus(actId, status);
      setProjects([...projectService.getProjects()]);
    } catch (err) {
      alert('Ошибка обновления статуса');
    }
  };
  const [subView, setSubView] = useState<'list' | 'estimate-detail' | 'projects' | 'create-project' | 'roadmap' | 'certificates' | 'future-plan'>('list');
  const [selectedVector, setSelectedVector] = useState<number | null>(null);
  const [currentActIndex, setCurrentActIndex] = useState(0);
  
  const [certificates, setCertificates] = useState<any[]>([
    { id: '1', name: 'Бетон Б25 П4 W6 F150', provider: 'Петрович', date: '12.01.2026', file: 'cert_beton_01.pdf', status: 'active' },
    { id: '2', name: 'Арматура А500С d12', provider: 'Петрович', date: '05.02.2026', file: 'cert_arm_12.pdf', status: 'active' },
  ]);
  const [isParsingCerts, setIsParsingCerts] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const updateActInProject = (actId: string, field: keyof ActDetail, value: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          acts: p.acts.map(a => a.id === actId ? { ...a, [field]: value } : a)
        };
      }
      return p;
    }));
  };

  const deleteActFromProject = (actId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот акт?')) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          acts: p.acts.filter(a => a.id !== actId)
        };
      }
      return p;
    }));
  };

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

  const handleCreateProject = async () => {
    try {
      const project = await projectService.addProject(newProject);
      setProjects([...projectService.getProjects()]);
      setActiveProjectId(project.id);
      
      if (view === 'profile') {
        setProfileTab('projects');
        setSubView('list');
      } else {
        setSubView('list');
      }
      
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
    } catch {
      alert('Ошибка создания проекта');
    }
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


  const handleDownloadDocx = async () => {
    const docxUtils = await import('./utils/docxUtils').catch(() => import('./utils/docxUtils'));

    // Derived values as requested:
    // zakazchik2: only name from zakazchik1
    const zakazchik2 = actDetails.zakazchik1.split(',').pop()?.trim() || actDetails.zakazchik1;
    // stroiteli21: only name from stroiteli11
    const stroiteli21 = actDetails.stroiteli11.split(',').pop()?.trim() || actDetails.stroiteli11;
    // stroiteli22: only name from stroiteli12
    const stroiteli22 = actDetails.stroiteli12.split(',').pop()?.trim() || actDetails.stroiteli12;
    // projectirovshik2: only name from projectirovshik1
    const projectirovshik2 = actDetails.projectirovshik1.split(',').pop()?.trim() || actDetails.projectirovshik1;
    // stroiteli32: only name from stroiteli3
    const stroiteli32 = actDetails.stroiteli3.split(',').pop()?.trim() || actDetails.stroiteli3;

    // stroiteli (short company name) "оставить только название компании"
    // Usually it's the first part before the comma
    const stroiteliShort = actDetails.stroiteli.split(',')[0]?.trim() || actDetails.stroiteli;

    const data = {
      ...actDetails,
      D1: actDetails.startDate,
      M1: actDetails.startMonth,
      Y1: actDetails.startYear,
      D2: actDetails.endDate,
      M2: actDetails.endMonth,
      Y2: actDetails.endYear,
      D: actDetails.date,
      M: actDetails.month,
      Y: actDetails.year,
      N: actDetails.copies,
      DOP: actDetails.apps,
      rabota: actDetails.workName || actDetails.project, // Fallback
      project: actDetails.projectDoc,
      material: actDetails.materials,
      SNIP: actDetails.standards,
      Next: actDetails.nextWorks,
      '№': `${actDetails.numberPrefix}${currentActIndex !== undefined ? currentActIndex + 1 : 1}`,

      // Derived fields
      zakazchik2,
      stroiteli21,
      stroiteli22,
      projectirovshik2,
      stroiteli32,

      // Overwrite stroiteli with short for the specific tag in docx if it was separate, but DOCX only has 'stroiteli'.
      // If docx uses {{stroiteli}} for both full and short, replacing it might affect both.
      // But the docx only has {{stroiteli}} tag.
      // We will leave it as actDetails.stroiteli. The user will need to adjust the docx if they want both full and short via different tags.
    };

    docxUtils.generateDocx('/aosr_template.docx', data, `АОСР_${data['№'].replace(/\//g, '_')}.docx`);
  };

  const [actDetails, setActDetails] = useState({
    numberPrefix: "12/ПТО-",
    date: "28",
    month: "февраля",
    year: "2026",
    object: "Жилой комплекс \"Горизонт\", Корпус 1, г. Москва, ул. Строителей, 25",
    zakazchik: "ООО \"ГлавСтройИнвест\", ОГРН 1234567890123, ИНН 7701234567, 123456, г. Москва, ул. Ленина, д. 1, тел. +7 (495) 123-45-67",
    stroiteli: "ООО \"СпецМонтажСтрой\", ОГРН 9876543210987, ИНН 7705554433, г. Москва, ул. Профсоюзная, 10",
    projectirovshik: "ООО \"ПроектЦентр\", ОГРН 1112223334445, ИНН 7709998877, г. Москва, наб. Академика Туполева, 15",
    zakazchik1: "Инженер СК, Иванов Иван Иванович, НРС С-77-123456, Приказ №45 от 10.01.2026",
    stroiteli11: "Производитель работ, Петров Петр Петрович, Приказ №12 от 15.01.2026",
    stroiteli12: "Специалист СК, Сидоров Сидор Сидорович, НРС С-77-654321, Приказ №8 от 12.01.2026",
    projectirovshik1: "ГИП, Кузнецов Алексей Сергеевич, Приказ №2 от 05.01.2026, ООО \"ПроектЦентр\"",
    stroiteli3: "Мастер, Васильев Игорь Николаевич, Приказ №3 от 01.02.2026",
    workName: "Разработка грунта в траншеях",
    projectDoc: "Шифр 2024-05-КЖ, лист 12, Раздел 4 \"Конструктивные решения\"",
    materials: "Бетон B25 W6 F150 (Сертификат соответствия №098765), Арматура А500С (Паспорт качества №1122)",
    shema: "Исполнительная схема №5",
    ispitaniya: "результаты испытаний бетона (протокол №44)",
    startDate: "25",
    startMonth: "февраля",
    startYear: "2026",
    endDate: "28",
    endMonth: "февраля",
    endYear: "2026",
    standards: "СП 70.13330.2012 Несущие и ограждающие конструкции",
    nextWorks: "Устройство гидроизоляции",
    copies: "3",
    apps: "Паспорта и сертификаты на материалы, исполнительные схемы, протоколы испытаний"
  });

  // Estimate Module State
  const [estimateStep, setEstimateStep] = useState<'upload' | 'selection' | 'mapping' | 'preview'>('upload');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [useColumns, setUseColumns] = useState({ name: true, unit: true, amount: true });
  const [estimateData, setEstimateData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const [isScanningOrder, setIsScanningOrder] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    estimateParsing?: number;
    orderScanning?: number;
    materialAnalysis?: number;
  }>({});

  // Sync materials when switching acts in preview
  useEffect(() => {
    if (estimateStep === 'preview' && selectedRows.length > 0) {
      const currentWork = estimateData.find(r => r.id === selectedRows[currentActIndex]);
      if (currentWork && currentWork.materialsAI) {
        setActDetails(prev => ({
          ...prev,
          materials: currentWork.materialsAI
        }));
      }
    }
  }, [currentActIndex, estimateStep, selectedRows, estimateData]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const startTime = Date.now();
    try {
      setActDetails(prev => ({ ...prev, workName: '' }));
      const parsed = await documentService.parseEstimate(file);
      
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

      const data = await aiService.generateJSON<any>([
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
      ]);
      
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
      const updatedEstimateData = [...estimateData];
      const selectedWorks = updatedEstimateData.filter(row => selectedRows.includes(row.id));
      
      const newActs: ActDetail[] = [];

      for (const work of selectedWorks) {
        const existingMaterials = work.materials?.join(', ') || '';

        let aiData = { materials: '', nextWorks: '', standards: '' };
        try {
          aiData = await aiService.generateJSON<any>(`Ты - эксперт ПТО. Проанализируй работу и предложи данные для АОСР.
            Работа: "${work.name}"
            ${existingMaterials ? `Материалы из сметы: ${existingMaterials}` : ''}
            Верни ТОЛЬКО JSON: {
              "materials": "Материал (ГОСТ/Сертификат)",
              "nextWorks": "какая работа обычно идет следующей",
              "standards": "основной СП или ГОСТ для этой работы"
            }`);
        } catch (e) {
          console.warn(`AI Analysis failed for work: ${work.name}, using fallback`, e);
          // Fallback logic for materials
          const materials = work.materials?.length ? work.materials.join(', ') : 'Материалы согласно проекту';
          aiData = {
            materials: materials,
            nextWorks: 'Следующий технологический этап',
            standards: 'СП 70.13330.2012' // Default standard for general construction
          };
        }
        
        newActs.push({
          id: Math.random().toString(36).substr(2, 9),
          number: (projects.find(p => p.id === activeProjectId)?.acts.length || 0) + newActs.length + 1 + '',
          workName: work.name,
          unit: work.unit,
          amount: work.amount,
          scheme: `Исполнительная схема №${(projects.find(p => p.id === activeProjectId)?.acts.length || 0) + newActs.length + 1}`,
          nextWorks: aiData.nextWorks || 'Следующий этап',
          materials: aiData.materials || 'Материалы не определены',
          startDate: '01', startMonth: 'марта', startYear: '2026',
          endDate: '10', endMonth: 'марта', endYear: '2026',
          standards: aiData.standards || 'СП ...'
        });
      }

      // Add new acts to current project
      if (activeProjectId) {
        setProjects(prev => prev.map(p => 
          p.id === activeProjectId 
            ? { ...p, acts: [...p.acts, ...newActs] } 
            : p
        ));
      }

      setPerformanceMetrics(prev => ({ ...prev, materialAnalysis: Date.now() - startTime }));
      setSubView('list'); // Go back to project view to see the register
      setView('mvp');
    } catch (error) {
      console.error("AI Analysis error:", error);
      setEstimateStep('mapping');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStart = () => {
    if (selectedVector === 3) {
      setView('mvp');
      setSubView('roadmap');
      setEstimateStep('upload');
      setCurrentActIndex(0);
    } else if (selectedVector === 6 || selectedVector === 7) {
      setView('mvp');
      setSubView('future-plan');
    } else if (selectedVector === 4) {
      setView('analysis');
    } else if (selectedVector === 1) {
      setView('business');
    } else if (selectedVector === 5) {
      setView('market');
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
      status: "ready",
      icon: <FileText className="w-5 h-5 text-blue-500" />
    },
    {
      id: 'cert-db',
      title: "База сертификатов",
      description: "Автоматический поиск и привязка сертификатов с petrovich.ru и других баз.",
      status: "planned",
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'ojr',
      title: "Цифровой ОЖР",
      description: "Ведение общего журнала работ через мобильное приложение. Фотофиксация и геолокация.",
      status: "in-progress",
      icon: <HardHat className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'registry',
      title: "Реестр ИД",
      description: "Автоматическое формирование реестра исполнительной документации и контроль комплектности.",
      status: "ready",
      icon: <Layers className="w-5 h-5 text-violet-500" />
    },
    {
      id: 'ai',
      title: "AI-валидатор",
      description: "Автоматическая проверка актов на соответствие СП и ГОСТ с помощью LLM.",
      status: "ready",
      icon: <Zap className="w-5 h-5 text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pb-24">
      {/* Navigation Bar */}
      <div className="max-w-6xl w-full flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer" onClick={() => setView('home')}>
          <HardHat className="w-6 h-6 text-blue-600" />
          <span>StroyDoc AI</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('profile')}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                <UserCheck className="w-5 h-5" />
                <span>{user?.name || 'Личный кабинет'}</span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Выйти"
              >
                <Download className="w-5 h-5 rotate-180" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setView('auth')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Войти
            </button>
          )}
        </div>
      </div>

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
        ) : view === 'auth' ? (
          <AuthView
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        ) : view === 'profile' ? (
          <ProfileView
            user={user}
            profileTab={profileTab}
            setProfileTab={setProfileTab}
            subView={subView}
            setSubView={setSubView}
            projects={projects}
            setProjects={setProjects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            activeProject={activeProject}
            updateActInProject={updateActInProject}
            deleteActFromProject={deleteActFromProject}
            handleCreateProject={handleCreateProject}
            view={view}
            setView={setView}
            actDetails={actDetails}
            setActDetails={setActDetails}
          />
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

            <MVPView
              onBack={() => setView('home')}
              subView={subView}
              setSubView={setSubView}
              setView={setView}
              setProfileTab={setProfileTab}
            />
            ) : subView === 'future-plan' ? (
              <div className="space-y-12 pb-20">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Векторы 6 и 7: Инфраструктура и Стек
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Гайд для фаундера: От идеи до Enterprise</h2>
                  <p className="text-xl text-slate-600 max-w-3xl">Как внедрять сложные технологии, если ты не программист, используя AI Studio как своего технического директора.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* AI Studio Prompting Guide */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-600" />
                        Как "программировать" через AI Studio
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Золотое правило промпта:
                          </h4>
                          <p className="text-sm text-indigo-800 italic">
                            "Роль + Контекст + Задача + Ограничения"
                          </p>
                          <div className="mt-3 p-3 bg-white rounded-lg text-xs font-mono text-slate-600 border border-indigo-200">
                            "Ты — Senior Fullstack разработчик. Мы строим SaaS для ИД. Добавь в личный кабинет таблицу со списком всех актов проекта, где можно менять статус (Черновик/Подписан). Используй Tailwind для стилей."
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h5 className="font-bold text-slate-900 text-sm mb-1">Если ошибка:</h5>
                            <p className="text-xs text-slate-500">Просто скопируй текст ошибки и напиши: "Исправь это. Ошибка возникает при нажатии на кнопку X".</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h5 className="font-bold text-slate-900 text-sm mb-1">Если нужно новое:</h5>
                            <p className="text-xs text-slate-500">"Добавь новый раздел 'Склады', где будет список материалов. Сделай его похожим на раздел 'Проекты'."</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Architecture for Non-Programmers */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-emerald-600" />
                        Твоя целевая архитектура (РФ-стек)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { title: "Frontend", tech: "React + Vite", desc: "То, что видит пользователь. Быстро и красиво.", icon: <Layout className="w-5 h-5" /> },
                          { title: "Backend", tech: "Node.js (NestJS)", desc: "Мозг системы. Обработка данных и логика.", icon: <Cpu className="w-5 h-5" /> },
                          { title: "Database", tech: "PostgreSQL", desc: "Память. Надежное хранение всех документов.", icon: <Database className="w-5 h-5" /> }
                        ].map((item, i) => (
                          <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-600">
                              {item.icon}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">{item.tech}</div>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-emerald-900 text-sm">Почему это РФ-стек?</h4>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Все эти технологии поддерживаются в **Yandex Cloud**. База данных PostgreSQL разворачивается в облаке Яндекса одним кликом, а сервера (Backend) работают на их мощностях в дата-центрах РФ.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enterprise Architecture Section */}
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <GitBranch className="w-6 h-6 text-blue-400" />
                            Профессиональная Архитектура (Enterprise)
                          </h3>
                          <p className="text-slate-400 text-sm">Принципы микросервисного подхода для бесшовного масштабирования.</p>
                        </div>
                        <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">
                          Senior Level
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Server className="w-4 h-4" />
                              </div>
                              <h4 className="font-bold text-sm">API Gateway (Единый вход)</h4>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Все запросы от фронтенда идут в одну точку. Шлюз сам распределяет их по сервисам, проверяет авторизацию и защищает от атак.
                            </p>
                          </div>

                          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Activity className="w-4 h-4" />
                              </div>
                              <h4 className="font-bold text-sm">Event Bus (Шина событий)</h4>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Сервисы общаются асинхронно. "Смета загружена" &rarr; Событие в шину &rarr; AI-сервис подхватил &rarr; Уведомление улетело пользователю.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Разделение на микросервисы (Домены):</h4>
                          <div className="space-y-3">
                            {[
                              { label: "Auth Service", desc: "Управление пользователями и правами.", color: "bg-violet-500" },
                              { label: "Project Service", desc: "Логика строек, контрагентов и объектов.", color: "bg-blue-500" },
                              { label: "Doc Service", desc: "Генерация АОСР, ОЖР и печатных форм.", color: "bg-emerald-500" },
                              { label: "AI Engine", desc: "Промпт-инжиниринг и связь с LLM.", color: "bg-amber-500" },
                              { label: "Storage Service", desc: "Облачное хранилище чертежей и фото.", color: "bg-rose-500" }
                            ].map((svc, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className={`w-1.5 h-1.5 rounded-full ${svc.color} mt-1.5 shrink-0`} />
                                <div>
                                  <div className="text-xs font-bold">{svc.label}</div>
                                  <div className="text-[10px] text-slate-500">{svc.desc}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                            <Workflow className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm mb-1">Clean Architecture (Чистая архитектура)</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Внутри каждого сервиса мы разделяем код на слои: **API** (внешний мир), **Domain** (бизнес-логика) и **Infrastructure** (база данных). Это позволяет заменить базу данных или AI-модель, не переписывая основную логику приложения.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* New Refactoring Task Card */}
                      <div className="mt-8 p-6 bg-blue-600 rounded-2xl shadow-xl border border-blue-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <Code2 className="w-20 h-20" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold flex items-center gap-2">
                              <FileCode className="w-5 h-5" />
                              Задание для AI Studio: Рефакторинг Архитектуры
                            </h4>
                            <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase">Prompt Ready</div>
                          </div>
                          <p className="text-sm text-blue-100 mb-6 max-w-xl">
                            Скопируй этот промпт и вставь его в чат, чтобы AI начал перестраивать приложение под профессиональную структуру.
                          </p>
                          
                          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Промпт для архитектора:</span>
                              <button 
                                onClick={() => {
                                  const promptText = `Ты — Senior Software Architect. Наша задача — перевести текущий прототип StroyDoc AI на архитектуру "Модульного монолита" с элементами Clean Architecture. 
1. Раздели код на логические модули: Auth (авторизация), Projects (управление стройками), Documents (генерация ИД), AI-Engine (связь с LLM).
2. В каждом модуле выдели слои: Domain (бизнес-логика и типы), Infrastructure (работа с внешними API и файлами), Application/API (обработка запросов).
3. Создай единую шину событий (Event Bus) для асинхронного взаимодействия между модулями.
4. Весь UI должен обращаться к модулям через строго определенные интерфейсы (Services/Gateways).
Начни с создания структуры папок и выноса логики парсинга смет в отдельный модуль "Documents".`;
                                  navigator.clipboard.writeText(promptText);
                                  alert("Промпт для рефакторинга скопирован!");
                                }}
                                className="text-[10px] text-blue-200 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                Копировать
                              </button>
                            </div>
                            <p className="text-[11px] font-mono text-blue-50 leading-relaxed italic line-clamp-2">
                              "Ты — Senior Software Architect. Наша задача — перевести текущий прототип StroyDoc AI на архитектуру 'Модульного монолита'..."
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-blue-200">
                            <Info className="w-3 h-3" />
                            <span>Это действие создаст фундамент для бесшовного удаления или замены любого модуля в будущем.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Implementation */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ListChecks className="w-6 h-6 text-blue-600" />
                        Твой план действий (Step-by-Step)
                      </h3>
                      
                      <div className="space-y-10 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {[
                          {
                            step: "Шаг 1: Лендинг и Сбор данных (Tilda)",
                            desc: "Твоя задача — получить первые контакты клиентов.",
                            tasks: [
                              "Собери лендинг на Tilda (тариф Personal).",
                              "В AI Studio напиши: 'Создай серверный роут /api/tilda-lead, который принимает POST запрос и сохраняет данные в массив'.",
                              "В Tilda укажи URL твоего приложения в поле Webhook."
                            ],
                            prompt: "Напиши API эндпоинт на Express для приема заявок с Тильды. Данные должны приходить в формате JSON и сохраняться в файл leads.json.",
                            icon: <Globe className="w-4 h-4" />,
                            color: "bg-blue-500"
                          },
                          {
                            step: "Шаг 2: База данных (Yandex Cloud)",
                            desc: "Переход от файлов к промышленной базе данных.",
                            tasks: [
                              "Создай Managed Service for PostgreSQL в консоли Yandex Cloud.",
                              "Получи строку подключения (Connection String).",
                              "В AI Studio напиши: 'Подключи библиотеку Prisma или TypeORM и настрой связь с БД PostgreSQL'."
                            ],
                            prompt: "Настрой подключение к PostgreSQL через Prisma. Создай модель Project с полями id, name, object и модель Act с полями id, workName, status.",
                            icon: <Database className="w-4 h-4" />,
                            color: "bg-emerald-500"
                          },
                          {
                            step: "Шаг 3: Личный кабинет и Роли",
                            desc: "Безопасность и разграничение прав доступа.",
                            tasks: [
                              "Попроси AI: 'Добавь страницу /login и функционал регистрации'.",
                              "Добавь поле 'role' пользователю (admin, engineer, foreman).",
                              "Настрой фильтрацию: 'Показывай проекты только того пользователя, который вошел в систему'."
                            ],
                            prompt: "Реализуй авторизацию через JWT. Создай защищенный роут /api/my-projects, который возвращает только проекты текущего пользователя.",
                            icon: <Lock className="w-4 h-4" />,
                            color: "bg-violet-500"
                          },
                          {
                            step: "Шаг 4: Интеграция YandexGPT",
                            desc: "Замена зарубежного AI на отечественный.",
                            tasks: [
                              "Получи Folder ID и API Key в Yandex Cloud.",
                              "Попроси AI: 'Напиши сервис для работы с YandexGPT API вместо OpenAI'.",
                              "Протестируй анализ смет через российскую модель."
                            ],
                            prompt: "Создай функцию callYandexGPT(prompt), которая отправляет запрос в YandexGPT API. Используй её для анализа материалов в смете.",
                            icon: <Cloud className="w-4 h-4" />,
                            color: "bg-indigo-600"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="relative pl-10">
                            <div className={`absolute left-0 top-0 w-8 h-8 ${item.color} text-white rounded-full flex items-center justify-center z-10 shadow-lg`}>
                              {item.icon}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900">{item.step}</h4>
                              <p className="text-xs text-slate-400 italic">{item.desc}</p>
                            </div>
                            
                            <div className="mt-4 space-y-3">
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Задачи для тебя:</span>
                                <ul className="space-y-1.5">
                                  {item.tasks.map((task, tIdx) => (
                                    <li key={tIdx} className="text-xs text-slate-600 flex items-start gap-2">
                                      <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Промпт для AI Studio:</span>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.prompt);
                                      alert("Промпт скопирован!");
                                    }}
                                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                  >
                                    <Share2 className="w-3 h-3" />
                                    Копировать
                                  </button>
                                </div>
                                <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.prompt}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-24 h-24" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        Чек-лист Фаундера
                      </h3>
                      <div className="space-y-4 relative z-10">
                        {[
                          { text: "Купить домен .ru", done: true },
                          { text: "Завести почту на домене", done: false },
                          { text: "Открыть кабинет в Yandex Cloud", done: false },
                          { text: "Сделать 10 звонков клиентам", done: false },
                          { text: "Собрать 3 примера реальных смет", done: true }
                        ].map((check, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-3 text-sm">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${check.done ? 'bg-emerald-500 border-emerald-500' : 'border-indigo-400'}`}>
                              {check.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={check.done ? 'text-indigo-300 line-through' : 'text-indigo-100'}>{check.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                      <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Твоя роль в проекте:
                      </h4>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Ты — **Архитектор смыслов**. Не трать время на изучение синтаксиса кода. Твоя задача:
                        <br /><br />
                        1. Понимать, как данные текут от прораба к акту.
                        <br />
                        2. Знать, какие поля должны быть в базе.
                        <br />
                        3. Уметь объяснить AI, какой результат ты хочешь видеть.
                      </p>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg border border-slate-800">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-400" />
                        Технический стек (РФ)
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Облако:</span>
                          <span className="font-bold">Yandex Cloud</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">База данных:</span>
                          <span className="font-bold">PostgreSQL 15</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">AI Модель:</span>
                          <span className="font-bold">YandexGPT 3</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">ОС Сервера:</span>
                          <span className="font-bold">Astra Linux</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : subView === 'certificates' ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">База сертификатов</h2>
                    <p className="text-slate-600">Автоматический поиск и хранение паспортов качества и сертификатов.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={async () => {
                        setIsParsingCerts(true);
                        await sleep(3000); // Simulate parsing
                        const newCert = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: 'Труба стальная электросварная d57x3.5',
                          provider: 'Петрович',
                          date: new Date().toLocaleDateString(),
                          file: 'cert_pipe_57.pdf',
                          status: 'active'
                        };
                        setCertificates(prev => [newCert, ...prev]);
                        setIsParsingCerts(false);
                      }}
                      disabled={isParsingCerts}
                      className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isParsingCerts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Парсить Petrovich.ru
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Добавить вручную
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                        <th className="p-4">Наименование материала</th>
                        <th className="p-4">Источник</th>
                        <th className="p-4">Дата загрузки</th>
                        <th className="p-4">Файл</th>
                        <th className="p-4 text-center">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificates.map(cert => (
                        <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-900">{cert.name}</td>
                          <td className="p-4 text-slate-500 text-sm">{cert.provider}</td>
                          <td className="p-4 text-slate-500 text-sm">{cert.date}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                              <FileText className="w-4 h-4" />
                              {cert.file}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : subView === 'projects' ? (
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
                          <span>{project.acts.length} актов</span>
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
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>{activeProject?.name}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Реестр актов (АОСР)</h2>
                    <p className="text-slate-500 text-sm">Управляйте перечнем актов, редактируйте данные и выгружайте документы.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setSubView('estimate-detail');
                        setEstimateStep('upload');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить из сметы
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Экспорт реестра
                    </button>
                  </div>
                </div>

                {/* Interactive Register Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="p-3 border-r border-slate-200 w-10 text-center">№</th>
                          <th className="p-3 border-r border-slate-200 w-64">Выполненные работы</th>
                          <th className="p-3 border-r border-slate-200 w-32">Схема</th>
                          <th className="p-3 border-r border-slate-200 w-48">Разрешаются работы</th>
                          <th className="p-3 border-r border-slate-200 w-64">Материалы и сертификаты</th>
                          <th className="p-3 border-r border-slate-200 w-24">Начало</th>
                          <th className="p-3 border-r border-slate-200 w-24">Конец</th>
                          <th className="p-3 border-r border-slate-200 w-32">Норматив</th>
                          <th className="p-3 text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeProject?.acts.map((act) => (
                          <tr key={act.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="p-2 border-r border-slate-200">
                              <input 
                                className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 text-center"
                                value={act.number}
                                onChange={(e) => updateActInProject(act.id, 'number', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <textarea 
                                rows={2}
                                className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 resize-none"
                                value={act.workName}
                                onChange={(e) => updateActInProject(act.id, 'workName', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input 
                                className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1"
                                value={act.scheme}
                                onChange={(e) => updateActInProject(act.id, 'scheme', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <textarea 
                                rows={2}
                                className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 resize-none"
                                value={act.nextWorks}
                                onChange={(e) => updateActInProject(act.id, 'nextWorks', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="relative group/cert">
                                <textarea 
                                  rows={2}
                                  className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 resize-none pr-6"
                                  value={act.materials}
                                  onChange={(e) => updateActInProject(act.id, 'materials', e.target.value)}
                                />
                                <button 
                                  onClick={() => setSubView('certificates')}
                                  className="absolute right-0 top-0 p-1 text-amber-500 opacity-0 group-hover/cert:opacity-100 transition-opacity"
                                  title="Найти сертификат в базе"
                                >
                                  <Search className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="flex gap-1">
                                <input className="w-4 bg-transparent outline-none text-center" value={act.startDate} onChange={(e) => updateActInProject(act.id, 'startDate', e.target.value)} />
                                <input className="w-12 bg-transparent outline-none" value={act.startMonth} onChange={(e) => updateActInProject(act.id, 'startMonth', e.target.value)} />
                              </div>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="flex gap-1">
                                <input className="w-4 bg-transparent outline-none text-center" value={act.endDate} onChange={(e) => updateActInProject(act.id, 'endDate', e.target.value)} />
                                <input className="w-12 bg-transparent outline-none" value={act.endMonth} onChange={(e) => updateActInProject(act.id, 'endMonth', e.target.value)} />
                              </div>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <input 
                                className="w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1"
                                value={act.standards}
                                onChange={(e) => updateActInProject(act.id, 'standards', e.target.value)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                onClick={() => {
                                  setActDetails(prev => ({
                                    ...prev,
                                    materials: act.materials,
                                    workName: act.workName,
                                    projectDoc: act.standards,
                                    nextWorks: act.nextWorks,
                                    startDate: act.startDate,
                                    startMonth: act.startMonth,
                                    endDate: act.endDate,
                                    endMonth: act.endMonth
                                  }));
                                  setEstimateStep('preview');
                                  setSubView('estimate-detail');
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Открыть акт"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteActFromProject(act.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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
                            <textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.object} onChange={(e) => setActDetails({...actDetails, object: e.target.value})} />
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
                          <textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" value={actDetails.zakazchik}
                            onChange={(e) => setActDetails({...actDetails, zakazchik: e.target.value})}
                          />
                          <div className="text-[6px] text-center italic leading-none">
                            (фамилия, имя, отчество (последнее - при наличии), адрес места жительства, ОГРНИП, ИНН индивидуального предпринимателя, полное и (или) сокращенное наименование, ОГРН, ИНН, адрес юридического лица в пределах его нахождения, телефон или факс,
                          </div>
                          <input 
                            className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50" 
                            value={actDetails.zakazchikSro}
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
                            value={actDetails.stroiteli}
                            onChange={(e) => setActDetails({...actDetails, stroiteli: e.target.value})}
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
                            value={actDetails.stroiteliSro}
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
                            value={actDetails.projectirovshik}
                            onChange={(e) => setActDetails({...actDetails, projectirovshik: e.target.value})}
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
                            value={actDetails.projectirovshikSro}
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
                              value={actDetails.zakazchik1}
                              onChange={(e) => setActDetails({...actDetails, zakazchik1: e.target.value})}
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
                              value={actDetails.stroiteli11}
                              onChange={(e) => setActDetails({...actDetails, stroiteli11: e.target.value})}
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
                              value={actDetails.stroiteli12}
                              onChange={(e) => setActDetails({...actDetails, stroiteli12: e.target.value})}
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
                              value={actDetails.projectirovshik1}
                              onChange={(e) => setActDetails({...actDetails, projectirovshik1: e.target.value})}
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
                              value={actDetails.stroiteli3}
                              onChange={(e) => setActDetails({...actDetails, stroiteli3: e.target.value})}
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
                            {actDetails.stroiteli.split(',')[0]}
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
                              {actDetails.workName || (selectedRows.length > 0 ? (
                                estimateData.find(r => r.id === selectedRows[currentActIndex])?.name
                              ) : 'Работы не выбраны')}
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
                              value={actDetails.shema}
                              onChange={(e) => setActDetails({...actDetails, shema: e.target.value})}
                            />
                            <div className="font-bold mt-2">Результаты испытаний:</div>
                            <textarea
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                              value={actDetails.ispitaniya}
                              onChange={(e) => setActDetails({...actDetails, ispitaniya: e.target.value})}
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
                            { label: "Представитель застройщика, технического заказчика...", name: actDetails.zakazchik1.split(',')[1]?.trim() || "Иванов И.И." },
                            { label: "Представитель лица, осуществляющего строительство...", name: actDetails.stroiteli11.split(',')[1]?.trim() || "Петров П.П." },
                            { label: "Представитель лица, осуществляющего строительство, по вопросам СК...", name: actDetails.stroiteli12.split(',')[1]?.trim() || "Сидоров С.С." },
                            { label: "Представитель лица, осуществляющего подготовку проектной документации...", name: actDetails.projectirovshik1.split(',')[1]?.trim() || "Кузнецов А.С." },
                            { label: "Представитель лица, выполнившего работы, подлежащие освидетельствованию...", name: actDetails.stroiteli3.split(',')[1]?.trim() || "Васильев И.Н." }
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
