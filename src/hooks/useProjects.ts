import { useState, useEffect } from 'react';
import { projectService } from '../modules/projects/application/projectService';
import { Project, ActDetail } from '../modules/shared/domain/types';

export const useProjects = (isAuthenticated: boolean) => {
  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      projectService.fetchMyProjects().then(setProjects);
    }
  }, [isAuthenticated]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

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

  const handleCreateProject = async (newProject: Partial<Project>, onSuccess: (project: Project) => void) => {
    try {
      const project = await projectService.addProject(newProject);
      setProjects([...projectService.getProjects()]);
      setActiveProjectId(project.id);
      onSuccess(project);
    } catch (err) {
      console.error(err);
      alert('Ошибка создания проекта');
    }
  };

  return {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    updateActInProject,
    deleteActFromProject,
    handleCreateProject
  };
};
