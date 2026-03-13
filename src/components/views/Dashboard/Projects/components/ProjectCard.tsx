
import React from 'react';
import { Building2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Project } from '../../../../modules/shared/domain/types';
import { motion } from 'motion/react';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => (
  <motion.button
    key={project.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, scale: 1.005 }}
    onClick={() => onSelect(project.id)}
    className="w-full text-left bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
  >
    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 transform origin-left scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500 max-w-2xl line-clamp-1 mb-4">
            {project.object || 'Адрес не указан'}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              <span>Смет: <strong className="text-gray-900">{project.data?.estimates?.length || 0}</strong></span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  </motion.button>
);
