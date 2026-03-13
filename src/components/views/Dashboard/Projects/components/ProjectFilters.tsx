import React from 'react';
import { Search, Filter } from 'lucide-react';

export const ProjectFilters = ({ search, onSearch, sort, onSort }: any) => (
  <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
    <div className="relative w-full sm:w-72">
      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
      />
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Filter className="w-4 h-4 text-gray-500" />
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
      >
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
      </select>
    </div>
  </div>
);
