/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, ActDetail } from '../../shared/domain/types';
import { mockProjects } from '../infrastructure/mockProjects';
import { eventBus } from '../../shared/infrastructure/eventBus';

export interface FetchProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'oldest';
}

export interface FetchProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProjectService {
  private projects: Project[] = [];

  async fetchMyProjects(params: FetchProjectsParams = {}): Promise<FetchProjectsResponse> {
    const { page = 1, limit = 10, search = '', sort = 'newest' } = params;
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sort
    }).toString();

    const response = await fetch(`/api/my-projects?${query}`);
    if (!response.ok) throw new Error('Failed to fetch projects');

    try {
      const result = await response.json();

      // Handle the old un-paginated array if it comes up (e.g. during transitions)
      if (Array.isArray(result)) {
        this.projects = result;
        return {
          data: result,
          total: result.length,
          page: 1,
          limit: result.length || 10,
          totalPages: 1
        };
      }

      // Handle the new paginated structure
      this.projects = result.data;
      return result as FetchProjectsResponse;
    } catch (err) {
      console.error('JSON parse error in fetchMyProjects:', err);
      this.projects = [];
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    }
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
