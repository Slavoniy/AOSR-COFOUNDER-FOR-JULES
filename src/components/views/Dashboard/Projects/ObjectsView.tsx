import React, { useState, useEffect } from 'react';
import { useProjects } from '../../../../hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, FolderOpen, Search, Filter } from 'lucide-react';
import { projectService } from '../../../../modules/projects/application/projectService';
import { Project } from '../../../../modules/shared/domain/types';
import { Pagination } from "../../../ui/Pagination";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectFilters } from "./components/ProjectFilters";
import { ProjectSkeleton } from "./components/ProjectSkeleton";
import { ProjectEmptyState } from "./components/ProjectEmptyState";

interface ObjectsViewProps {
  user: any;
}

export const ObjectsView: React.FC<ObjectsViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const { handleCreateProject } = useProjects(!!user);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  // Pagination & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObjectName, setNewObjectName] = useState('');
  const [newObjectAddress, setNewObjectAddress] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated data
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await projectService.fetchMyProjects({
          page,
          limit,
          search: debouncedSearch,
          sort
        });
        setProjects(response.data || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProjects();
  }, [user, page, debouncedSearch, sort]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectName.trim() || !newObjectAddress.trim()) return;

    await handleCreateProject(
      { name: newObjectName.trim(), object: newObjectAddress.trim() },
      (project) => {
        setIsModalOpen(false);
        setNewObjectName('');
        setNewObjectAddress('');
        navigate(`/dashboard/objects/${project.id}`);
      }
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Объекты</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать объект
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
<ProjectFilters search={search} onSearch={setSearch} sort={sort} onSort={setSort as any} />

        <div className="flex-1 overflow-auto p-4 flex flex-col">
          {loading ? (
    <ProjectSkeleton />
          ) : (projects || []).length === 0 ? (
    <ProjectEmptyState debouncedSearch={debouncedSearch} onOpenModal={() => setIsModalOpen(true)} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                 {(projects || []).map(project => (
                   <ProjectCard key={project.id} project={project} onSelect={(id) => navigate(`/dashboard/objects/${id}`)} />
                 ))}
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => {
            setIsModalOpen(false);
            setCreateError(null);
            setNewProject({ name: '', object: '' });
          }}
          onSubmit={handleCreateProject}
          isLoading={isCreating}
          error={createError}
        />
      )}
    </div>
  );
};
