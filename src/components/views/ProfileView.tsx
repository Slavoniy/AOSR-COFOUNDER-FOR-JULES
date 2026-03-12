import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, Users, Zap, Building2, MapPin, ArrowLeft, Plus, Trash2,
  FileText, CheckCircle2, Search, Download, Loader2, Upload,
  Info, ShieldCheck
} from 'lucide-react';
import { Project, ActDetail } from '../../modules/shared/domain/types';
import { aiService } from '../../modules/ai-engine/infrastructure/aiService';
import { documentService } from '../../modules/documents/application/documentService';
import { EstimateModuleView } from './EstimateModuleView';

interface ProfileViewProps {
  user: any;
  profileTab: 'projects' | 'estimates';
  setProfileTab: (tab: 'projects' | 'estimates') => void;
  subView: 'list' | 'estimate-detail' | 'projects' | 'create-project' | 'roadmap' | 'certificates' | 'future-plan';
  setSubView: (view: 'list' | 'estimate-detail' | 'projects' | 'create-project' | 'roadmap' | 'certificates' | 'future-plan') => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeProject: Project | null;
  updateActInProject: (actId: string, field: keyof ActDetail, value: string) => void;
  deleteActFromProject: (actId: string) => void;
  handleCreateProject: (newProject: Partial<Project>, onSuccess: (p: Project) => void) => Promise<void>;
  view: string;
  setView: (view: string) => void;
  actDetails: any;
  setActDetails: React.Dispatch<React.SetStateAction<any>>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user, profileTab, setProfileTab, subView, setSubView, projects, setProjects,
  activeProjectId, setActiveProjectId, activeProject, updateActInProject, deleteActFromProject, handleCreateProject, view, setView, actDetails, setActDetails
}) => {
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '', object: '',
    developer: { name: '', requisites: '', sro: '' },
    contractor: { name: '', requisites: '', sro: '' },
    designer: { name: '', requisites: '', sro: '' },
    participants: { repDeveloper: '', repContractor: '', repContractorSk: '', repDesigner: '', repSubcontractor: '' }
  });



  const submitProject = async () => {
    await handleCreateProject(newProject, (project) => {
      if (view === 'profile') {
        setProfileTab('projects');
        setSubView('list');
      } else {
        setSubView('list');
      }
      setActDetails((prev: any) => ({
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
    });
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl w-full space-y-8 mt-8"
    >

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Личный кабинет</h2>
          <p className="text-slate-500">Управление вашими актами и проектами</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-bold text-slate-900">{user?.name}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
            {user?.name?.[0]}
          </div>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => { setProfileTab('projects'); setActiveProjectId(null); setSubView('projects'); }}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${profileTab === 'projects' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Briefcase className="w-4 h-4" /> Мои проекты
        </button>
        <button
          onClick={() => { setProfileTab('estimates'); setSubView('estimates-home'); }}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${profileTab === 'estimates' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Zap className="w-4 h-4" /> Сметный модуль
        </button>
      </div>

      {subView === 'estimate-detail' ? (
        <EstimateModuleView
          activeProject={activeProject}
          activeProjectId={activeProjectId}
          projects={projects}
          setProjects={setProjects}
          actDetails={actDetails}
          setActDetails={setActDetails}
          onBack={() => { setSubView('list'); setProfileTab('projects'); }}
          onComplete={() => { setSubView('list'); setProfileTab('projects'); }}
          initialStep={actDetails.workName && subView !== 'estimates-home' && profileTab !== 'estimates' ? 'preview' : 'upload'}
        />
      ) : profileTab === 'projects' ? (        <div className="space-y-8">
          {activeProject ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeProject.name}</h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{activeProject.object}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveProjectId(null)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Все проекты
                  </button>
                  <div className="h-8 w-px bg-slate-200 mx-2" />
                  <button
                    onClick={() => setProfileTab('estimates')}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Сметный модуль
                  </button>
                </div>
              </div>

              <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                  onClick={() => setSubView('list')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${subView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Реестр актов
                </button>
                <button
                  onClick={() => setSubView('future-plan')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${subView === 'future-plan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Детали и участники
                </button>
              </div>

              {subView === 'list' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="text-slate-400 text-sm font-medium mb-1">Всего актов</div>
                      <div className="text-3xl font-bold text-slate-900">{activeProject.acts.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="text-slate-400 text-sm font-medium mb-1">В работе</div>
                      <div className="text-3xl font-bold text-orange-500">{activeProject.acts.filter(a => a.status === 'draft').length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="text-slate-400 text-sm font-medium mb-1">Подписано</div>
                      <div className="text-3xl font-bold text-emerald-500">{activeProject.acts.filter(a => a.status === 'signed').length}</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Реестр актов проекта</h3>
                      <button
                        onClick={() => { setSubView('estimate-detail');  }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Добавить акт
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="p-3 border-r border-slate-200 w-10 text-center">№</th>
                            <th className="p-3 border-r border-slate-200 w-64">Выполненные работы</th>
                            <th className="p-3 border-r border-slate-200 w-48">Разрешаются работы</th>
                            <th className="p-3 border-r border-slate-200 w-24">Начало</th>
                            <th className="p-3 border-r border-slate-200 w-24">Конец</th>
                            <th className="p-3 border-r border-slate-200 w-32">Статус</th>
                            <th className="p-3 text-center">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeProject.acts.map((act) => (
                            <tr key={act.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">{act.number}</td>
                              <td className="p-2 border-r border-slate-200"><div className="font-medium text-slate-900">{act.workName}</div></td>
                              <td className="p-2 border-r border-slate-200 text-slate-500 italic">{act.nextWorks}</td>
                              <td className="p-2 border-r border-slate-200 text-slate-600">{act.startDate} {act.startMonth}</td>
                              <td className="p-2 border-r border-slate-200 text-slate-600">{act.endDate} {act.endMonth}</td>
                              <td className="p-2 border-r border-slate-200">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${act.status === 'signed' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                                  {act.status === 'signed' ? 'Подписан' : 'Черновик'}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setActDetails((prev: any) => ({ ...prev, ...act, projectDoc: act.standards }));

                                      setSubView('estimate-detail');
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteActFromProject(act.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {activeProject.acts.length === 0 && (
                            <tr><td colSpan={7} className="p-12 text-center text-slate-400 italic">В этом проекте пока нет актов. Добавьте их из сметы или вручную.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" /> Организации проекта
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Застройщик</div>
                        <div className="font-bold text-slate-900">{activeProject.developer.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{activeProject.developer.sro}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Генподрядчик</div>
                        <div className="font-bold text-slate-900">{activeProject.contractor.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{activeProject.contractor.sro}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Проектировщик</div>
                        <div className="font-bold text-slate-900">{activeProject.designer.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{activeProject.designer.sro}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" /> Ответственные лица
                    </h3>
                    <div className="space-y-4">
                      {['repDeveloper', 'repContractor', 'repContractorSk'].map((role, idx) => {
                        const rolesMap: any = { repDeveloper: 'Технадзор Заказчика', repContractor: 'Прораб Подрядчика', repContractorSk: 'Технадзор Подрядчика' };
                        const name = (activeProject.participants as any)[role];
                        const initials = name.split(' ').pop()?.charAt(0) || 'У';
                        const colors = ['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-emerald-100 text-emerald-600'];
                        return (
                          <div key={idx} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                            <div className={`w-10 h-10 ${colors[idx]} rounded-full flex items-center justify-center font-bold shrink-0`}>
                              {initials}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">{rolesMap[role]}</div>
                              <div className="font-bold text-slate-900">{name}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : subView === 'create-project' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">Создание нового проекта</h2>
                  <p className="text-slate-600">Заполните основные данные объекта и реквизиты участников.</p>
                </div>
                <button
                  onClick={() => setSubView('projects')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Назад к списку
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /> Основная информация</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Название проекта (для списка)</label>
                      <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder='Напр: ЖК "Горизонт" - Корпус 1' value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Полный адрес объекта (для АОСР)</label>
                      <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24" placeholder="г. Москва, ул. Строителей, д. 10, корп. 2..." value={newProject.object} onChange={(e) => setNewProject({...newProject, object: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" /> Организации и реквизиты</h3>
                  <div className="space-y-6">
                    {['developer', 'contractor', 'designer'].map((role) => {
                      const titles: any = { developer: 'Застройщик / Техзаказчик', contractor: 'Генподрядчик', designer: 'Проектировщик' };
                      return (
                        <div key={role} className="p-6 bg-slate-50 rounded-2xl space-y-4">
                          <h4 className="font-bold text-slate-700">{titles[role]}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" placeholder="Название компании" value={(newProject as any)[role]?.name} onChange={(e) => setNewProject({...newProject, [role]: {...(newProject as any)[role], name: e.target.value}})} />
                            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" placeholder="СРО (номер, ОГРН)" value={(newProject as any)[role]?.sro} onChange={(e) => setNewProject({...newProject, [role]: {...(newProject as any)[role], sro: e.target.value}})} />
                            <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none md:col-span-2 h-20" placeholder="Реквизиты (ОГРН, ИНН, Адрес, Тел)" value={(newProject as any)[role]?.requisites} onChange={(e) => setNewProject({...newProject, [role]: {...(newProject as any)[role], requisites: e.target.value}})} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Участники и подписи</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['repDeveloper', 'repContractor', 'repContractorSk', 'repDesigner'].map(role => {
                      const titles: any = { repDeveloper: 'Представитель Заказчика (Технадзор)', repContractor: 'Представитель Подрядчика (Прораб)', repContractorSk: 'Представитель Подрядчика (Технадзор)', repDesigner: 'Представитель Проектировщика (Авторский надзор)' };
                      return (
                        <div key={role} className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{titles[role]}</label>
                          <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Должность, ФИО, НРС, Приказ..." value={(newProject.participants as any)?.[role]} onChange={(e) => setNewProject({...newProject, participants: {...newProject.participants!, [role]: e.target.value}})} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-end">
                  <button onClick={submitProject} disabled={!newProject.name || !newProject.object} className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                    Создать проект и начать работу
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">Мои проекты</h2>
                  <p className="text-slate-600">Управляйте вашими строительными объектами и участниками.</p>
                </div>
                <button onClick={() => setSubView('create-project')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Новый проект
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(projects || []).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setProfileTab('projects');
                      setSubView('list');
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
                      <div className="flex items-center gap-1"><FileText className="w-3 h-3" /><span>{project.acts.length} актов</span></div>
                      <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>{Object.keys(project.participants).length} участн.</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : profileTab === 'estimates' ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-8 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Zap className="w-12 h-12" />
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              <h3 className="text-3xl font-bold text-slate-900">Сметный модуль AI</h3>
              <p className="text-slate-600 leading-relaxed">
                Загрузите смету в формате Excel или PDF. Наш ИИ автоматически распознает виды работ,
                сгруппирует их и подготовит черновики АОСР с привязкой к материалам и сертификатам.
              </p>
            </div>

            {activeProject && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 max-w-md mx-auto flex items-center gap-4 text-left">
                <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase">Активный проект</div>
                  <div className="font-bold text-slate-900">{activeProject.name}</div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => { setSubView('estimate-detail'); setProfileTab('estimates'); }}
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" /> Загрузить смету
              </button>
              <button
                onClick={() => { setActDetails({ ...actDetails, workName: '' }); setSubView('estimate-detail'); setProfileTab('estimates'); }}
                className="w-full sm:w-auto px-10 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Создать вручную
              </button>
            </div>
        </div>
      ) : null}
    </motion.div>
  );
};
