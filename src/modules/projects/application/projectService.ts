/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, ActDetail } from '../../shared/domain/types';
import { mockProjects } from '../infrastructure/mockProjects';
import { eventBus } from '../../shared/infrastructure/eventBus';

export class ProjectService {
  private projects: Project[] = [];

  async fetchMyProjects(): Promise<Project[]> {
    const response = await fetch('/api/my-projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    this.projects = await response.json();
    return this.projects;
  }

  getProjects(): Project[] {
    return this.projects;
  }

  async addProject(project: Partial<Project>): Promise<Project> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error('Failed to create project');
    const newProject = await response.json();
    this.projects.push(newProject);
    return newProject;
  }

  async updateActStatus(actId: string, status: 'draft' | 'signed'): Promise<void> {
    const response = await fetch(`/api/acts/${actId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    
    // Update local state
    this.projects = this.projects.map(p => ({
      ...p,
      acts: p.acts.map(a => a.id === actId ? { ...a, status } : a)
    }));
  }
}

export const projectService = new ProjectService();
