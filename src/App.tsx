/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ChevronRight, HardHat, FileText,
  Settings, Zap, ShieldCheck,
  Download, Plus, Trash2, Search, Building2, Info, Loader2, Upload,
  UserCheck, CheckCircle2, ArrowLeft
} from 'lucide-react';

// Modular Imports
import { Vector, Project, ActDetail, EstimateItem, Certificate } from './modules/shared/domain/types';
import { documentService } from './modules/documents/application/documentService';
import { aiService } from './modules/ai-engine/infrastructure/aiService';
import { eventBus } from './modules/shared/infrastructure/eventBus';
import { authService } from './modules/auth/application/authService';
import { projectService } from './modules/projects/application/projectService';
import { mockProjects } from './modules/projects/infrastructure/mockProjects';

import { VECTORS } from './modules/shared/domain/constants';

import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHomeView } from './components/views/Dashboard/DashboardHomeView';
import { ObjectsView } from './components/views/Dashboard/ObjectsView';
import { ObjectDetailView } from './components/views/Dashboard/ObjectDetailView';
import { RegistryView } from './components/views/Dashboard/RegistryView';
import { DictionariesView } from './components/views/Dashboard/DictionariesView';
import { SettingsView } from './components/views/Dashboard/SettingsView';
import { HomeView } from './components/views/HomeView';

import { ProfileView } from './components/views/ProfileView';
import { MVPView } from './components/views/MVPView';
import { AuthView } from './components/views/AuthView';


const vectors = VECTORS;

export default function App() {
  const [view, setView] = useState<'home' | 'mvp' | 'auth' | 'profile'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileTab, setProfileTab] = useState<'projects' | 'estimates'>('projects');
  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());

  const [subView, setSubView] = useState<'list' | 'estimate-detail' | 'projects' | 'create-project' | 'roadmap' | 'certificates' | 'future-plan'>('list');
  const [selectedVector, setSelectedVector] = useState<number | null>(null);
  const [currentActIndex, setCurrentActIndex] = useState(0);

  const [certificates, setCertificates] = useState<any[]>([
    { id: '1', name: 'Бетон Б25 П4 W6 F150', provider: 'Петрович', date: '12.01.2026', file: 'cert_beton_01.pdf', status: 'active' },
    { id: '2', name: 'Арматура А500С d12', provider: 'Петрович', date: '05.02.2026', file: 'cert_arm_12.pdf', status: 'active' },
  ]);
  const [isParsingCerts, setIsParsingCerts] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProject = projects.find(p => p.id === activeProjectId);

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
  const [uploadProgress, setUploadProgress] = useState<{ processed: number, total: number } | null>(null);

  useEffect(() => {
    const handleProgress = (data: any) => {
      setUploadProgress({ processed: data.chunkIndex, total: data.totalChunks });
      setEstimateData(data.accumulatedData);
      setEstimateStep('selection');
    };
    eventBus.on('document:parsing:progress', handleProgress);
    return () => eventBus.off('document:parsing:progress', handleProgress);
  }, []);

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
    setUploadProgress(null);
    const startTime = Date.now();
    try {
      setActDetails(prev => ({ ...prev, workName: '' }));
      const response = await documentService.parseEstimate(file);
      
      const respData = response as any;
      const dataArray = Array.isArray(respData) ? respData : respData.data;

      setPerformanceMetrics(prev => ({ ...prev, estimateParsing: Date.now() - startTime }));
      setEstimateData(dataArray);
      setEstimateStep('selection');
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Ошибка при чтении файла.");
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(null);
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
    }
  };

  const toggleRow = (id: number) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedRows.length === estimateData.length) setSelectedRows([]);
    else setSelectedRows(estimateData.map(r => r.id));
  };



  // For standard existing non-authenticated views, we can use a wrapper component
  // to avoid rewriting all the view prop logic.


  const PublicApp = () => {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pb-24">
        {/* Navigation Bar */}
        <div className="max-w-6xl w-full flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer" onClick={() => setView('home')}>
            <HardHat className="w-6 h-6 text-blue-600" />
            <span>StroyDoc AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setAuthMode('login');
                setView('auth');
              }}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Вход
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setView('auth');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Content View */}
        {view === 'mvp' ? (
          <MVPView setView={setView} vector={vectors[2]} />
        ) : view === 'auth' ? (
          <AuthView
            authMode={authMode}
            setAuthMode={setAuthMode}
            setView={setView}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        ) : (
          <HomeView onSelectVector={(id) => {
            if (id === 3) setView('mvp');
            else alert('Этот вектор пока недоступен');
          }} selectedVector={null} />
        )}
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={<DashboardLayout user={user} onLogout={handleLogout} />}>
              <Route index element={<DashboardHomeView />} />
              <Route path="objects" element={<ObjectsView user={user} />} />
              <Route path="objects/:id" element={<ObjectDetailView user={user} />} />
              <Route path="registry" element={<RegistryView user={user} />} />
              <Route path="dictionaries" element={<DictionariesView user={user} />} />
              <Route path="settings" element={<SettingsView user={user} />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          /* Public Routes */
          <>
            <Route path="/" element={<PublicApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
